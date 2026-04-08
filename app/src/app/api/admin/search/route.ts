import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// GET /api/admin/search?type=guardian|student|teacher&q=<text>
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "guardian";
  const q = (url.searchParams.get("q") ?? "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const like = `%${q.toLowerCase()}%`;

  try {
    let result;
    if (type === "guardian") {
      result = await db.query(`
        SELECT id, display_name, email, username,
               COUNT(DISTINCT gsl.student_id) AS child_count
        FROM public.guardian_profiles gp
        LEFT JOIN public.guardian_student_links gsl ON gsl.guardian_id = gp.id
        WHERE LOWER(gp.display_name) LIKE $1
           OR LOWER(gp.email) LIKE $1
           OR LOWER(gp.username) LIKE $1
        GROUP BY gp.id
        ORDER BY gp.display_name ASC
        LIMIT 10
      `, [like]);
    } else if (type === "student") {
      result = await db.query(`
        SELECT id, display_name, username, age_label, launch_band_code
        FROM public.student_profiles
        WHERE LOWER(display_name) LIKE $1
           OR LOWER(username) LIKE $1
        ORDER BY display_name ASC
        LIMIT 10
      `, [like]);
    } else {
      result = await db.query(`
        SELECT id, display_name, email, username, school_name
        FROM public.teacher_profiles
        WHERE LOWER(display_name) LIKE $1
           OR LOWER(email) LIKE $1
           OR LOWER(username) LIKE $1
        ORDER BY display_name ASC
        LIMIT 10
      `, [like]);
    }

    return NextResponse.json({ results: result.rows });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/search GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
