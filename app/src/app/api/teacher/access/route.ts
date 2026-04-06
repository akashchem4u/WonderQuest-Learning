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
import { getOrCreateTeacherProfile } from "@/lib/teacher-service";

export const TEACHER_ID_COOKIE_NAME = "wonderquest-teacher-id";

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

    const profile = await getOrCreateTeacherProfile({});

    const response = NextResponse.json({ ok: true, teacherId: profile.id, isNew: profile.isNew });
    response.cookies.set({
      name: TEACHER_COOKIE_NAME,
      value: issueTeacherAccessToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.cookies.set({
      name: TEACHER_ID_COOKIE_NAME,
      value: profile.id,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
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
