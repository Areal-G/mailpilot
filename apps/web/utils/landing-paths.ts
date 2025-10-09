import { env } from "@/env";

// The public demo has no real sign-up, so its landing CTAs open the sign-up
// showcase, which offers the guest demo instead.
export const GET_STARTED_PATH = env.NEXT_PUBLIC_DEMO_MODE
  ? "/signup"
  : "/login";
export const LOG_IN_PATH = env.NEXT_PUBLIC_DEMO_MODE
  ? "/signup?mode=login"
  : "/login";
