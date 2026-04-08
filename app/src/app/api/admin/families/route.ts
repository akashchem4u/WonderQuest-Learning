import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// GET /api/admin/families — list all guardians/parents
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await db.query(`
      SELECT
        gp.id,
        gp.display_name,
        gp.email,
        gp.username,
        gp.relationship_label,
        gp.tester_flag,
        gp.last_active_at,
        gp.google_id IS NOT NULL AS has_google,
        gp.password_hash IS NOT NULL AS has_password,
        COUNT(DISTINCT gsl.student_id) AS child_count
      FROM public.guardian_profiles gp
      LEFT JOIN public.guardian_student_links gsl ON gsl.guardian_id = gp.id
      GROUP BY gp.id
      ORDER BY gp.display_name ASC
    `);

    return NextResponse.json({ families: result.rows });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/families GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
