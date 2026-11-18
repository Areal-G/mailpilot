export type BusyPeriod = {
  start: string;
  end: string;
};

export interface CalendarAvailabilityProvider {
  /**
   * Fetch busy periods for the given calendars
   */
  fetchBusyPeriods(params: {
    accessToken?: string | null;
    connectionId?: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    emailAccountId: string;
    calendarIds: string[];
    timeMin: string;
    timeMax: string;
    /** Throw when a calendar can't report availability instead of skipping it. */
    failOnCalendarError?: boolean;
  }): Promise<BusyPeriod[]>;
  name: "google" | "microsoft";
}
