import type { CalendarAvailabilityProvider } from "./availability-types";

type CalendarProviderName = CalendarAvailabilityProvider["name"];

// Mirrors the error entries a provider reports for one calendar, e.g. Google
// free/busy `calendars[id].errors`.
export type CalendarAvailabilityErrorDetail = {
  calendarId: string;
  errors: Array<{ domain?: string | null; reason?: string | null }>;
};

const PROVIDER_LABELS: Record<CalendarProviderName, string> = {
  google: "Google",
  microsoft: "Microsoft",
};

// Thrown when a provider answers but cannot report availability for some
// calendars, so callers that must not double-book can fail closed.
export class CalendarAvailabilityError extends Error {
  readonly provider: CalendarProviderName;
  readonly calendarErrors: CalendarAvailabilityErrorDetail[];

  constructor({
    provider,
    calendarErrors,
  }: {
    provider: CalendarProviderName;
    calendarErrors: CalendarAvailabilityErrorDetail[];
  }) {
    super(`Failed to fetch ${PROVIDER_LABELS[provider]} calendar availability`);
    this.name = "CalendarAvailabilityError";
    this.provider = provider;
    this.calendarErrors = calendarErrors;
  }
}

// Structured fields for logging an availability failure. Only provider error
// codes are included, never event data. Other errors add nothing, so this can
// be spread into any catch block.
export function getCalendarAvailabilityErrorLogContext(error: unknown) {
  if (!(error instanceof CalendarAvailabilityError)) return {};

  return {
    calendarProvider: error.provider,
    calendarErrorCount: error.calendarErrors.length,
    calendarErrors: error.calendarErrors.map(({ calendarId, errors }) => ({
      calendarId,
      reasons: errors.map((entry) =>
        [entry.domain, entry.reason].filter(Boolean).join(":"),
      ),
    })),
  };
}
