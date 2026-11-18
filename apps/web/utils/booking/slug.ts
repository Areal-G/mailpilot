import { RESERVED_BOOKING_SLUGS } from "@/utils/actions/booking.validation";

// Matches the slug schema in booking.validation.
const MIN_SLUG_LENGTH = 3;
const MAX_SLUG_LENGTH = 64;
const FALLBACK_SLUG = "booking-link";

// Turns free text into slug characters: lowercase ASCII letters and digits
// joined by single hyphens, accents folded ("José" -> "jose"). It runs on
// every keystroke, so a trailing hyphen is kept for the user to keep typing;
// the slug schema still rejects one on save.
export function normalizeBookingSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_SLUG_LENGTH);
}

// A valid starting slug for a new booking link, from the account's name.
// Availability is still checked when the link is created.
export function getBookingLinkSlugSuggestion(name: string | null) {
  const slug = normalizeBookingSlug(name ?? "").replace(/-+$/, "");

  if (slug.length < MIN_SLUG_LENGTH || RESERVED_BOOKING_SLUGS.has(slug)) {
    return FALLBACK_SLUG;
  }
  return slug;
}
