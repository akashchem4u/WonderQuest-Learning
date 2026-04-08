import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import crypto from "crypto";

function hashTeacherPassword(password: string, username: string): string {
  return crypto.createHmac("sha256", `wq:teacher:${username}`).update(password).digest("hex");
}

// PATCH /api/admin/teachers/[id] — update teacher fields
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

  // Build dynamic update
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (typeof body.displayName === "string") { sets.push(`display_name = $${idx++}`); vals.push(body.displayName.trim()); }
  if (typeof body.email === "string") { sets.push(`email = $${idx++}`); vals.push(body.email.trim().toLowerCase() || null); }
  if (typeof body.schoolName === "string") { sets.push(`school_name = $${idx++}`); vals.push(body.schoolName.trim() || null); }
  if (Array.isArray(body.gradeLevels)) { sets.push(`grade_levels = $${idx++}`); vals.push(body.gradeLevels); }
  if (typeof body.testerFlag === "boolean") { sets.push(`tester_flag = $${idx++}`); vals.push(body.testerFlag); }
  if (typeof body.password === "string" && body.password.trim()) {
    // Need username for hashing
    const uRow = await db.query(`SELECT username FROM public.teacher_profiles WHERE id = $1`, [id]);
    if (!uRow.rowCount) return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    sets.push(`password_hash = $${idx++}`);
    vals.push(hashTeacherPassword(body.password.trim(), uRow.rows[0].username as string));
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  vals.push(id);
  try {
    const result = await db.query(
      `UPDATE public.teacher_profiles SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
      vals
    );
    if (!result.rowCount) return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/teachers PATCH]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// DELETE /api/admin/teachers/[id] — remove teacher (super_admin only)
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

  try {
    await db.query(`DELETE FROM public.teacher_profiles WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/teachers DELETE]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
