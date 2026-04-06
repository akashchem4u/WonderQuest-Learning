import { NextRequest, NextResponse } from "next/server";
import { hasTeacherAccess } from "@/lib/teacher-access";
import { getTeacherProfile, updateTeacherProfile } from "@/lib/teacher-service";

const TEACHER_ID_COOKIE = "wonderquest-teacher-id";

export async function GET(request: NextRequest) {
  const allowed = await hasTeacherAccess();
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = request.cookies.get(TEACHER_ID_COOKIE)?.value ?? "";
  if (!teacherId) {
    return NextResponse.json({ error: "No teacher identity cookie found." }, { status: 400 });
  }

  const profile = await getTeacherProfile(teacherId);
  if (!profile) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const allowed = await hasTeacherAccess();
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = request.cookies.get(TEACHER_ID_COOKIE)?.value ?? "";
  if (!teacherId) {
    return NextResponse.json({ error: "No teacher identity cookie found." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      displayName?: string;
      schoolName?: string;
      gradeLevels?: string[];
    };

    await updateTeacherProfile(teacherId, {
      displayName: body.displayName,
      schoolName: body.schoolName,
      gradeLevels: body.gradeLevels,
    });

    const updated = await getTeacherProfile(teacherId);
    return NextResponse.json({ profile: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}
