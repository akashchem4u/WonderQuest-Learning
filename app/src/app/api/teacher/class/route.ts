import { NextRequest, NextResponse } from "next/server";
import { getTeacherClassRoster } from "@/lib/teacher-service";
import { requireTeacherSession } from "@/lib/teacher-session";

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
    const roster = await getTeacherClassRoster(teacherId);
    return NextResponse.json({ roster });
  } catch (error) {
    console.error("[api/teacher/class] error:", error);
    return NextResponse.json({ error: "Failed to fetch class roster" }, { status: 500 });
  }
}
