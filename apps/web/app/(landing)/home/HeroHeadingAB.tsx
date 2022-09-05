"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlagVariantKey } from "posthog-js/react";

export function HeroHeadingAB() {
  const variant = useFeatureFlagVariantKey("experiment-hero-heading");

  if (variant === "control") return <>Reach Mail Pilot in Minutes</>;
  if (variant === "test") return <>The Quickest Way to Mail Pilot</>;

  return <Skeleton className="h-28 w-full rounded" />;
}
