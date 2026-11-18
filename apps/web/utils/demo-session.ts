import { env } from "@/env";
import { betterAuthConfig } from "@/utils/auth";
import { getDemoMailboxTokens } from "@/utils/demo-mailbox-tokens";
import { upsertDemoSession } from "@/utils/demo-runtime/session";
import type { Logger } from "@/utils/logger";
import { buildMobileSessionCookie } from "@/utils/mobile-auth/session-cookie";
import prisma from "@/utils/prisma";

// Signs a visitor in as the shared demo user. The demo user is the seeded,
// emulated mailbox, so it must have signed in through its provider once to
// exist with mailbox tokens.
export async function createDemoSession(logger: Logger) {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { email: env.DEMO_USER_EMAIL },
    select: {
      id: true,
      user: { select: { id: true, completedOnboardingAt: true } },
    },
  });

  if (!emailAccount) {
    logger.warn("Demo sign-in unavailable: demo user has not been created");
    return null;
  }

  if (!emailAccount.user.completedOnboardingAt) {
    await prisma.user.update({
      where: { id: emailAccount.user.id },
      data: { completedOnboardingAt: new Date() },
    });
  }

  await getDemoMailboxTokens({ emailAccountId: emailAccount.id, logger });

  const session = await upsertDemoSession(emailAccount.user.id);
  const authContext = await betterAuthConfig.$context;

  return {
    emailAccountId: emailAccount.id,
    sessionCookie: await buildMobileSessionCookie({
      authContext,
      expiresAt: session.expires,
      sessionToken: session.sessionToken,
    }),
  };
}
