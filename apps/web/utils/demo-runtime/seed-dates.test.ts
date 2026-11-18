import { describe, expect, it } from "vitest";
import { anchorMessageDates, startOfUtcDay } from "./seed-dates";

const messages = [
  { id: "a", internal_date: String(Date.parse("2026-04-20T16:10:00.000Z")) },
  { id: "b", internal_date: String(Date.parse("2026-04-22T06:15:00.000Z")) },
];

describe("anchorMessageDates", () => {
  it("puts the newest message on the previous UTC day", () => {
    const anchored = anchorMessageDates(
      messages,
      new Date("2026-11-17T09:30:00.000Z"),
    );

    expect(anchored.map((message) => toIso(message.internal_date))).toEqual([
      "2026-11-14T16:10:00.000Z",
      "2026-11-16T06:15:00.000Z",
    ]);
  });

  it("seeds the same dates at any time of the same UTC day", () => {
    const early = anchorMessageDates(
      messages,
      new Date("2026-11-17T00:00:01.000Z"),
    );
    const late = anchorMessageDates(
      messages,
      new Date("2026-11-17T23:59:59.000Z"),
    );

    expect(early).toEqual(late);
  });

  it("keeps every other field", () => {
    const [first] = anchorMessageDates(messages, new Date());

    expect(first.id).toBe("a");
  });
});

describe("startOfUtcDay", () => {
  it("drops the time of day in UTC", () => {
    expect(
      startOfUtcDay(new Date("2026-11-17T23:59:59.999Z")).toISOString(),
    ).toBe("2026-11-17T00:00:00.000Z");
  });
});

function toIso(internalDate: string) {
  return new Date(Number(internalDate)).toISOString();
}
