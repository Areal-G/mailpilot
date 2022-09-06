"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlagVariantKey } from "posthog-js/react";

export function HeroHeadingAB() {
  const variant = useFeatureFlagVariantKey("experiment-hero-heading");

  if (variant === "control") return <>Reach Mail Pilot in Minutes</>;
  if (variant === "quickest") return <>The Quickest Way to Mail Pilot</>;
  if (variant === "get") return <>Get to Mail Pilot Fast</>;
  if (variant === "assistant") return <>Your Personal Assistant for Email</>;

  return <Skeleton className="h-28 w-full rounded" />;
}
