import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { createEmulator } from "emulate";
import { createLlmEmulator } from "@/__tests__/emulators/llm";
import { env } from "@/env";
import { buildEmulateSeed } from "@/scripts/emulate-seed";
import { getSlotIntervalMinutes } from "@/utils/booking/policy";
import { getDemoMailboxTokens } from "@/utils/demo-mailbox-tokens";
import {
  DEMO_DATABASE_PORT,
  DEMO_GOOGLE_PORT,
  DEMO_LLM_PORT,
  DEMO_REDIS_PORT,
} from "@/utils/demo-runtime/defaults";
import { startMemoryRedisServer } from "@/utils/demo-runtime/redis";
import {
  anchorMessageDates,
  startOfUtcDay,
} from "@/utils/demo-runtime/seed-dates";
import { upsertDemoSession } from "@/utils/demo-runtime/session";
import { createScopedLogger } from "@/utils/logger";
import prisma from "@/utils/prisma";

const logger = createScopedLogger("demo-runtime");

// Written by `pnpm demo:schema` at build time, from prisma/schema.prisma.
const SCHEMA_PATH = join(process.cwd(), ".demo", "schema.sql");

// Fixed ids, so every serverless instance seeds the same rows and a link or
// session from one instance resolves on any other.
export const DEMO_ACCOUNT_IDS = {
  user: "cdemouser000000000000000",
  account: "cdemoaccount000000000000",
  emailAccount: "cdemomailbox000000000000",
  calendarConnection: "cdemocalendarconnection0",
  calendar: "cdemocalendar00000000000",
  availabilitySchedule: "cdemoschedule00000000000",
  bookingLink: "cdemobookinglink00000000",
};

export const DEMO_BOOKING_SLUG = "developer";
const DEMO_BOOKING_DURATION_MINUTES = 30;
const WEEKDAYS = [1, 2, 3, 4, 5];

let started: Promise<void> | undefined;

// Starts the in-memory backend once per process. instrumentation.ts awaits it
// before the server takes requests, and anything that runs earlier awaits the
// same promise, so nothing can query a half-seeded database.
export function startInMemoryDemo() {
  started ??= start();
  return started;
}

async function start() {
  const startedAt = Date.now();
  const now = new Date();

  const db = await PGlite.create();
  await db.exec(await readFile(SCHEMA_PATH, "utf8"));
  // Prisma's pool opens several connections; the server queues their
  // queries onto PGlite's single session and keeps transactions together.
  await new PGLiteSocketServer({
    db,
    port: DEMO_DATABASE_PORT,
    maxConnections: 20,
  }).start();

  const seed = buildEmulateSeed(env.NEXT_PUBLIC_BASE_URL);
  await createEmulator({
    service: "google",
    port: DEMO_GOOGLE_PORT,
    seed: {
      google: {
        ...seed.google,
        messages: anchorMessageDates(seed.google.messages, now),
      },
    },
  });
  await createLlmEmulator({ port: DEMO_LLM_PORT });
  await startMemoryRedisServer(DEMO_REDIS_PORT);

  await seedDemoAccount(now);

  logger.info("In-memory demo ready", { durationMs: Date.now() - startedAt });
}

async function seedDemoAccount(now: Date) {
  const email = env.DEMO_USER_EMAIL;

  await prisma.user.create({
    data: {
      id: DEMO_ACCOUNT_IDS.user,
      email,
      name: "Developer",
      emailVerified: true,
      completedOnboardingAt: startOfUtcDay(now),
      accounts: {
        create: {
          id: DEMO_ACCOUNT_IDS.account,
          provider: "google",
          providerAccountId: email,
        },
      },
    },
  });
  await prisma.emailAccount.create({
    data: {
      id: DEMO_ACCOUNT_IDS.emailAccount,
      email,
      name: "Developer",
      userId: DEMO_ACCOUNT_IDS.user,
      accountId: DEMO_ACCOUNT_IDS.account,
    },
  });

  // Signs the guest into this process's Google emulator up front, so the
  // first page load finds a connected mailbox.
  const tokens = await getDemoMailboxTokens({
    emailAccountId: DEMO_ACCOUNT_IDS.emailAccount,
    logger,
  });
  if (!tokens) throw new Error("Demo mailbox tokens could not be issued");

  await seedDemoBookingPage({ email, tokens });
  await upsertDemoSession(DEMO_ACCOUNT_IDS.user, now);
}

// A public booking page with weekday 9:00-17:00 availability, backed by the
// emulated Google calendar so bookings check free/busy and add events there.
async function seedDemoBookingPage({
  email,
  tokens,
}: {
  email: string;
  tokens: { accessToken: string; refreshToken: string; expiresAt: number };
}) {
  await prisma.calendarConnection.create({
    data: {
      id: DEMO_ACCOUNT_IDS.calendarConnection,
      provider: "google",
      email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(tokens.expiresAt),
      emailAccountId: DEMO_ACCOUNT_IDS.emailAccount,
      calendars: {
        create: {
          id: DEMO_ACCOUNT_IDS.calendar,
          calendarId: "primary",
          name: email,
          primary: true,
        },
      },
    },
  });
  await prisma.availabilitySchedule.create({
    data: {
      id: DEMO_ACCOUNT_IDS.availabilitySchedule,
      name: "Default availability",
      isDefault: true,
      emailAccountId: DEMO_ACCOUNT_IDS.emailAccount,
      windows: {
        create: WEEKDAYS.map((weekday) => ({
          id: `cdemowindow${weekday}`.padEnd(24, "0"),
          weekday,
          startMinutes: 9 * 60,
          endMinutes: 17 * 60,
        })),
      },
    },
  });
  await prisma.bookingLink.create({
    data: {
      id: DEMO_ACCOUNT_IDS.bookingLink,
      slug: DEMO_BOOKING_SLUG,
      title: "Intro call",
      description: "A short call to see how Mail Pilot fits your inbox.",
      durationMinutes: DEMO_BOOKING_DURATION_MINUTES,
      slotIntervalMinutes: getSlotIntervalMinutes(
        DEMO_BOOKING_DURATION_MINUTES,
      ),
      emailAccountId: DEMO_ACCOUNT_IDS.emailAccount,
      destinationCalendarId: DEMO_ACCOUNT_IDS.calendar,
      availabilityScheduleId: DEMO_ACCOUNT_IDS.availabilitySchedule,
    },
  });
}
