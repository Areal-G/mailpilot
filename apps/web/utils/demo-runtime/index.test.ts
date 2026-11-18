import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({ order: [] as string[] }));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(async () => "CREATE TABLE demo ();"),
}));
vi.mock("@electric-sql/pglite", () => ({
  PGlite: {
    create: vi.fn(async () => {
      calls.order.push("database");
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { exec: vi.fn(async () => calls.order.push("schema")) };
    }),
  },
}));
vi.mock("@electric-sql/pglite-socket", () => ({
  PGLiteSocketServer: vi.fn(function PGLiteSocketServer() {
    return { start: vi.fn(async () => calls.order.push("socket")) };
  }),
}));
vi.mock("emulate", () => ({
  createEmulator: vi.fn(async () => calls.order.push("google")),
}));
vi.mock("@/__tests__/emulators/llm", () => ({
  createLlmEmulator: vi.fn(async () => calls.order.push("llm")),
}));
vi.mock("@/utils/demo-runtime/redis", () => ({
  startMemoryRedisServer: vi.fn(async () => calls.order.push("redis")),
}));
vi.mock("@/env", () => ({
  env: {
    DEMO_USER_EMAIL: "developer@example.com",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  },
}));
vi.mock("@/utils/prisma", () => ({
  default: {
    user: { create: vi.fn(async () => calls.order.push("user")) },
    emailAccount: { create: vi.fn(async () => calls.order.push("mailbox")) },
    calendarConnection: {
      create: vi.fn(async () => calls.order.push("calendar")),
    },
    availabilitySchedule: {
      create: vi.fn(async () => calls.order.push("schedule")),
    },
    bookingLink: {
      create: vi.fn(async () => calls.order.push("booking-link")),
    },
  },
}));
vi.mock("@/utils/demo-mailbox-tokens", () => ({
  getDemoMailboxTokens: vi.fn(async () => {
    calls.order.push("tokens");
    return { accessToken: "a", refreshToken: "r", expiresAt: 0 };
  }),
}));
vi.mock("@/utils/demo-runtime/session", () => ({
  upsertDemoSession: vi.fn(async () => calls.order.push("session")),
}));

describe("startInMemoryDemo", () => {
  beforeEach(() => {
    calls.order = [];
    vi.resetModules();
  });

  it("starts once and finishes seeding before any caller continues", async () => {
    const { startInMemoryDemo } = await import("./index");

    // Requests that arrive while the backend is still starting.
    const seen = await Promise.all(
      Array.from({ length: 10 }, async () => {
        await startInMemoryDemo();
        return [...calls.order];
      }),
    );

    const startup = [
      "database",
      "schema",
      "socket",
      "google",
      "llm",
      "redis",
      "user",
      "mailbox",
      "tokens",
      "calendar",
      "schedule",
      "booking-link",
      "session",
    ];
    expect(calls.order).toEqual(startup);
    for (const order of seen) expect(order).toEqual(startup);
  });

  it("returns the same startup to later callers", async () => {
    const { startInMemoryDemo } = await import("./index");

    const first = startInMemoryDemo();
    await first;
    expect(startInMemoryDemo()).toBe(first);
    expect(calls.order.filter((step) => step === "database")).toHaveLength(1);
  });
});
