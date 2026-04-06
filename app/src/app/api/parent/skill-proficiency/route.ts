import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession, ParentAccessSessionError } from "@/lib/parent-access";
import { db } from "@/lib/db";
import { getSkillProficiencySummary } from "@/lib/mastery-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const childId = request.nextUrl.searchParams.get("childId")?.trim() || null;

    // Get the linked child (first linked if no childId)
    const studentQ = await db.query(
      `select sp.id, sp.display_name, sp.launch_band_code
       from public.guardian_student_links gsl
       join public.student_profiles sp on sp.id = gsl.student_id
       where gsl.guardian_id = $1
         and ($2::uuid is null or sp.id = $2::uuid)
       order by sp.display_name asc limit 1`,
      [guardianId, childId],
    );
    if (!studentQ.rowCount) {
      return NextResponse.json({ error: "Child not found." }, { status: 404 });
    }
    const student = studentQ.rows[0];
    const summary = await getSkillProficiencySummary(
      String(student.id),
      String(student.launch_band_code),
    );

    const proficientCount = summary.filter((s) => s.proficientAt).length;
    const inProgressCount = summary.filter((s) => !s.proficientAt && s.sessionCount > 0).length;
    const notStartedCount = summary.filter((s) => s.sessionCount === 0).length;

    return NextResponse.json({
      studentId: String(student.id),
      displayName: String(student.display_name),
      bandCode: String(student.launch_band_code),
      summary: { proficientCount, inProgressCount, notStartedCount, total: summary.length },
      skills: summary,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load proficiency." },
      { status },
    );
  }
}
