import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    MOBILE_AUTH_ORIGIN: "mailpilot://",
    NEXT_PUBLIC_BASE_URL: "https://www.mailpilot.dev",
  },
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

import {
  getMobileAuthAppCallbackUrl,
  getMobileAuthBaseUrlOrigin,
  getMobileAuthWebCallbackUrl,
} from "./url";

describe("mobile auth URL helpers", () => {
  beforeEach(() => {
    mockEnv.MOBILE_AUTH_ORIGIN = "mailpilot://";
    mockEnv.NEXT_PUBLIC_BASE_URL = "https://www.mailpilot.dev";
  });

  it("builds the web callback URL from the configured base origin", () => {
    expect(getMobileAuthWebCallbackUrl("state-1234567890")).toBe(
      "https://www.mailpilot.dev/api/mobile-auth/callback?state=state-1234567890",
    );
    expect(getMobileAuthBaseUrlOrigin()).toBe("https://www.mailpilot.dev");
  });

  it("uses the HTTPS app callback URL for production", () => {
    expect(getMobileAuthAppCallbackUrl().toString()).toBe(
      "https://www.mailpilot.dev/auth-callback",
    );
  });

  it("uses the custom-scheme app callback URL for local development", () => {
    mockEnv.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

    expect(getMobileAuthWebCallbackUrl("state-1234567890")).toBe(
      "http://localhost:3000/api/mobile-auth/callback?state=state-1234567890",
    );
    expect(getMobileAuthBaseUrlOrigin()).toBe("http://localhost:3000");
    expect(getMobileAuthAppCallbackUrl().toString()).toBe(
      "mailpilot://auth-callback",
    );
  });
});
