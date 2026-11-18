import { describe, expect, it } from "vitest";
import { createBookingLinkBody } from "@/utils/actions/booking.validation";
import { getBookingLinkSlugSuggestion, normalizeBookingSlug } from "./slug";

describe("normalizeBookingSlug", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(normalizeBookingSlug("Intro  Call / 30 min")).toBe(
      "intro-call-30-min",
    );
  });

  it("folds accents to ASCII", () => {
    expect(normalizeBookingSlug("José Müller")).toBe("jose-muller");
  });

  it("drops leading separators but keeps a trailing hyphen while typing", () => {
    expect(normalizeBookingSlug("--my-")).toBe("my-");
    expect(normalizeBookingSlug("my-link")).toBe("my-link");
  });

  it("caps the length at the schema limit", () => {
    expect(normalizeBookingSlug("a".repeat(80))).toHaveLength(64);
  });
});

describe("getBookingLinkSlugSuggestion", () => {
  it("suggests a slug from the account name", () => {
    expect(getBookingLinkSlugSuggestion("Ada Lovelace")).toBe("ada-lovelace");
  });

  it("falls back when the name gives no usable slug", () => {
    expect(getBookingLinkSlugSuggestion(null)).toBe("booking-link");
    expect(getBookingLinkSlugSuggestion("Jo")).toBe("booking-link");
    expect(getBookingLinkSlugSuggestion("😀😀")).toBe("booking-link");
  });

  it("never suggests a reserved slug", () => {
    expect(getBookingLinkSlugSuggestion("Support")).toBe("booking-link");
  });

  it("always passes the create schema", () => {
    for (const name of ["Ada Lovelace", "  Zoë!  ", null, "Pricing", "x-"]) {
      const result = createBookingLinkBody.safeParse({
        title: "Booking link",
        slug: getBookingLinkSlugSuggestion(name),
      });
      expect(result.success).toBe(true);
    }
  });
});
