import { describe, expect, it } from "vitest";
import {
  findDesktopProtocolUrl,
  getDesktopAppOrigin,
  getDesktopBrowserStartUrl,
  getDesktopHomeUrl,
  getDesktopLocalMailUrl,
  getDesktopLoginUrl,
  DESKTOP_WINDOW_DRAG_CSS,
  getDesktopPostAuthUrl,
  getDesktopMailAccountId,
  getDesktopSessionRestoreUrl,
  getDesktopWindowDragCss,
  isAllowedDesktopNavigation,
  isAllowedExternalUrl,
  isDesktopAuthProvider,
  isDesktopLocalMailUrl,
  normalizeDesktopCallbackPath,
  parseDesktopAuthCallback,
  resolveDesktopStartUrl,
  shouldPersistDesktopUrl,
  shouldSmokeLocalMail,
  shouldUseLocalMailRenderer,
} from "./desktop";

describe("desktop shell helpers", () => {
  it("uses the production origin by default", () => {
    expect(getDesktopAppOrigin("https://www.mailpilot.app/ignored")).toBe(
      "https://www.mailpilot.app",
    );
    expect(getDesktopLoginUrl("https://www.mailpilot.app")).toBe(
      "https://www.mailpilot.app/login",
    );
    expect(getDesktopHomeUrl("https://www.mailpilot.app")).toBe(
      "https://www.mailpilot.app/welcome-redirect?mode=mail",
    );
  });

  it("rejects non-http app URLs", () => {
    expect(() => getDesktopAppOrigin("mailpilot://")).toThrow(
      "MAIL_PILOT_APP_URL must be an http(s) URL",
    );
  });

  it("treats MAIL_PILOT_APP_URL as the only allowed origin", () => {
    const origin = "http://mail.internal.example:8080";
    expect(getDesktopAppOrigin(`${origin}/welcome`)).toBe(origin);
    expect(getDesktopLoginUrl(origin)).toBe(`${origin}/login`);
    expect(getDesktopHomeUrl(origin)).toBe(
      `${origin}/welcome-redirect?mode=mail`,
    );
    expect(getDesktopBrowserStartUrl(origin, "google", "challenge")).toBe(
      `${origin}/api/mobile-auth/browser-start?provider=google&codeChallenge=challenge`,
    );
    expect(isAllowedDesktopNavigation(`${origin}/acc-1/mail`, origin)).toBe(
      true,
    );
    expect(
      isAllowedDesktopNavigation(
        "https://www.mailpilot.app/acc-1/mail",
        origin,
      ),
    ).toBe(false);
    expect(isAllowedDesktopNavigation("https://evil.test/mail", origin)).toBe(
      false,
    );
    expect(
      getDesktopSessionRestoreUrl(origin, `${origin}/acc-1/mail?type=inbox`),
    ).toBe(`${origin}/acc-1/mail?type=inbox`);
    expect(
      getDesktopSessionRestoreUrl(
        origin,
        "https://www.mailpilot.app/acc-1/mail",
      ),
    ).toBeNull();
    expect(getDesktopMailAccountId(`${origin}/acc-1/mail`, origin)).toBe(
      "acc-1",
    );
    expect(
      getDesktopMailAccountId("https://www.mailpilot.app/acc-1/mail", origin),
    ).toBeNull();
    expect(getDesktopPostAuthUrl(origin, "/connect-mailbox")).toBe(
      `${origin}/connect-mailbox`,
    );
  });

  it("builds the system-browser OAuth start URL", () => {
    expect(
      getDesktopBrowserStartUrl(
        "https://www.mailpilot.app",
        "google",
        "challenge",
      ),
    ).toBe(
      "https://www.mailpilot.app/api/mobile-auth/browser-start?provider=google&codeChallenge=challenge",
    );
  });

  it("parses a successful desktop auth callback", () => {
    expect(
      parseDesktopAuthCallback(
        "mailpilot://auth-callback?state=state-1&code=one-time-code",
      ),
    ).toEqual({
      ok: true,
      code: "one-time-code",
      state: "state-1",
    });
    expect(
      parseDesktopAuthCallback(
        "mailpilot:///auth-callback?state=state-1&code=one-time-code",
      ),
    ).toEqual({
      ok: true,
      code: "one-time-code",
      state: "state-1",
    });
  });

  it("parses auth callback errors without a code", () => {
    expect(
      parseDesktopAuthCallback(
        "mailpilot://auth-callback?state=state-1&error=missing_session&error_description=Authentication+session+was+not+found",
      ),
    ).toEqual({
      ok: false,
      error: "Authentication session was not found",
    });
  });

  it("ignores unknown protocol URLs", () => {
    expect(
      parseDesktopAuthCallback("https://example.com/auth-callback?code=x"),
    ).toEqual({
      ok: false,
      error: "Invalid authentication callback",
    });
  });

  it("keeps navigation on the app origin", () => {
    expect(
      isAllowedDesktopNavigation(
        "https://www.mailpilot.app/mail",
        "https://www.mailpilot.app",
      ),
    ).toBe(true);
    expect(
      isAllowedDesktopNavigation(
        "https://accounts.google.com/o/oauth2/v2/auth",
        "https://www.mailpilot.app",
      ),
    ).toBe(false);
    expect(
      isAllowedDesktopNavigation("about:blank", "https://www.mailpilot.app"),
    ).toBe(true);
  });

  it("allows the bundled local mail renderer over file URLs", () => {
    const rendererFile = "/tmp/mail-pilot-desktop/renderer/index.html";
    const url = getDesktopLocalMailUrl(rendererFile, ["acc-1"]);
    expect(url.startsWith("file:")).toBe(true);
    expect(url).toContain("accountId=acc-1");
    expect(isDesktopLocalMailUrl(url, rendererFile)).toBe(true);
    expect(
      isAllowedDesktopNavigation(
        url,
        "https://www.mailpilot.app",
        rendererFile,
      ),
    ).toBe(true);
    expect(
      isAllowedDesktopNavigation(
        "file:///etc/passwd",
        "https://www.mailpilot.app",
        rendererFile,
      ),
    ).toBe(false);
    expect(shouldUseLocalMailRenderer({ MAIL_PILOT_LOCAL_MAIL: "1" })).toBe(
      true,
    );
    expect(shouldUseLocalMailRenderer({})).toBe(false);
    expect(shouldSmokeLocalMail({ MAIL_PILOT_LOCAL_MAIL_SMOKE: "1" })).toBe(
      true,
    );
    expect(shouldSmokeLocalMail({})).toBe(false);
    expect(
      resolveDesktopStartUrl({
        requestedUrl: "https://www.mailpilot.app/account-1/mail",
        localMailUrl: url,
        homeUrl: "https://www.mailpilot.app/welcome-redirect?mode=mail",
        rendererFile,
      }),
    ).toBe(url);
    expect(
      resolveDesktopStartUrl({
        requestedUrl: "https://www.mailpilot.app/account-1/mail",
        localMailUrl: null,
        homeUrl: "https://www.mailpilot.app/welcome-redirect?mode=mail",
        rendererFile,
      }),
    ).toBe("https://www.mailpilot.app/account-1/mail");
  });

  it("finds the protocol URL in process arguments", () => {
    expect(
      findDesktopProtocolUrl([
        "electron",
        "mailpilot://auth-callback?code=one-time-code&state=state-1",
      ]),
    ).toBe("mailpilot://auth-callback?code=one-time-code&state=state-1");
    expect(isDesktopAuthProvider("google")).toBe(true);
    expect(isDesktopAuthProvider("sso")).toBe(false);
  });

  it("only opens http(s), mailto, and tel URLs externally", () => {
    expect(
      isAllowedExternalUrl("https://accounts.google.com/o/oauth2/v2/auth"),
    ).toBe(true);
    expect(isAllowedExternalUrl("mailto:hello@mailpilot.app")).toBe(true);
    expect(isAllowedExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedExternalUrl("mailpilot://auth-callback")).toBe(false);
  });

  it("loads a validated post-auth path and falls back to mail", () => {
    expect(
      getDesktopPostAuthUrl(
        "https://www.mailpilot.app",
        "/connect-mailbox?next=%2Fwelcome-redirect",
      ),
    ).toBe(
      "https://www.mailpilot.app/connect-mailbox?next=%2Fwelcome-redirect",
    );
    expect(
      getDesktopPostAuthUrl("https://www.mailpilot.app", "https://evil.test"),
    ).toBe("https://www.mailpilot.app/welcome-redirect?mode=mail");
    expect(normalizeDesktopCallbackPath("//evil.test")).toBeNull();
    expect(normalizeDesktopCallbackPath("/.//evil.test")).toBe("/evil.test");
    expect(
      getDesktopPostAuthUrl("https://www.mailpilot.app", "/.//evil.test"),
    ).toBe("https://www.mailpilot.app/evil.test");
  });

  it("persists in-app pages but not auth or API URLs", () => {
    const origin = "https://www.mailpilot.app";
    expect(
      shouldPersistDesktopUrl(`${origin}/account-1/automation`, origin),
    ).toBe(true);
    expect(
      shouldPersistDesktopUrl(`${origin}/account-1/mail?type=inbox`, origin),
    ).toBe(true);
    expect(shouldPersistDesktopUrl(`${origin}/login`, origin)).toBe(false);
    expect(
      shouldPersistDesktopUrl(`${origin}/login?next=%2Fmail`, origin),
    ).toBe(false);
    expect(shouldPersistDesktopUrl(`${origin}/api/user/me`, origin)).toBe(
      false,
    );
    expect(
      shouldPersistDesktopUrl("https://accounts.google.com/signin", origin),
    ).toBe(false);
    expect(shouldPersistDesktopUrl("not a url", origin)).toBe(false);
    // "/loginish" is a real page, not the login route
    expect(shouldPersistDesktopUrl(`${origin}/loginish`, origin)).toBe(true);
  });

  it("restores only validated mail URLs on launch", () => {
    const origin = "https://www.mailpilot.app";
    expect(
      getDesktopSessionRestoreUrl(
        origin,
        `${origin}/account-1/mail?type=archive`,
      ),
    ).toBe(`${origin}/account-1/mail?type=archive`);
    expect(
      getDesktopSessionRestoreUrl(origin, `${origin}/account-1/automation`),
    ).toBeNull();
    expect(getDesktopSessionRestoreUrl(origin, `${origin}/login`)).toBeNull();
    expect(
      getDesktopSessionRestoreUrl(origin, "https://evil.test/automation"),
    ).toBeNull();
    expect(getDesktopSessionRestoreUrl(origin, null)).toBeNull();
    expect(getDesktopSessionRestoreUrl(origin, 42)).toBeNull();
  });

  it("reads a mail account id only from same-origin mailbox URLs", () => {
    const origin = "https://www.mailpilot.app";
    expect(
      getDesktopMailAccountId(`${origin}/account-1/mail?type=inbox`, origin),
    ).toBe("account-1");
    expect(getDesktopMailAccountId(`${origin}/mail`, origin)).toBeNull();
    expect(
      getDesktopMailAccountId("https://evil.test/account-1/mail", origin),
    ).toBeNull();
  });

  it("scopes window dragging to a titlebar strip instead of the whole page", () => {
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain("-webkit-app-region: drag");
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain("html::before");
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain("height: 12px");
    expect(DESKTOP_WINDOW_DRAG_CSS).not.toContain("html {");
    expect(getDesktopWindowDragCss("darwin")).toBe(DESKTOP_WINDOW_DRAG_CSS);
    expect(getDesktopWindowDragCss("win32")).toBeNull();
    expect(getDesktopWindowDragCss("linux")).toBeNull();
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain("[data-hide-on-desktop-mac]");
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain("[data-desktop-mac-end]");
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain(
      "[data-desktop-mac-titlebar-toggle]",
    );
    expect(DESKTOP_WINDOW_DRAG_CSS).toContain(
      "--desktop-traffic-lights-width: 78px",
    );
  });
});
