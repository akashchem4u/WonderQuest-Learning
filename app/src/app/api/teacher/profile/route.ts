import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasTeacherAccess } from "@/lib/teacher-access";

function readTeacherId(value: string | null) {
  return value?.trim() ?? "";
}

export async function GET(request: NextRequest) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  const teacherId = readTeacherId(request.nextUrl.searchParams.get("teacherId"));

  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required." },
      { status: 400 },
    );
  }

  try {
    const teacher = await db.query(
      `
        select id, display_name
        from public.teacher_profiles
        where id = $1
        limit 1
      `,
      [teacherId],
    );

    if (!teacher.rowCount) {
      return NextResponse.json(
        { error: "Teacher profile was not found." },
        { status: 404 },
      );
    }

    const dominantBand = await db.query(
      `
        select sp.launch_band_code
        from public.teacher_student_roster tsr
        join public.student_profiles sp
          on sp.id = tsr.student_id
        where tsr.teacher_id = $1
          and tsr.active = true
        group by sp.launch_band_code
        order by count(*) desc, sp.launch_band_code asc
        limit 1
      `,
      [teacherId],
    );

    return NextResponse.json({
      profile: {
        displayName: String(teacher.rows[0].display_name ?? "Teacher"),
        launchBandCode:
          dominantBand.rows[0]?.launch_band_code === null ||
          dominantBand.rows[0]?.launch_band_code === undefined
            ? null
            : String(dominantBand.rows[0].launch_band_code),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Teacher profile lookup failed." },
      { status: 400 },
    );
  }
}
