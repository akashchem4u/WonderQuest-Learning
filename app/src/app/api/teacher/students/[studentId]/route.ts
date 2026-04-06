import { NextRequest, NextResponse } from "next/server";
import { getTeacherStudentDetail } from "@/lib/teacher-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }

  try {
    const detail = await getTeacherStudentDetail(teacherId, studentId);
    if (!detail) {
      return NextResponse.json({ error: "Student not found or not on your roster" }, { status: 404 });
    }
    return NextResponse.json({ student: detail });
  } catch (error) {
    console.error("[api/teacher/students] error:", error);
    return NextResponse.json({ error: "Failed to fetch student detail" }, { status: 500 });
  }
}
