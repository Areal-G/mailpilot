import { startOfUtcDay } from "@/utils/demo-runtime/seed-dates";
import prisma from "@/utils/prisma";

// Every guest shares one session with a fixed token and a lifetime anchored to
// the UTC day. The in-memory demo seeds this row on every serverless
// instance, so the cookie stays valid wherever a later request lands.
const DEMO_SESSION_TOKEN = "demo-guest-session";
const DEMO_SESSION_DAYS = 8;

// Creates or renews the shared guest session. Signing out deletes it, so the
// next guest sign-in recreates it.
export async function upsertDemoSession(userId: string, now = new Date()) {
  const expires = startOfUtcDay(now);
  expires.setUTCDate(expires.getUTCDate() + DEMO_SESSION_DAYS);
  await prisma.session.upsert({
    where: { sessionToken: DEMO_SESSION_TOKEN },
    create: { sessionToken: DEMO_SESSION_TOKEN, userId, expires },
    update: { userId, expires },
  });
  return { sessionToken: DEMO_SESSION_TOKEN, expires };
}
