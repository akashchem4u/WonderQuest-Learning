import { NextRequest, NextResponse } from "next/server";
import { getAssignmentProgress } from "@/lib/teacher-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }

  const { assignmentId } = await params;

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  try {
    const progress = await getAssignmentProgress(teacherId, assignmentId);

    if (!progress) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("[api/teacher/assignments/[assignmentId]/progress GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch assignment progress" }, { status: 500 });
  }
}
