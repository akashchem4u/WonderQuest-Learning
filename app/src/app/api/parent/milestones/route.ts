import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { getStudentMilestones } from "@/lib/milestone-service";

// GET /api/parent/milestones?studentId=
export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Verify guardian has access to this student
    const linkResult = await db.query(
      `
        select student_id
        from public.guardian_student_links
        where guardian_id = $1 and student_id = $2
        limit 1
      `,
      [guardianId, studentId],
    );

    if (!linkResult.rowCount) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const milestones = await getStudentMilestones(studentId, 50);

    return NextResponse.json({ milestones });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch milestones" },
      { status },
    );
  }
}
