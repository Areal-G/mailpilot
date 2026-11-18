import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/utils/__mocks__/prisma";
import { upsertDemoSession } from "./session";

vi.mock("@/utils/prisma");

describe("upsertDemoSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gives every instance the same session for the same UTC day", async () => {
    const morning = await upsertDemoSession(
      "user-1",
      new Date("2026-11-17T00:05:00.000Z"),
    );
    const evening = await upsertDemoSession(
      "user-1",
      new Date("2026-11-17T23:55:00.000Z"),
    );

    expect(morning).toEqual(evening);
    expect(morning.expires.toISOString()).toBe("2026-11-25T00:00:00.000Z");
    expect(prisma.session.upsert).toHaveBeenLastCalledWith({
      where: { sessionToken: morning.sessionToken },
      create: {
        sessionToken: morning.sessionToken,
        userId: "user-1",
        expires: morning.expires,
      },
      update: { userId: "user-1", expires: morning.expires },
    });
  });
});
