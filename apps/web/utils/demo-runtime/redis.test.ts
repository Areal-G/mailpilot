import { describe, expect, it, vi } from "vitest";
import { INCREMENT_RATE_LIMIT_SCRIPT } from "@/utils/rate-limit";
import { createMemoryRedis } from "./redis";

vi.mock("server-only", () => ({}));

describe("createMemoryRedis", () => {
  it("stores strings with expiry and conditional sets", () => {
    vi.useFakeTimers();
    const redis = createMemoryRedis();

    expect(redis.execute(["set", "lock", "a", "NX", "EX", 10])).toEqual({
      result: "OK",
    });
    expect(redis.execute(["set", "lock", "b", "NX"])).toEqual({ result: null });
    expect(redis.execute(["get", "lock"])).toEqual({ result: "a" });

    vi.advanceTimersByTime(10_000);
    expect(redis.execute(["get", "lock"])).toEqual({ result: null });
    vi.useRealTimers();
  });

  it("counts with incr and hash increments", () => {
    const redis = createMemoryRedis();

    redis.execute(["incr", "count"]);
    redis.execute(["hincrby", "usage", "calls", 2]);
    redis.execute(["hincrby", "usage", "calls", 3]);

    expect(redis.execute(["get", "count"])).toEqual({ result: "1" });
    expect(redis.execute(["hgetall", "usage"])).toEqual({
      result: ["calls", "5"],
    });
  });

  it("deletes keys and reports how many existed", () => {
    const redis = createMemoryRedis();
    redis.execute(["set", "a", "1"]);

    expect(redis.execute(["del", "a", "missing"])).toEqual({ result: 1 });
    expect(redis.execute(["exists", "a"])).toEqual({ result: 0 });
  });

  it("runs the rate limiter's script: counts and expires the window", () => {
    vi.useFakeTimers();
    const redis = createMemoryRedis();
    const hit = () =>
      redis.execute(["eval", INCREMENT_RATE_LIMIT_SCRIPT, 1, "limit:ip", 60]);

    expect(hit()).toEqual({ result: 1 });
    expect(hit()).toEqual({ result: 2 });

    vi.advanceTimersByTime(60_000);
    expect(hit()).toEqual({ result: 1 });
    vi.useRealTimers();
  });

  it("answers unsupported commands with an error instead of hanging", () => {
    const redis = createMemoryRedis();

    expect(redis.execute(["eval", "return 1", 0])).toEqual({
      error: "ERR this script is not supported by the demo",
    });
    expect(redis.execute(["zadd", "set", 1, "a"])).toEqual({
      error: "ERR zadd is not supported by the demo",
    });
  });
});
