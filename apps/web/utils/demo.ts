import { env } from "@/env";
import { SafeError } from "@/utils/error";

export const DEMO_BLOCKED_MESSAGE =
  "This is disabled in the demo. Sign up to use it with your own inbox.";

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
