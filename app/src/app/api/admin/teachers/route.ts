import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import crypto from "crypto";

function hashTeacherPassword(password: string, username: string): string {
  return crypto.createHmac("sha256", `wq:teacher:${username}`).update(password).digest("hex");
}

// GET /api/admin/teachers — list all teachers
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await db.query(`
      SELECT
        tp.id,
        tp.display_name,
        tp.email,
        tp.username,
        tp.school_name,
        tp.grade_levels,
        tp.class_code,
        tp.tester_flag,
        tp.google_id IS NOT NULL AS has_google,
        tp.password_hash IS NOT NULL AS has_password,
        COUNT(DISTINCT tsr.student_id) AS student_count,
        MAX(s.started_at) AS last_active_at
      FROM public.teacher_profiles tp
      LEFT JOIN public.teacher_student_roster tsr ON tsr.teacher_id = tp.id
      LEFT JOIN public.challenge_sessions s ON s.teacher_id = tp.id
      GROUP BY tp.id
      ORDER BY tp.display_name ASC
    `);

    return NextResponse.json({ teachers: result.rows });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/teachers GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// POST /api/admin/teachers — create a teacher
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  let body: { displayName?: unknown; email?: unknown; username?: unknown; password?: unknown; schoolName?: unknown; gradeLevels?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";
  const schoolName = typeof body.schoolName === "string" ? body.schoolName.trim() : null;
  const gradeLevels = Array.isArray(body.gradeLevels) ? body.gradeLevels : [];

  if (!displayName || !username || !password) {
    return NextResponse.json({ error: "Display name, username, and password are required." }, { status: 400 });
  }

  try {
    const existing = await db.query(
      `SELECT id FROM public.teacher_profiles WHERE username = $1`,
      [username]
    );
    if (existing.rowCount) {
      return NextResponse.json({ error: "A teacher with that username already exists." }, { status: 409 });
    }

    const result = await db.query(
      `INSERT INTO public.teacher_profiles (display_name, email, username, password_hash, school_name, grade_levels, tester_flag)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id`,
      [displayName, email || null, username, hashTeacherPassword(password, username), schoolName, gradeLevels]
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/teachers POST]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
