import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    const staleStudentsResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM public.student_profiles
      WHERE last_active_at IS NOT NULL
        AND last_active_at < now() - INTERVAL '12 months'
    `);

    const staleGuardiansResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM public.guardian_profiles
      WHERE last_active_at IS NOT NULL
        AND last_active_at < now() - INTERVAL '12 months'
    `);

    return NextResponse.json({
      staleStudents: Number(staleStudentsResult.rows[0]?.count ?? 0),
      staleGuardians: Number(staleGuardiansResult.rows[0]?.count ?? 0),
      policy: "delete after 12 months inactive",
      lastRun: null,
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[retention-report GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
