import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const result = await db.query(
      `
        SELECT
          tp.school_name,
          COUNT(DISTINCT tp.id) AS teacher_count,
          (
            SELECT COUNT(*)
            FROM public.teacher_student_roster tsr
            JOIN public.teacher_profiles tp2 ON tp2.id = tsr.teacher_id
            WHERE tp2.school_name = tp.school_name
              AND tsr.active = true
          ) AS student_count
        FROM public.teacher_profiles tp
        WHERE tp.school_name IS NOT NULL
          AND tp.school_name <> ''
          AND tp.tester_flag = false
        GROUP BY tp.school_name
        ORDER BY teacher_count DESC, tp.school_name ASC
      `,
    );

    const schools = result.rows.map((row) => ({
      schoolName: row.school_name as string,
      teacherCount: Number(row.teacher_count ?? 0),
      studentCount: Number(row.student_count ?? 0),
    }));

    const totals = {
      schoolCount: schools.length,
      teacherCount: schools.reduce((sum, s) => sum + s.teacherCount, 0),
      studentCount: schools.reduce((sum, s) => sum + s.studentCount, 0),
    };

    return NextResponse.json({ schools, totals });
  } catch (error) {
    console.error("[api/owner/schools] error:", error);
    return NextResponse.json({ error: "Failed to fetch schools data" }, { status: 500 });
  }
}
