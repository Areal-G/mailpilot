import { describe, expect, it } from "vitest";
import {
  getMailPilotCustomSchemeCallbackUrl,
  isMailPilotAppCallbackUrl,
} from "./app-callback-url";

describe("getMailPilotCustomSchemeCallbackUrl", () => {
  it("opens the desktop app with a one-time code and state", () => {
    expect(
      getMailPilotCustomSchemeCallbackUrl({
        code: "xz5IkObSXqOpdCvBARrwRnqhOrxRQNX9qPeoT9G-jws",
        state: "ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA",
      }),
    ).toBe(
      "mailpilot://auth-callback?state=ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA&code=xz5IkObSXqOpdCvBARrwRnqhOrxRQNX9qPeoT9G-jws",
    );
  });

  it("opens the desktop app with auth errors", () => {
    expect(
      getMailPilotCustomSchemeCallbackUrl({
        error: "missing_session",
        error_description: "Authentication session was not found",
        state: "ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA",
      }),
    ).toBe(
      "mailpilot://auth-callback?state=ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA&error=missing_session&error_description=Authentication+session+was+not+found",
    );
  });

  it("ignores extra query values that are not part of the handoff", () => {
    expect(
      getMailPilotCustomSchemeCallbackUrl({
        code: "xz5IkObSXqOpdCvBARrwRnqhOrxRQNX9qPeoT9G-jws",
        cookie: "better-auth.session_token=session",
        next: "https://evil.example",
        state: "ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA",
      }),
    ).toBe(
      "mailpilot://auth-callback?state=ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA&code=xz5IkObSXqOpdCvBARrwRnqhOrxRQNX9qPeoT9G-jws",
    );
  });

  it("does not open the app without a code or error", () => {
    expect(
      getMailPilotCustomSchemeCallbackUrl({
        state: "ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA",
      }),
    ).toBeNull();
  });

  it("recognizes sanitized Mail Pilot app callback URLs", () => {
    expect(
      isMailPilotAppCallbackUrl(
        "mailpilot://auth-callback?state=ADUZf5bSBOBSBzj58yThh17uiqgEg1PmsNzu-s4cMMA&code=xz5IkObSXqOpdCvBARrwRnqhOrxRQNX9qPeoT9G-jws",
      ),
    ).toBe(true);
    expect(
      isMailPilotAppCallbackUrl("https://www.mailpilot.app/auth-callback"),
    ).toBe(false);
  });
});
