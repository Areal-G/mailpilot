"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// Analytics are disabled: the PostHog client is never initialised, so feature
// flag hooks fall back to their defaults and capture calls do nothing.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
