import {
  type BookableSlot,
  getZonedDateKey,
  isValidTimeZone,
} from "@mailpilot/scheduling";

// Shared by the public booking, reschedule and cancel pages. Slots are ISO
// instants; a "date key" is the YYYY-MM-DD day an instant falls on in the
// guest's chosen timezone.

export type Slot = BookableSlot;
export type HourFormat = "12h" | "24h";

const DEFAULT_API_ERROR = "Something went wrong. Please try again.";
const MINUTE_MS = 60 * 1000;

export function normalizeTimezone(
  timezone: string | null | undefined,
  fallback: string,
) {
  return timezone && isValidTimeZone(timezone) ? timezone : fallback;
}

// Public API routes answer errors as `{ error: string }`; validation failures
// carry issues instead, which guests can't act on.
export function getApiError(body: unknown) {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string" &&
    body.error
  ) {
    return body.error;
  }
  return DEFAULT_API_ERROR;
}

// The slot query param holds only the start time; the end follows from the
// link's duration. Anything that isn't a valid date means no slot.
export function parseSlotParam(
  slotParam: string | null,
  durationMinutes: number,
): Slot | null {
  if (!slotParam) return null;

  const start = new Date(slotParam);
  if (Number.isNaN(start.getTime())) return null;

  return {
    startTime: start.toISOString(),
    endTime: new Date(
      start.getTime() + durationMinutes * MINUTE_MS,
    ).toISOString(),
  };
}

// Opens the calendar on the selected slot's month, or the current one.
export function getInitialVisibleMonthDate(slotParam: string | null) {
  const slotStart = slotParam ? new Date(slotParam) : null;
  const date =
    slotStart && !Number.isNaN(slotStart.getTime()) ? slotStart : new Date();
  return startOfMonth(date);
}

// Month bounds in the browser's local time, matching the calendar grid.
export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function formatDateKey(date: Date, timezone: string) {
  return getZonedDateKey(date, timezone);
}

export function dateKeyToLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isBeforeToday(date: Date, todayKey: string, timezone: string) {
  return formatDateKey(date, timezone) < todayKey;
}

// Slots arrive sorted by start time, so each day keeps that order.
export function groupSlotsByDay(slots: Slot[], timezone: string) {
  const slotsByDay = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = formatDateKey(new Date(slot.startTime), timezone);
    const daySlots = slotsByDay.get(key);
    if (daySlots) daySlots.push(slot);
    else slotsByDay.set(key, [slot]);
  }
  return slotsByDay;
}

export function detectDefaultHourFormat(): HourFormat {
  const { hourCycle } = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  }).resolvedOptions();
  return hourCycle === "h23" || hourCycle === "h24" ? "24h" : "12h";
}

export function formatSlotTime(
  startTime: string,
  timezone: string,
  hourFormat: HourFormat,
) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: hourFormat === "24h" ? "h23" : "h12",
    timeZone: timezone,
  }).format(new Date(startTime));
}

export function formatLongDateTime(startTime: string | Date, timezone: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(startTime));
}

// A date key names a calendar day, not an instant, so it is formatted in UTC
// to keep the day unchanged.
export function formatSelectedDateHeading(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatShortWeekdayName(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}
