import { createServer, type IncomingMessage } from "node:http";
import { INCREMENT_RATE_LIMIT_SCRIPT } from "@/utils/rate-limit";

type Value = string | Map<string, string>;
type Entry = { value: Value; expiresAt: number | null };
type Command = [string, ...(string | number)[]];

// A small in-memory stand-in for the Upstash Redis REST API, enough for the
// caches, counters and rate limits the demo touches. Lua scripts are not
// interpreted: only the rate limiter's script is recognized and run natively.
// Other commands (other scripts, pub/sub, sorted sets) get an error reply
// straight away, which callers already treat as Redis being unavailable.
export function createMemoryRedis() {
  const store = new Map<string, Entry>();

  function read(key: string) {
    const entry = store.get(key);
    if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return;
    }
    return entry;
  }

  function readHash(key: string) {
    const entry = read(key);
    if (!entry) {
      const value = new Map<string, string>();
      store.set(key, { value, expiresAt: null });
      return value;
    }
    if (typeof entry.value === "string") throw new Error("WRONGTYPE");
    return entry.value;
  }

  function incrementBy(key: string, delta: number) {
    const entry = read(key);
    const next = Number(entry?.value ?? 0) + delta;
    store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt ?? null,
    });
    return next;
  }

  function set(key: string, value: string, options: string[]) {
    const flags = options.map((option) => option.toUpperCase());
    const seconds = flags.indexOf("EX");
    const milliseconds = flags.indexOf("PX");
    let expiresAt: number | null = null;
    if (seconds >= 0)
      expiresAt = Date.now() + Number(options[seconds + 1]) * 1000;
    else if (milliseconds >= 0)
      expiresAt = Date.now() + Number(options[milliseconds + 1]);

    const exists = read(key) !== undefined;
    if ((flags.includes("NX") && exists) || (flags.includes("XX") && !exists))
      return null;
    store.set(key, { value, expiresAt });
    return "OK";
  }

  // EVAL script numkeys key... arg...
  function evaluate([script, keyCount, ...rest]: string[]) {
    if (script !== INCREMENT_RATE_LIMIT_SCRIPT) {
      throw new Error("ERR this script is not supported by the demo");
    }
    const [key] = rest.slice(0, Number(keyCount));
    const [windowSeconds] = rest.slice(Number(keyCount));
    const count = incrementBy(key, 1);
    if (count === 1) run(["expire", key, windowSeconds]);
    return count;
  }

  function run([name, ...rawArgs]: Command): unknown {
    const args = rawArgs.map(String);
    const [key] = args;
    switch (name.toLowerCase()) {
      case "ping":
        return "PONG";
      case "get": {
        const value = read(key)?.value;
        if (value instanceof Map) throw new Error("WRONGTYPE");
        return value ?? null;
      }
      case "set":
        return set(key, args[1], args.slice(2));
      case "del":
      case "unlink":
        return args.filter((name) => read(name) && store.delete(name)).length;
      case "exists":
        return args.filter((name) => read(name)).length;
      case "expire": {
        const entry = read(key);
        if (!entry) return 0;
        entry.expiresAt = Date.now() + Number(args[1]) * 1000;
        return 1;
      }
      case "incr":
        return incrementBy(key, 1);
      case "incrby":
        return incrementBy(key, Number(args[1]));
      case "hget":
        return readHash(key).get(args[1]) ?? null;
      case "hset": {
        const hash = readHash(key);
        let added = 0;
        for (let index = 1; index < args.length; index += 2) {
          if (!hash.has(args[index])) added++;
          hash.set(args[index], args[index + 1]);
        }
        return added;
      }
      case "hincrby":
      case "hincrbyfloat": {
        const hash = readHash(key);
        const next = Number(hash.get(args[1]) ?? 0) + Number(args[2]);
        hash.set(args[1], String(next));
        return name.toLowerCase() === "hincrby" ? next : String(next);
      }
      case "hgetall":
        return [...(read(key) ? readHash(key) : new Map())].flat();
      case "hdel": {
        const hash = readHash(key);
        return args.slice(1).filter((field) => hash.delete(field)).length;
      }
      case "eval":
        return evaluate(args);
      default:
        throw new Error(`ERR ${name} is not supported by the demo`);
    }
  }

  function execute(command: Command) {
    try {
      return { result: run(command) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return { execute };
}

export async function startMemoryRedisServer(port: number) {
  const redis = createMemoryRedis();
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    const base64 = request.headers["upstash-encoding"] === "base64";
    const reply = (command: Command) => {
      const outcome = redis.execute(command);
      return base64 && "result" in outcome
        ? { result: encodeResult(outcome.result) }
        : outcome;
    };
    const body = JSON.parse((await readBody(request)) || "null");
    if (request.url === "/") {
      response.end(JSON.stringify(reply(body)));
      return;
    }
    if (request.url === "/pipeline" || request.url === "/multi-exec") {
      response.end(JSON.stringify(body.map(reply)));
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: "Not found" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return server;
}

// The Upstash client asks for base64 strings, except a top-level "OK".
function encodeResult(value: unknown, topLevel = true): unknown {
  if (Array.isArray(value))
    return value.map((item) => encodeResult(item, false));
  if (typeof value === "string" && !(topLevel && value === "OK"))
    return Buffer.from(value).toString("base64");
  return value;
}

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}
