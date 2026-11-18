import { describe, expect, it } from "vitest";
import {
  dateKeyToLocalDate,
  endOfMonth,
  formatDateKey,
  formatSelectedDateHeading,
  formatSlotTime,
  getApiError,
  getInitialVisibleMonthDate,
  groupSlotsByDay,
  isBeforeToday,
  normalizeTimezone,
  parseSlotParam,
  startOfMonth,
} from "./booking-helpers";

describe("normalizeTimezone", () => {
  it("keeps valid IANA timezones and falls back otherwise", () => {
    expect(normalizeTimezone("Europe/Berlin", "UTC")).toBe("Europe/Berlin");
    expect(normalizeTimezone("Mars/Olympus", "UTC")).toBe("UTC");
    expect(normalizeTimezone(null, "UTC")).toBe("UTC");
  });
});

describe("getApiError", () => {
  it("returns the API's error message", () => {
    expect(getApiError({ error: "Slot is no longer available" })).toBe(
      "Slot is no longer available",
    );
  });

  it("falls back for bodies without a message", () => {
    const fallback = "Something went wrong. Please try again.";
    expect(getApiError({ error: { issues: [] } })).toBe(fallback);
    expect(getApiError(null)).toBe(fallback);
  });
});

describe("parseSlotParam", () => {
  it("builds the slot from its start and the link duration", () => {
    expect(parseSlotParam("2026-05-04T09:30:00.000Z", 45)).toEqual({
      startTime: "2026-05-04T09:30:00.000Z",
      endTime: "2026-05-04T10:15:00.000Z",
    });
  });

  it("ignores missing or invalid values", () => {
    expect(parseSlotParam(null, 30)).toBeNull();
    expect(parseSlotParam("not-a-date", 30)).toBeNull();
  });
});

describe("month bounds", () => {
  it("covers the whole local month", () => {
    const date = new Date(2026, 1, 14, 15, 30);

    expect(startOfMonth(date)).toEqual(new Date(2026, 1, 1));
    expect(endOfMonth(date)).toEqual(new Date(2026, 1, 28, 23, 59, 59, 999));
  });

  it("opens on the selected slot's month", () => {
    expect(getInitialVisibleMonthDate("2026-07-20T12:00:00.000Z")).toEqual(
      new Date(2026, 6, 1),
    );
  });
});

describe("date keys", () => {
  it("uses the day in the given timezone", () => {
    const instant = new Date("2026-05-04T23:30:00.000Z");

    expect(formatDateKey(instant, "UTC")).toBe("2026-05-04");
    expect(formatDateKey(instant, "Asia/Tokyo")).toBe("2026-05-05");
  });

  it("round-trips to a local calendar date", () => {
    expect(dateKeyToLocalDate("2026-05-04")).toEqual(new Date(2026, 4, 4));
  });

  it("compares days against today's key", () => {
    const date = new Date("2026-05-03T12:00:00.000Z");

    expect(isBeforeToday(date, "2026-05-04", "UTC")).toBe(true);
    expect(isBeforeToday(date, "2026-05-03", "UTC")).toBe(false);
  });

  it("formats a heading without shifting the day", () => {
    expect(formatSelectedDateHeading("2026-05-04")).toMatch(/4/);
    expect(formatSelectedDateHeading("2026-05-04")).toMatch(/May/);
  });
});

describe("groupSlotsByDay", () => {
  it("groups slots by their day in the timezone, keeping order", () => {
    const slots = [
      {
        startTime: "2026-05-04T22:00:00.000Z",
        endTime: "2026-05-04T22:30:00.000Z",
      },
      {
        startTime: "2026-05-05T09:00:00.000Z",
        endTime: "2026-05-05T09:30:00.000Z",
      },
      {
        startTime: "2026-05-05T10:00:00.000Z",
        endTime: "2026-05-05T10:30:00.000Z",
      },
    ];

    const byDay = groupSlotsByDay(slots, "Asia/Tokyo");

    expect([...byDay.keys()]).toEqual(["2026-05-05"]);
    expect(byDay.get("2026-05-05")).toEqual(slots);
  });
});

describe("formatSlotTime", () => {
  it("formats in the guest timezone and hour format", () => {
    const start = "2026-05-04T13:05:00.000Z";

    expect(formatSlotTime(start, "UTC", "24h")).toMatch(/13:05/);
    expect(formatSlotTime(start, "UTC", "12h")).toMatch(/1:05/);
    expect(formatSlotTime(start, "America/New_York", "24h")).toMatch(/09:05/);
  });
});
