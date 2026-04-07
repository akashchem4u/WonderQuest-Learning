import { NextRequest, NextResponse } from "next/server";
import { hasTeacherAccess } from "@/lib/teacher-access";
import { isValidTeacherId } from "@/lib/teacher-identity";

export const TEACHER_ID_COOKIE_NAME = "wonderquest-teacher-id";

type TeacherSessionResult =
  | { ok: true; teacherId: string }
  | { ok: false; response: NextResponse };

function unauthorized(message: string) {
  return {
    ok: false as const,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

function forbidden(message: string) {
  return {
    ok: false as const,
    response: NextResponse.json({ error: message }, { status: 403 }),
  };
}

export async function requireTeacherSession(
  request: NextRequest,
  requestedTeacherId?: string | null | undefined,
): Promise<TeacherSessionResult> {
  if (!(await hasTeacherAccess())) {
    return unauthorized("Teacher access is required.");
  }

  const cookieTeacherId = request.cookies.get(TEACHER_ID_COOKIE_NAME)?.value?.trim() ?? "";

  if (!isValidTeacherId(cookieTeacherId)) {
    return unauthorized("Teacher session not found. Please sign in again.");
  }

  const candidateTeacherId = requestedTeacherId?.trim() ?? "";

  if (candidateTeacherId && candidateTeacherId !== cookieTeacherId) {
    return forbidden("Teacher session does not match requested teacher.");
  }

  return { ok: true, teacherId: cookieTeacherId };
}
