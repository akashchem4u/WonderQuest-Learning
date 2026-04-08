import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// POST /api/admin/links — link or unlink guardian↔student
// Body: { action: "link"|"unlink", guardianId: string, studentId: string, relationshipLabel?: string }
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  let body: { action?: unknown; guardianId?: unknown; studentId?: unknown; relationshipLabel?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action === "link" || body.action === "unlink" ? body.action : null;
  const guardianId = typeof body.guardianId === "string" ? body.guardianId : null;
  const studentId = typeof body.studentId === "string" ? body.studentId : null;
  const relationshipLabel = typeof body.relationshipLabel === "string" ? body.relationshipLabel : "parent";

  if (!action || !guardianId || !studentId) {
    return NextResponse.json({ error: "action, guardianId, and studentId are required." }, { status: 400 });
  }

  try {
    if (action === "link") {
      await db.query(
        `INSERT INTO public.guardian_student_links (guardian_id, student_id, relationship_label)
         VALUES ($1, $2, $3)
         ON CONFLICT (guardian_id, student_id) DO UPDATE SET relationship_label = EXCLUDED.relationship_label`,
        [guardianId, studentId, relationshipLabel]
      );
    } else {
      await db.query(
        `DELETE FROM public.guardian_student_links WHERE guardian_id = $1 AND student_id = $2`,
        [guardianId, studentId]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/links POST]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// POST-style GET for checking existing links
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const guardianId = url.searchParams.get("guardianId");
  const studentId = url.searchParams.get("studentId");

  if (!guardianId && !studentId) {
    return NextResponse.json({ error: "Provide guardianId or studentId." }, { status: 400 });
  }

  try {
    let result;
    if (guardianId) {
      result = await db.query(`
        SELECT gsl.student_id, sp.display_name, sp.username, sp.avatar_key, sp.age_label, gsl.relationship_label
        FROM public.guardian_student_links gsl
        JOIN public.student_profiles sp ON sp.id = gsl.student_id
        WHERE gsl.guardian_id = $1
      `, [guardianId]);
      return NextResponse.json({ links: result.rows });
    } else {
      result = await db.query(`
        SELECT gsl.guardian_id, gp.display_name, gp.email, gp.username, gsl.relationship_label
        FROM public.guardian_student_links gsl
        JOIN public.guardian_profiles gp ON gp.id = gsl.guardian_id
        WHERE gsl.student_id = $1
      `, [studentId]);
      return NextResponse.json({ links: result.rows });
    }
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/links GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
