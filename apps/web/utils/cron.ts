import { env } from "@/env";
import { secureCompare } from "@/utils/crypto-compare";
import { INTERNAL_API_KEY_HEADER } from "@/utils/internal-api";
import type { RequestWithLogger } from "@/utils/middleware";

export function hasCronSecret(request: RequestWithLogger) {
  if (!env.CRON_SECRET) {
    request.logger.error("No cron secret set, unauthorized cron request");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const valid = secureCompare(authHeader, `Bearer ${env.CRON_SECRET}`);

  if (!valid)
    request.logger.error("Unauthorized cron request:", { authHeader });

  return valid;
}

export async function hasPostCronSecret(request: RequestWithLogger) {
  if (!env.CRON_SECRET) {
    request.logger.error("No cron secret set, unauthorized cron request");
    return false;
  }

  // Clone the request before consuming the body
  const clonedRequest = request.clone();
  const body = await clonedRequest.json();
  const valid = secureCompare(body.CRON_SECRET, env.CRON_SECRET);

  if (!valid) request.logger.error("Unauthorized cron request:", { body });

  return valid;
}

// For routes called both by the scheduler (cron secret as a bearer token) and
// by the app's own queue or server-to-server calls (internal API key header).
// Both are checked silently first, so a valid call of one kind does not log
// the other as unauthorized.
export function isAuthorizedCronOrInternalRequest(request: RequestWithLogger) {
  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get(INTERNAL_API_KEY_HEADER);

  const hasValidCronSecret =
    !!env.CRON_SECRET && secureCompare(authHeader, `Bearer ${env.CRON_SECRET}`);
  const hasValidInternalApiKey =
    !!env.INTERNAL_API_KEY && secureCompare(apiKey, env.INTERNAL_API_KEY);

  if (hasValidCronSecret || hasValidInternalApiKey) return true;

  request.logger.error("Unauthorized cron or internal request", {
    hasAuthorizationHeader: !!authHeader,
    hasInternalApiKey: !!apiKey,
  });
  return false;
}

export function getCronSecretHeader() {
  return new Headers({ authorization: `Bearer ${env.CRON_SECRET}` });
}
