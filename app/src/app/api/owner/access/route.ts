import { NextRequest, NextResponse } from "next/server";
import {
  OWNER_COOKIE_NAME,
  OwnerAccessThrottleError,
  assertOwnerAccessAllowed,
  isOwnerAccessConfigured,
  isValidOwnerCode,
  issueOwnerAccessToken,
  recordOwnerAccessAttempt,
} from "@/lib/owner-access";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";
import { isDatabaseConnectionError } from "@/lib/db";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim() ?? "";

    if (!isOwnerAccessConfigured()) {
      return NextResponse.json(
        { error: "Owner access code is not configured yet." },
        { status: 400 },
      );
    }

    await assertOwnerAccessAllowed(ipAddress);

    if (!isValidOwnerCode(code)) {
      await recordOwnerAccessAttempt({ ipAddress, userAgent, succeeded: false });
      return NextResponse.json(
        { error: "Owner access code is not valid." },
        { status: 401 },
      );
    }

    await recordOwnerAccessAttempt({ ipAddress, userAgent, succeeded: true });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: OWNER_COOKIE_NAME,
      value: issueOwnerAccessToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    const status = error instanceof OwnerAccessThrottleError
      ? 429
      : isDatabaseConnectionError(error)
        ? 503
        : 400;
    const message = isDatabaseConnectionError(error)
      ? "WonderQuest could not reach the learning database. Try again shortly."
      : error instanceof Error
        ? error.message
        : "Owner access failed.";
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
