import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// GET /api/admin/students/[id] — single student with linked guardians + teachers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const [studentRes, guardiansRes, teachersRes] = await Promise.all([
      db.query(`SELECT * FROM public.student_profiles WHERE id = $1`, [id]),
      db.query(`
        SELECT gp.id, gp.display_name, gp.email, gp.username, gsl.relationship_label
        FROM public.guardian_student_links gsl
        JOIN public.guardian_profiles gp ON gp.id = gsl.guardian_id
        WHERE gsl.student_id = $1
      `, [id]),
      db.query(`
        SELECT tp.id, tp.display_name, tp.email, tp.username, tp.school_name
        FROM public.teacher_student_roster tsr
        JOIN public.teacher_profiles tp ON tp.id = tsr.teacher_id
        WHERE tsr.student_id = $1
      `, [id]),
    ]);

    if (!studentRes.rowCount) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    return NextResponse.json({
      student: studentRes.rows[0],
      guardians: guardiansRes.rows,
      teachers: teachersRes.rows,
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/students/[id] GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// PATCH /api/admin/students/[id] — update student fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (typeof body.displayName === "string") { sets.push(`display_name = $${idx++}`); vals.push(body.displayName.trim()); }
  if (typeof body.username === "string") { sets.push(`username = $${idx++}`); vals.push(body.username.trim().toLowerCase()); }
  if (typeof body.avatarKey === "string") { sets.push(`avatar_key = $${idx++}`); vals.push(body.avatarKey); }
  if (typeof body.launchBandCode === "string") { sets.push(`launch_band_code = $${idx++}`); vals.push(body.launchBandCode); }
  if (typeof body.ageLabel === "string") { sets.push(`age_label = $${idx++}`); vals.push(body.ageLabel); }
  if (typeof body.readingIndependenceLevel === "string") { sets.push(`reading_independence_level = $${idx++}`); vals.push(body.readingIndependenceLevel); }
  if (typeof body.testerFlag === "boolean") { sets.push(`tester_flag = $${idx++}`); vals.push(body.testerFlag); }
  if (Array.isArray(body.interests)) { sets.push(`interests = $${idx++}`); vals.push(body.interests); }

  if (sets.length === 0) return NextResponse.json({ error: "No fields to update." }, { status: 400 });

  vals.push(id);
  try {
    const result = await db.query(
      `UPDATE public.student_profiles SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
      vals
    );
    if (!result.rowCount) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    console.error("[api/admin/students PATCH]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// DELETE /api/admin/students/[id] — hard delete (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  }

  const { id } = await params;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM public.guardian_student_links WHERE student_id = $1`, [id]);
    await client.query(`DELETE FROM public.teacher_student_roster WHERE student_id = $1`, [id]);
    await client.query(`DELETE FROM public.student_profiles WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    if (isDatabaseConnectionError(err)) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    console.error("[api/admin/students DELETE]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  } finally {
    client.release();
  }
}
