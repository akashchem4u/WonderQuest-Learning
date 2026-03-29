import { NextRequest, NextResponse } from "next/server";
import {
  TEACHER_COOKIE_NAME,
  TeacherAccessThrottleError,
  assertTeacherAccessAllowed,
  isTeacherAccessConfigured,
  isValidTeacherCode,
  issueTeacherAccessToken,
  recordTeacherAccessAttempt,
} from "@/lib/teacher-access";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim() ?? "";

    if (!isTeacherAccessConfigured()) {
      return NextResponse.json(
        { error: "Teacher access code is not configured yet." },
        { status: 400 },
      );
    }

    await assertTeacherAccessAllowed(ipAddress);

    if (!isValidTeacherCode(code)) {
      await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: false });
      return NextResponse.json(
        { error: "Teacher access code is not valid." },
        { status: 401 },
      );
    }

    await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: true });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: TEACHER_COOKIE_NAME,
      value: issueTeacherAccessToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    const status = error instanceof TeacherAccessThrottleError ? 429 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Teacher access failed." },
      { status },
    );
  }
}
