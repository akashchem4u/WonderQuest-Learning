import { NextResponse } from "next/server";
import {
  TEACHER_COOKIE_NAME,
  isTeacherAccessConfigured,
  isValidTeacherCode,
  issueTeacherAccessToken,
} from "@/lib/teacher-access";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim() ?? "";

    if (!isTeacherAccessConfigured()) {
      return NextResponse.json(
        { error: "Teacher access code is not configured yet." },
        { status: 400 },
      );
    }

    if (!isValidTeacherCode(code)) {
      return NextResponse.json(
        { error: "Teacher access code is not valid." },
        { status: 401 },
      );
    }

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
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Teacher access failed.",
      },
      { status: 400 },
    );
  }
}
