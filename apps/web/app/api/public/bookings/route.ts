import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { publicBookingBody } from "@/utils/actions/booking.validation";
import { createPublicBooking } from "@/utils/booking/public";
import { enforcePublicBookingRateLimit } from "@/utils/booking/public-rate-limit";
import { getClientIp } from "@/utils/rate-limit";

export type PostPublicBookingResponse = Awaited<
  ReturnType<typeof createPublicBooking>
>;

export const POST = withError("public/booking-create", async (request) => {
  const input = publicBookingBody.parse(await request.json());
  await enforcePublicBookingRateLimit({
    input,
    clientIp: getClientIp(request.headers),
    logger: request.logger,
  });
  const result = await createPublicBooking({ input, logger: request.logger });

  return NextResponse.json(result);
});
