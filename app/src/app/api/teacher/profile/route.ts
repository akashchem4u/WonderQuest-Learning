import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeacherSession } from "@/lib/teacher-session";
import { updateTeacherProfile, ensureTeacherClassCode } from "@/lib/teacher-service";

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );

  if (!auth.ok) {
    return auth.response;
  }

  const { teacherId } = auth;

  try {
    const teacher = await db.query(
      `
        select id, display_name, school_name, username, grade_levels, email, created_at
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

    const row = teacher.rows[0];
    const displayName = String(row.display_name ?? "Teacher");
    const username = String(row.username ?? "");
    const schoolName = (row.school_name as string | null) ?? null;
    const gradeLevels = (row.grade_levels as string[] | null) ?? [];
    const email = (row.email as string | null) ?? null;
    const createdAt = (row.created_at as string | null) ?? null;

    const classCode = await ensureTeacherClassCode(teacherId);

    return NextResponse.json({
      profile: {
        displayName,
        username,
        schoolName,
        gradeLevels,
        email,
        classCode,
        createdAt,
        launchBandCode:
          dominantBand.rows[0]?.launch_band_code === null ||
          dominantBand.rows[0]?.launch_band_code === undefined
            ? null
            : String(dominantBand.rows[0].launch_band_code),
        // Flag: profile incomplete if displayName equals username or schoolName is missing
        isIncomplete: displayName === username || !schoolName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Teacher profile lookup failed." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { teacherId } = auth;

  try {
    const body = (await request.json()) as {
      displayName?: string;
      schoolName?: string | null;
      gradeLevels?: string[];
      email?: string | null;
    };

    await updateTeacherProfile(teacherId, {
      displayName: body.displayName,
      schoolName: body.schoolName ?? undefined,
      gradeLevels: body.gradeLevels,
      email: body.email ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profile update failed." },
      { status: 400 },
    );
  }
}
