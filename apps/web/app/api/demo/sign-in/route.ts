import { NextResponse } from "next/server";
import { env } from "@/env";
import { withError } from "@/utils/middleware";
import { isDemoModeEnabled } from "@/utils/demo";
import { createDemoSession } from "@/utils/demo-session";

export const POST = withError("demo/sign-in", async (request) => {
  if (!isDemoModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await createDemoSession(request.logger);
  if (!result) {
    return NextResponse.redirect(
      new URL("/login?error=demo_unavailable", env.NEXT_PUBLIC_BASE_URL),
      303,
    );
  }

  const response = NextResponse.redirect(
    new URL(`/${result.emailAccountId}/mail`, env.NEXT_PUBLIC_BASE_URL),
    303,
  );
  response.cookies.set(result.sessionCookie.name, result.sessionCookie.value, {
    ...result.sessionCookie.options,
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
});
