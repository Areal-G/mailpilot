import { useMemo } from "react";
import useSWR from "swr";
import { subDays } from "date-fns/subDays";
import { startOfDay } from "date-fns/startOfDay";
import type {
  NewsletterStatsQuery,
  NewsletterStatsResponse,
} from "@/app/api/user/stats/newsletters/route";
import { useAccount } from "@/providers/EmailAccountProvider";
import { createSearchParams } from "@/utils/url";

export type Newsletter = NewsletterStatsResponse["newsletters"][number];

// Scans the inbox for senders worth unsubscribing from during onboarding.
export function useInboxScan() {
  const { emailAccountId } = useAccount();

  // Day-boundary date range keeps the SWR key stable across mounts, so
  // revisiting the step (back/forward) reuses the cached result.
  const fromDate = useMemo(() => +subDays(startOfDay(new Date()), 90), []);
  // Mirrors the bulk unsubscribe page defaults: last 3 months, unhandled
  // senders, all email types, ordered by email count.
  const params: NewsletterStatsQuery = {
    types: [],
    filters: ["unhandled"],
    orderBy: "emails",
    orderDirection: "desc",
    limit: 50,
    includeMissingUnsubscribe: true,
    fromDate,
  };
  const urlParams = createSearchParams(params);

  return useSWR<NewsletterStatsResponse>(
    emailAccountId
      ? [`/api/user/stats/newsletters?${urlParams}`, emailAccountId]
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
}
