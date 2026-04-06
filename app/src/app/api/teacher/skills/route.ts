import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidTeacherId } from "@/lib/teacher-identity";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId")?.trim() ?? "";
  const bandsParam = request.nextUrl.searchParams.get("bands")?.trim() ?? "";

  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ skills: [] });
  }

  try {
    // If band codes provided use them, else derive from roster
    let bandCodes: string[] = bandsParam
      ? bandsParam.split(",").map((b) => b.trim()).filter(Boolean)
      : [];

    if (!bandCodes.length) {
      const rosterRes = await db.query(
        `select distinct sp.launch_band_code
         from public.teacher_student_links tsl
         join public.student_profiles sp on sp.id = tsl.student_id
         where tsl.teacher_id = $1`,
        [teacherId],
      );
      bandCodes = rosterRes.rows.map((r) => String(r.launch_band_code));
    }

    // Fall back to all bands if roster is empty
    const whereClause = bandCodes.length
      ? `where s.active = true and s.launch_band_code = any($1::text[])`
      : `where s.active = true`;
    const params = bandCodes.length ? [bandCodes] : [];

    const result = await db.query(
      `select s.code, s.display_name, s.subject_code, s.launch_band_code
       from public.skills s
       ${whereClause}
       order by s.launch_band_code, s.subject_code, s.display_name`,
      params,
    );

    const skills = result.rows.map((r) => ({
      code: String(r.code),
      name: String(r.display_name),
      subject: String(r.subject_code),
      band: String(r.launch_band_code),
    }));

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("[api/teacher/skills] error:", error);
    return NextResponse.json({ skills: [] });
  }
}
