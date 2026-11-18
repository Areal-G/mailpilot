import { describe, expect, it } from "vitest";
import {
  CalendarAvailabilityError,
  getCalendarAvailabilityErrorLogContext,
} from "./availability-error";

describe("CalendarAvailabilityError", () => {
  it("names the provider in its message", () => {
    const error = new CalendarAvailabilityError({
      provider: "microsoft",
      calendarErrors: [],
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("CalendarAvailabilityError");
    expect(error.message).toBe(
      "Failed to fetch Microsoft calendar availability",
    );
  });
});

describe("getCalendarAvailabilityErrorLogContext", () => {
  it("summarizes provider error codes per calendar", () => {
    const error = new CalendarAvailabilityError({
      provider: "google",
      calendarErrors: [
        {
          calendarId: "cal-1",
          errors: [
            { domain: "global", reason: "backendError" },
            { reason: "notFound" },
          ],
        },
      ],
    });

    expect(getCalendarAvailabilityErrorLogContext(error)).toEqual({
      calendarProvider: "google",
      calendarErrorCount: 1,
      calendarErrors: [
        { calendarId: "cal-1", reasons: ["global:backendError", "notFound"] },
      ],
    });
  });

  it("adds nothing for other errors", () => {
    expect(getCalendarAvailabilityErrorLogContext(new Error("boom"))).toEqual(
      {},
    );
    expect(getCalendarAvailabilityErrorLogContext("boom")).toEqual({});
  });
});
