/** @vitest-environment jsdom */

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignUpShowcase } from "./SignUpShowcase";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // biome-ignore lint/performance/noImgElement: test-only mock
    <img {...props} alt={props.alt || ""} width={18} height={18} />
  ),
}));

const fetchMock = vi.fn();

describe("SignUpShowcase", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("validates the sign-up fields before showing anything", async () => {
    render(<SignUpShowcase initialMode="signup" />);

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Enter your name")).toBeTruthy();
    expect(screen.getByText("Enter a valid email address")).toBeTruthy();
    expect(screen.getByText("Use at least 8 characters")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("offers the live demo instead of signing up", async () => {
    render(<SignUpShowcase initialMode="signup" />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@company.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-horse" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    const notice = await screen.findByRole("status");
    expect(notice.textContent).toContain("Sign-up isn't available");
    expect(
      screen
        .getByRole("button", { name: "Open the live demo" })
        .closest("form")
        ?.getAttribute("action"),
    ).toBe("/api/demo/sign-in");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never starts Google sign-in", async () => {
    render(<SignUpShowcase initialMode="login" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    await waitFor(() => expect(screen.getByRole("status")).toBeTruthy());
    expect(screen.queryByLabelText("Name")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
