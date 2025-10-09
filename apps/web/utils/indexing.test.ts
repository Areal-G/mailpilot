import { describe, expect, it } from "vitest";
import { isIndexingAllowed } from "@/utils/indexing";

describe("isIndexingAllowed", () => {
  it("allows production and self-hosted installs", () => {
    expect(isIndexingAllowed("https://www.mailpilot.app", "production")).toBe(
      true,
    );
    expect(isIndexingAllowed("https://mail.example.com", "")).toBe(true);
  });

  it("blocks preview deploys and staging hosts", () => {
    expect(isIndexingAllowed("https://www.mailpilot.app", "preview")).toBe(
      false,
    );
    expect(
      isIndexingAllowed("https://staging.mailpilot.app", "production"),
    ).toBe(false);
  });
});
