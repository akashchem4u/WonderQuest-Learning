import { NextRequest, NextResponse } from "next/server";
import {
  TEACHER_COOKIE_NAME,
  TeacherAccessThrottleError,
  assertTeacherAccessAllowed,
  issueTeacherAccessToken,
  recordTeacherAccessAttempt,
} from "@/lib/teacher-access";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";
import { isDatabaseConnectionError } from "@/lib/db";
import { accessTeacherWithCredentials } from "@/lib/teacher-service";

export const TEACHER_ID_COOKIE_NAME = "wonderquest-teacher-id";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim().toLowerCase();
    const password = (body.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    await assertTeacherAccessAllowed(ipAddress);

    const result = await accessTeacherWithCredentials({ username, password });

    if (!result.ok) {
      await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: false });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: true });

    const response = NextResponse.json({ ok: true, teacherId: result.teacherId, isNew: result.isNew });
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
      value: result.teacherId,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    const status = error instanceof TeacherAccessThrottleError
      ? 429
      : isDatabaseConnectionError(error)
        ? 503
        : 400;
    const message = isDatabaseConnectionError(error)
      ? "WonderQuest could not reach the learning database. Try again shortly."
      : error instanceof Error
        ? error.message
        : "Teacher access failed.";
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
