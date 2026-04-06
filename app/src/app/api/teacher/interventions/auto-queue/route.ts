import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/teacher/interventions/auto-queue?teacherId=...
 * Returns interventions with intervention_type='skill-support' (auto-triggered).
 * Indicates which were auto-triggered vs manually created.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }

  try {
    const result = await db.query(
      `
        SELECT
          ti.id,
          ti.student_id,
          sp.display_name AS student_name,
          ti.skill_code,
          ti.reason,
          ti.intervention_type,
          ti.status,
          ti.teacher_note,
          ti.created_at,
          ti.resolved_at,
          ti.resolution_note,
          (ti.intervention_type = 'skill-support') AS auto_triggered
        FROM public.teacher_interventions ti
        JOIN public.student_profiles sp ON sp.id = ti.student_id
        WHERE ti.teacher_id = $1
          AND ti.status = 'active'
        ORDER BY
          (ti.intervention_type = 'skill-support') DESC,
          ti.created_at DESC
      `,
      [teacherId],
    );

    const interventions = result.rows.map((r) => ({
      id: r.id as string,
      studentId: r.student_id as string,
      studentName: r.student_name as string,
      skillCode: (r.skill_code as string | null) ?? null,
      reason: r.reason as string,
      interventionType: r.intervention_type as string,
      status: r.status as string,
      teacherNote: (r.teacher_note as string | null) ?? null,
      createdAt: r.created_at as string,
      resolvedAt: (r.resolved_at as string | null) ?? null,
      resolutionNote: (r.resolution_note as string | null) ?? null,
      autoTriggered: Boolean(r.auto_triggered),
    }));

    const autoCount = interventions.filter((i) => i.autoTriggered).length;
    const manualCount = interventions.length - autoCount;

    return NextResponse.json({ interventions, autoCount, manualCount });
  } catch (error) {
    console.error("[api/teacher/interventions/auto-queue GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch auto-queue" }, { status: 500 });
  }
}
