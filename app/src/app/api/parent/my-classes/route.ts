import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const rows = await db.query(
      `SELECT
        sp.id as student_id,
        sp.display_name as student_name,
        tp.id as teacher_id,
        tp.display_name as teacher_name,
        tp.school_name,
        tp.class_code,
        tsr.added_at as joined_at
      FROM public.guardian_student_links gsl
      JOIN public.student_profiles sp ON sp.id = gsl.student_id
      JOIN public.teacher_student_roster tsr ON tsr.student_id = gsl.student_id AND tsr.active = true
      JOIN public.teacher_profiles tp ON tp.id = tsr.teacher_id
      WHERE gsl.guardian_id = $1
      ORDER BY sp.display_name, tsr.added_at DESC`,
      [guardianId]
    );

    const classes = rows.rows.map((r: Record<string, unknown>) => ({
      studentId: r.student_id,
      studentName: r.student_name,
      teacherId: r.teacher_id,
      teacherName: r.teacher_name,
      schoolName: r.school_name ?? null,
      classCode: r.class_code,
      joinedAt: r.joined_at,
    }));

    return NextResponse.json({ classes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load classes." },
      { status: 400 }
    );
  }
}
