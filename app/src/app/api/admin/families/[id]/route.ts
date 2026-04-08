import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// GET /api/admin/families/[id] — single family with linked children
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const [familyRes, childrenRes] = await Promise.all([
      db.query(`SELECT id, display_name, email, username, relationship_label, tester_flag, last_active_at, google_id IS NOT NULL AS has_google FROM public.guardian_profiles WHERE id = $1`, [id]),
      db.query(`
        SELECT sp.id, sp.display_name, sp.username, sp.avatar_key, sp.age_label
        FROM public.guardian_student_links gsl
        JOIN public.student_profiles sp ON sp.id = gsl.student_id
        WHERE gsl.guardian_id = $1
      `, [id]),
    ]);

    if (!familyRes.rowCount) return NextResponse.json({ error: "Family not found." }, { status: 404 });

    return NextResponse.json({ family: familyRes.rows[0], children: childrenRes.rows });
  } catch (err) {
    if (isDatabaseConnectionError(err)) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    console.error("[api/admin/families/[id] GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// PATCH /api/admin/families/[id] — update guardian fields
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
  if (typeof body.email === "string") { sets.push(`email = $${idx++}`); vals.push(body.email.trim().toLowerCase() || null); }
  if (typeof body.testerFlag === "boolean") { sets.push(`tester_flag = $${idx++}`); vals.push(body.testerFlag); }

  if (sets.length === 0) return NextResponse.json({ error: "No fields to update." }, { status: 400 });

  vals.push(id);
  try {
    const result = await db.query(
      `UPDATE public.guardian_profiles SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
      vals
    );
    if (!result.rowCount) return NextResponse.json({ error: "Family not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    console.error("[api/admin/families PATCH]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// DELETE /api/admin/families/[id] — hard delete (super_admin only)
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
    await client.query(`DELETE FROM public.guardian_student_links WHERE guardian_id = $1`, [id]);
    await client.query(`DELETE FROM public.access_sessions WHERE guardian_id = $1`, [id]);
    await client.query(`DELETE FROM public.guardian_profiles WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    if (isDatabaseConnectionError(err)) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    console.error("[api/admin/families DELETE]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  } finally {
    client.release();
  }
}
