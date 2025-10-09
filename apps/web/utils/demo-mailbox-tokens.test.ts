import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestLogger } from "@/__tests__/helpers";

vi.mock("@/utils/prisma");
vi.mock("@/utils/auth/save-tokens", () => ({ saveTokens: vi.fn() }));
vi.mock("@/utils/demo", () => ({ isDemoModeEnabled: vi.fn(() => true) }));
vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "client",
    GOOGLE_CLIENT_SECRET: "secret",
    DEMO_USER_EMAIL: "demo@example.com",
    NEXT_PUBLIC_CONTACTS_ENABLED: false,
  },
}));
vi.mock("@/utils/gmail/oauth", () => ({
  isGoogleOauthEmulationEnabled: vi.fn(() => true),
  getGoogleOauthBaseUrl: () => "http://emulator",
  getGoogleOauthTokenUrl: () => "http://emulator/oauth2/token",
}));

const logger = createTestLogger();
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// The module caches the demo account and the last check, so each test loads
// fresh copies of it and of its mocked dependencies.
let getDemoMailboxTokens: typeof import("./demo-mailbox-tokens").getDemoMailboxTokens;
let prisma: typeof import("@/utils/__mocks__/prisma").default;
let saveTokens: typeof import("@/utils/auth/save-tokens").saveTokens;
let isDemoModeEnabled: typeof import("@/utils/demo").isDemoModeEnabled;
let isGoogleOauthEmulationEnabled: typeof import("@/utils/gmail/oauth").isGoogleOauthEmulationEnabled;

describe("getDemoMailboxTokens", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ getDemoMailboxTokens } = await import("./demo-mailbox-tokens"));
    prisma = (await import("@/utils/__mocks__/prisma")).default;
    ({ saveTokens } = await import("@/utils/auth/save-tokens"));
    ({ isDemoModeEnabled } = await import("@/utils/demo"));
    ({ isGoogleOauthEmulationEnabled } = await import("@/utils/gmail/oauth"));
    vi.mocked(isDemoModeEnabled).mockReturnValue(true);
    vi.mocked(isGoogleOauthEmulationEnabled).mockReturnValue(true);
    prisma.emailAccount.findFirst.mockResolvedValue({ id: "ea_demo" } as never);
  });

  it("leaves accounts alone outside demo mode", async () => {
    vi.mocked(isDemoModeEnabled).mockReturnValue(false);

    expect(
      await getDemoMailboxTokens({ emailAccountId: "ea_demo", logger }),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves accounts alone without the Google emulator", async () => {
    vi.mocked(isGoogleOauthEmulationEnabled).mockReturnValue(false);

    expect(
      await getDemoMailboxTokens({ emailAccountId: "ea_demo", logger }),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves other accounts alone in demo mode", async () => {
    expect(
      await getDemoMailboxTokens({ emailAccountId: "ea_real", logger }),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes the access token while the emulator still knows the refresh token", async () => {
    prisma.account.findFirst.mockResolvedValue({
      provider: "google",
      refresh_token: "valid",
    } as never);
    fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: "fresh" }));

    const tokens = await getDemoMailboxTokens({
      emailAccountId: "ea_demo",
      logger,
    });

    expect(tokens).toMatchObject({
      accessToken: "fresh",
      refreshToken: "valid",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(saveTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAccountId: "ea_demo",
        provider: "google",
      }),
    );
  });

  it("reissues tokens after the emulator forgot the refresh token", async () => {
    prisma.account.findFirst.mockResolvedValue({
      provider: "google",
      refresh_token: "stale",
    } as never);
    fetchMock
      .mockResolvedValueOnce(new Response("{}", { status: 400 }))
      .mockResolvedValueOnce(
        Response.redirect("http://localhost:3000/cb?code=abc&state=demo", 302),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "new-access",
          refresh_token: "new-refresh",
        }),
      );

    const tokens = await getDemoMailboxTokens({
      emailAccountId: "ea_demo",
      logger,
    });

    const exchange = fetchMock.mock.calls[2][1].body as URLSearchParams;
    expect(exchange.get("grant_type")).toBe("authorization_code");
    expect(exchange.get("code")).toBe("abc");
    expect(tokens).toMatchObject({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(saveTokens).toHaveBeenCalledWith(
      expect.objectContaining({ accountRefreshToken: null }),
    );
  });

  it("shares one check between concurrent requests", async () => {
    prisma.account.findFirst.mockResolvedValue({
      provider: "google",
      refresh_token: "valid",
    } as never);
    fetchMock.mockResolvedValue(jsonResponse({ access_token: "fresh" }));

    await Promise.all([
      getDemoMailboxTokens({ emailAccountId: "ea_demo", logger }),
      getDemoMailboxTokens({ emailAccountId: "ea_demo", logger }),
      getDemoMailboxTokens({ emailAccountId: "ea_demo", logger }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
