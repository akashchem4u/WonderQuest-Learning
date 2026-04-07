import { NextRequest, NextResponse } from "next/server";
import { getAssignmentProgress } from "@/lib/teacher-service";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );

  if (!auth.ok) {
    return auth.response;
  }

  const { assignmentId } = await params;

  const { teacherId } = auth;

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
