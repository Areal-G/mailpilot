import { env } from "@/env";
import { saveTokens } from "@/utils/auth/save-tokens";
import { isDemoModeEnabled } from "@/utils/demo";
import {
  getGoogleOauthBaseUrl,
  getGoogleOauthTokenUrl,
  isGoogleOauthEmulationEnabled,
} from "@/utils/gmail/oauth";
import { SCOPES } from "@/utils/gmail/scopes";
import type { Logger } from "@/utils/logger";
import prisma from "@/utils/prisma";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type DemoMailboxTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

// Rechecking this often costs one emulator round trip and lets a guest tab that
// outlived an emulator restart recover before its next sync.
const CHECK_INTERVAL_MS = 60_000;

let demoEmailAccountId: Promise<string | null> | null = null;
let lastCheck: {
  promise: Promise<DemoMailboxTokens | null>;
  at: number;
} | null = null;

// The Google emulator keeps every token in memory, so each restart drops the
// demo mailbox's tokens. Every Gmail client for the demo mailbox comes through
// here first: it confirms the stored refresh token still works (re-signing the
// demo user in through the emulator if not) and hands back live tokens, so
// sync never sees a 401 and the account is never marked disconnected.
// Returns null for every account outside demo mode with the emulator.
export async function getDemoMailboxTokens({
  emailAccountId,
  logger,
}: {
  emailAccountId: string;
  logger: Logger;
}) {
  if (!isDemoModeEnabled() || !isGoogleOauthEmulationEnabled()) return null;

  demoEmailAccountId ??= findDemoEmailAccountId();
  const demoId = await demoEmailAccountId;
  if (!demoId) demoEmailAccountId = null;
  if (demoId !== emailAccountId) return null;

  if (!lastCheck || Date.now() - lastCheck.at > CHECK_INTERVAL_MS) {
    const check = {
      promise: refreshDemoMailboxTokens(demoId, logger),
      at: Date.now(),
    };
    lastCheck = check;
    check.promise.then((tokens) => {
      if (!tokens && lastCheck === check) lastCheck = null;
    });
  }
  return lastCheck.promise;
}

async function refreshDemoMailboxTokens(
  emailAccountId: string,
  logger: Logger,
): Promise<DemoMailboxTokens | null> {
  try {
    const account = await prisma.account.findFirst({
      where: { emailAccount: { id: emailAccountId } },
      select: { provider: true, refresh_token: true },
    });
    if (account?.provider !== "google") return null;

    const refreshed = account.refresh_token
      ? await requestTokens({
          grant_type: "refresh_token",
          refresh_token: account.refresh_token,
        })
      : null;

    const tokens = refreshed?.access_token
      ? { ...refreshed, refresh_token: account.refresh_token ?? undefined }
      : await issueTokens();

    if (!tokens?.access_token || !tokens.refresh_token) {
      logger.warn("Demo mailbox tokens could not be issued by the emulator");
      return null;
    }

    const expiresAt =
      Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600);
    await saveTokens({
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      },
      accountRefreshToken: refreshed ? tokens.refresh_token : null,
      emailAccountId,
      provider: "google",
    });
    if (!refreshed) {
      logger.info("Reissued demo mailbox tokens from the Google emulator");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: expiresAt * 1000,
    };
  } catch (error) {
    logger.error("Failed to refresh demo mailbox tokens", { error });
    return null;
  }
}

async function findDemoEmailAccountId() {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { email: env.DEMO_USER_EMAIL },
    select: { id: true },
  });
  return emailAccount?.id ?? null;
}

async function issueTokens() {
  const code = await requestEmulatorAuthCode();
  if (!code) return null;
  return requestTokens({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
  });
}

function getRedirectUri() {
  return `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`;
}

async function requestEmulatorAuthCode() {
  const response = await fetch(
    `${getGoogleOauthBaseUrl()}/o/oauth2/v2/auth/callback`,
    {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: env.DEMO_USER_EMAIL,
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: getRedirectUri(),
        scope: SCOPES.join(" "),
        state: "demo",
      }),
    },
  );
  const location = response.headers.get("location");
  return location ? new URL(location).searchParams.get("code") : null;
}

async function requestTokens(
  params: Record<string, string>,
): Promise<TokenResponse | null> {
  const response = await fetch(getGoogleOauthTokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    }),
  });
  if (!response.ok) return null;
  return (await response.json()) as TokenResponse;
}
