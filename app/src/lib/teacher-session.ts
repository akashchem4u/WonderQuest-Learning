import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasTeacherAccess } from "@/lib/teacher-access";

export const TEACHER_SESSION_COOKIE = "wonderquest-teacher-session";

function hashToken(token: string) {
  return createHash("sha256").update(`wonderquest:teacher:${token}`).digest("hex");
}

type TeacherSessionResult =
  | { ok: true; teacherId: string }
  | { ok: false; response: NextResponse };

export async function requireTeacherSession(
  request: NextRequest,
  requestedTeacherId?: string | null,
): Promise<TeacherSessionResult> {
  // 1. Check shared teacher access cookie (middleware-level gate)
  if (!(await hasTeacherAccess())) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Teacher access is required." }, { status: 401 }),
    };
  }

  // 2. Validate session token from DB
  const token = request.cookies.get(TEACHER_SESSION_COOKIE)?.value ?? "";
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Teacher session not found. Please sign in again." },
        { status: 401 },
      ),
    };
  }

  const result = await db.query(
    `UPDATE public.access_sessions
     SET last_seen_at = now()
     WHERE access_type = 'teacher' AND token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
     RETURNING student_id`,
    [hashToken(token)],
  );

  if (!result.rowCount) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Teacher session expired. Please sign in again." },
        { status: 401 },
      ),
    };
  }

  const teacherId = result.rows[0].student_id as string;

  // 3. If a specific teacher was requested, verify it matches the session
  if (requestedTeacherId?.trim() && requestedTeacherId.trim() !== teacherId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Session mismatch. Please sign in again." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, teacherId };
}
