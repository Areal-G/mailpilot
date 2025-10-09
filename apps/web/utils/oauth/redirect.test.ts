import { describe, expect, it, vi } from "vitest";
import { redirectWithError, redirectWithMessage } from "./redirect";

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://www.mailpilot.app",
  },
}));

describe("redirectWithMessage", () => {
  it("rebases external redirect targets onto the app origin", () => {
    const response = redirectWithMessage(
      new URL("https://evil.example/phish?step=1#fragment"),
      "connected",
      new Headers(),
    );

    expect(response.headers.get("location")).toBe(
      "https://www.mailpilot.app/phish?step=1&message=connected#fragment",
    );
  });

  it("prevents protocol-relative paths from escaping the app origin", () => {
    const response = redirectWithMessage(
      new URL("https://evil.example//phish?step=1#fragment"),
      "connected",
      new Headers(),
    );

    expect(response.headers.get("location")).toBe(
      "https://www.mailpilot.app/phish?step=1&message=connected#fragment",
    );
  });
});

describe("redirectWithError", () => {
  it("preserves same-origin redirect targets", () => {
    const response = redirectWithError(
      new URL("https://www.mailpilot.app/accounts"),
      "forbidden",
      new Headers(),
    );

    expect(response.headers.get("location")).toBe(
      "https://www.mailpilot.app/accounts?error=forbidden",
    );
  });
});
