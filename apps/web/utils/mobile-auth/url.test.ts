import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    DESKTOP_AUTH_ORIGIN: "mailpilot://",
    MOBILE_AUTH_ORIGIN: "mailpilot://",
    NEXT_PUBLIC_BASE_URL: "https://www.mailpilot.app",
  },
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

import {
  getMobileAuthAppCallbackUrl,
  getMobileAuthBaseUrlOrigin,
  getMobileAuthWebCallbackUrl,
  isMobileAuthReturnUrlMode,
} from "./url";

describe("mobile auth URL helpers", () => {
  beforeEach(() => {
    mockEnv.DESKTOP_AUTH_ORIGIN = "mailpilot://";
    mockEnv.MOBILE_AUTH_ORIGIN = "mailpilot://";
    mockEnv.NEXT_PUBLIC_BASE_URL = "https://www.mailpilot.app";
  });

  afterEach(() => {
    mockEnv.DESKTOP_AUTH_ORIGIN = "mailpilot://";
    mockEnv.MOBILE_AUTH_ORIGIN = "mailpilot://";
  });

  it("builds the web callback URL from the configured base origin", () => {
    expect(getMobileAuthWebCallbackUrl("state-1234567890")).toBe(
      "https://www.mailpilot.app/api/mobile-auth/callback?state=state-1234567890",
    );
    expect(getMobileAuthBaseUrlOrigin()).toBe("https://www.mailpilot.app");
  });

  it("uses the HTTPS app callback URL for production", () => {
    expect(getMobileAuthAppCallbackUrl().toString()).toBe(
      "https://www.mailpilot.app/auth-callback",
    );
  });

  it("builds custom-scheme callback URLs when requested", () => {
    expect(getMobileAuthAppCallbackUrl("custom-scheme").toString()).toBe(
      "mailpilot://auth-callback",
    );
  });

  it("builds desktop-scheme callback URLs when requested", () => {
    expect(getMobileAuthAppCallbackUrl("desktop-scheme").toString()).toBe(
      "mailpilot://auth-callback",
    );
  });

  it("fails custom-scheme callback URL requests when the scheme is not configured", () => {
    mockEnv.MOBILE_AUTH_ORIGIN = "";

    expect(() => getMobileAuthAppCallbackUrl("custom-scheme")).toThrow(
      "MOBILE_AUTH_ORIGIN is required for this auth callback scheme",
    );
  });

  it("fails desktop-scheme callback URL requests when the scheme is not configured", () => {
    mockEnv.DESKTOP_AUTH_ORIGIN = "";

    expect(() => getMobileAuthAppCallbackUrl("desktop-scheme")).toThrow(
      "DESKTOP_AUTH_ORIGIN is required for this auth callback scheme",
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

  it("recognizes supported return URL modes", () => {
    expect(isMobileAuthReturnUrlMode("desktop-scheme")).toBe(true);
    expect(isMobileAuthReturnUrlMode("javascript-alert")).toBe(false);
  });
});
