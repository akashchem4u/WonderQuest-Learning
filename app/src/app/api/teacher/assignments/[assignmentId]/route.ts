import { NextRequest, NextResponse } from "next/server";
import {
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from "@/lib/prototype-service";
import { hasTeacherAccess } from "@/lib/teacher-access";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  try {
    const { assignmentId } = await params;
    const body = await request.json();
    const payload = await updateTeacherAssignment(assignmentId, {
      teacherId: body.teacherId,
      title: body.title,
      description: body.description,
      skillCodes: body.skillCodes,
      launchBandCode: body.launchBandCode,
      sessionMode: body.sessionMode,
      dueDate: body.dueDate,
      studentIds: body.studentIds,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assignment could not be updated.";
    const status = message === "Assignment was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  try {
    const { assignmentId } = await params;
    const teacherId = request.nextUrl.searchParams.get("teacherId")?.trim() ?? "";
    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required." }, { status: 400 });
    }
    const payload = await deleteTeacherAssignment(teacherId, assignmentId);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assignment could not be deleted.";
    const status = message === "Assignment was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
