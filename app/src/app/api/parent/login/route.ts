import { NextRequest, NextResponse } from "next/server";
import {
  PARENT_SESSION_COOKIE_NAME,
  ParentAccessThrottleError,
  createParentAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/parent-access";
import { accessParent } from "@/lib/parent-service";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = await request.json() as {
      identifier?: string;
      password?: string;
    };

    const identifier = (body.identifier ?? "").trim();
    const password = body.password ?? "";

    const result = await accessParent(
      {
        mode: "login",
        identifier,
        password,
      },
      { ipAddress, userAgent },
    );

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
    const message = error instanceof Error ? error.message : "Login failed.";
    const status = error instanceof ParentAccessThrottleError ? 429 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
