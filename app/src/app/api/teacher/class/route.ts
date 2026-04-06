import { NextRequest, NextResponse } from "next/server";
import { getTeacherClassRoster } from "@/lib/teacher-service";
import { isValidTeacherId } from "@/lib/teacher-identity";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ roster: [] });
  }

  try {
    const roster = await getTeacherClassRoster(teacherId);
    return NextResponse.json({ roster });
  } catch (error) {
    console.error("[api/teacher/class] error:", error);
    return NextResponse.json({ error: "Failed to fetch class roster" }, { status: 500 });
  }
}
