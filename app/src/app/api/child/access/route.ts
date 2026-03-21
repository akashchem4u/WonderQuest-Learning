import { NextRequest, NextResponse } from "next/server";
import {
  CHILD_SESSION_COOKIE_NAME,
  ChildAccessThrottleError,
  createChildAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/child-access";
import { accessChild } from "@/lib/prototype-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ipAddress = getRequestIpAddress(request);
    const userAgent = getRequestUserAgent(request);
    const result = await accessChild(body, {
      ipAddress,
      userAgent,
    });
    const accessSession = await createChildAccessSession({
      studentId: result.student.id,
      ipAddress,
      userAgent,
    });
    const response = NextResponse.json(result);

    response.cookies.set({
      name: CHILD_SESSION_COOKIE_NAME,
      value: accessSession.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: accessSession.expiresAt,
    });

    return response;
  } catch (error) {
    const status = error instanceof ChildAccessThrottleError ? 429 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Child access failed." },
      { status },
    );
  }
}
