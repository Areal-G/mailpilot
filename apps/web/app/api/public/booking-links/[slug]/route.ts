import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { getPublicBookingLinkMetadata } from "@/utils/booking/public";

export type GetPublicBookingLinkResponse = Awaited<
  ReturnType<typeof getPublicBookingLinkMetadata>
>;

export const GET = withError(
  "public/booking-link",
  async (_request, context) => {
    const { slug } = await context.params;
    const bookingLink = await getPublicBookingLinkMetadata(slug);

    return NextResponse.json(bookingLink);
  },
);
