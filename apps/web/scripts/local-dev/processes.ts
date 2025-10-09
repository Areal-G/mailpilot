import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export function createProcessManager(cwd: string, env: NodeJS.ProcessEnv) {
  const controller = new AbortController();
  const children = new Set<ChildProcess>();

  function start(
    name: string,
    command: string,
    args: string[],
    persistent = true,
  ) {
    controller.signal.throwIfAborted();
    console.log(`[local] Starting ${name}`);
    // Node refuses to spawn .cmd shims without a shell on Windows.
    const viaShell = process.platform === "win32" && command.endsWith(".cmd");
    const child = spawn(
      command,
      viaShell
        ? args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))
        : args,
      {
        cwd,
        env,
        stdio: "inherit",
        detached: process.platform !== "win32",
        shell: viaShell,
      },
    );
    children.add(child);
    const exited = new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (!persistent) children.delete(child);
        if (!persistent && code === 0) resolve();
        else reject(new Error(`${name} exited (${signal ?? code})`));
      });
    });
    exited.catch((error) => {
      if (persistent) controller.abort(error);
    });
    return { child, exited };
  }

  return {
    signal: controller.signal,
    abort: (reason: Error) => controller.abort(reason),
    start,
    async run(
      name: string,
      command: string,
      args: string[],
      timeout = 120_000,
    ) {
      const { child, exited } = start(name, command, args, false);
      const timer = setTimeout(() => {
        controller.abort(
          new Error(`${name} timed out after ${timeout / 1000}s`),
        );
        signalChild(child, "SIGTERM");
      }, timeout);
      let onAbort: () => void;
      const aborted = new Promise<never>((_, reject) => {
        onAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", onAbort, { once: true });
      });
      try {
        await Promise.race([exited, aborted]);
        controller.signal.throwIfAborted();
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener("abort", onAbort!);
      }
    },
    async ready(
      name: string,
      probe: () => Promise<unknown>,
      timeout = 120_000,
    ) {
      const deadline = Date.now() + timeout;
      let lastError: unknown;
      while (Date.now() < deadline) {
        controller.signal.throwIfAborted();
        try {
          await probe();
          console.log(`[local] ${name} ready`);
          return;
        } catch (error) {
          lastError = error;
        }
        try {
          await delay(500, undefined, { signal: controller.signal });
        } catch (error) {
          controller.signal.throwIfAborted();
          throw error;
        }
      }
      throw new Error(`${name} did not become ready: ${String(lastError)}`);
    },
    async stop() {
      const pending = [...children];
      for (const child of pending) signalChild(child, "SIGTERM");
      const deadline = new AbortController();
      await Promise.race([
        Promise.all(
          pending.map(
            (child) =>
              new Promise<void>((resolve) => {
                if (child.exitCode !== null || child.signalCode !== null)
                  resolve();
                else child.once("exit", () => resolve());
              }),
          ),
        ),
        delay(5000, undefined, { signal: deadline.signal }).catch(() => {}),
      ]);
      deadline.abort();
      // A grandchild can outlive its parent, so signal the process groups too.
      for (const child of pending) signalChild(child, "SIGKILL");
    },
  };
}

function signalChild(child: ChildProcess, signal: NodeJS.Signals) {
  if (!child.pid) return;
  try {
    // Shell-spawned children leave grandchildren behind unless the tree is killed.
    if (process.platform === "win32")
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    else process.kill(-child.pid, signal);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
}
