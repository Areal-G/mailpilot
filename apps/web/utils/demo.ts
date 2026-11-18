import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { env } from "@/env";
import { SafeError } from "@/utils/error";

export const DEMO_BLOCKED_MESSAGE =
  "This is disabled in the demo. Sign up to use it with your own inbox.";

export const DEMO_SIGN_IN_MESSAGE =
  'Sign-in is disabled in the demo. Use "Try demo" to open the sample inbox.';

// Provider sign-in creates accounts and sessions in one serverless instance's
// memory and sends the browser to a loopback emulator, so the in-memory demo
// offers only the shared guest sign-in.
const IN_MEMORY_DEMO_BLOCKED_AUTH_PATHS = new Set([
  "/sign-in/social",
  "/sign-in/oauth2",
]);

export const inMemoryDemoSignIn = () =>
  ({
    id: "in-memory-demo-sign-in",
    hooks: {
      before: [
        {
          matcher: (context) =>
            IN_MEMORY_DEMO_BLOCKED_AUTH_PATHS.has(context.path ?? ""),
          handler: createAuthMiddleware(async () => {
            throw new APIError("FORBIDDEN", { message: DEMO_SIGN_IN_MESSAGE });
          }),
        },
      ],
    },
  }) satisfies BetterAuthPlugin;

// Server actions with an effect outside the demo mailbox: sending mail,
// billing, account deletion, connecting outside services, and invitations.
const DEMO_BLOCKED_ACTIONS = new Set([
  "claimPremiumAdmin",
  "createApiKey",
  "createMessagingLinkCode",
  "createOrganization",
  "createOrganizationAndInvite",
  "createScimConnection",
  "deleteAccount",
  "deleteEmailAccount",
  "endStripeTrial",
  "generateCheckoutSession",
  "getBillingPortalUrl",
  "inviteMembers",
  "linkSlackWorkspace",
  "regenerateWebhookSecret",
  "sendBrief",
  "sendEmail",
  "switchLemonPremiumPlan",
  "testMcpConnection",
  "transferOwnership",
  "unsubscribeSender",
  "updateMultiAccountPremium",
  "updateStripeInvoiceEmails",
]);

export function isDemoModeEnabled() {
  return env.NEXT_PUBLIC_DEMO_MODE;
}

export function isDemoUserEmail(email: string | null | undefined) {
  if (!isDemoModeEnabled() || !email) return false;
  return email.trim().toLowerCase() === env.DEMO_USER_EMAIL;
}

export function assertDemoActionAllowed({
  actionName,
  userEmail,
}: {
  actionName: string;
  userEmail: string | null | undefined;
}) {
  if (isDemoUserEmail(userEmail) && DEMO_BLOCKED_ACTIONS.has(actionName)) {
    throw new SafeError(DEMO_BLOCKED_MESSAGE, 403);
  }
}

// API routes that connect another mailbox, calendar, drive or integration, or
// delete the account or a linked mailbox.
export function isDemoBlockedApiRequest({
  method,
  pathname,
}: {
  method: string;
  pathname: string;
}) {
  if (pathname.endsWith("/auth-url")) return true;
  if (method === "GET" || method === "HEAD") return false;
  return (
    pathname.startsWith("/api/user/account") ||
    pathname.startsWith("/api/user/email-accounts")
  );
}
