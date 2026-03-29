import { NextRequest, NextResponse } from "next/server";
import {
  PARENT_SESSION_COOKIE_NAME,
  ParentAccessThrottleError,
  createParentAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/parent-access";
import { accessParent } from "@/lib/prototype-service";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = await request.json();
    const result = await accessParent(body, { ipAddress, userAgent });

    const accessSession = await createParentAccessSession({
      guardianId: result.guardian.id,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json(result);
    response.cookies.set({
      name: PARENT_SESSION_COOKIE_NAME,
      value: accessSession.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: accessSession.expiresAt,
    });

    return response;
  } catch (error) {
    const status = error instanceof ParentAccessThrottleError ? 429 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parent access failed." },
      { status },
    );
  }
}
