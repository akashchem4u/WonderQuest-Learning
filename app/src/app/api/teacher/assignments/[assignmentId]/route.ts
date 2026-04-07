import { NextRequest, NextResponse } from "next/server";
import {
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from "@/lib/prototype-service";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  try {
    const { assignmentId } = await params;
    const body = await request.json();
    const auth = await requireTeacherSession(request, body.teacherId);

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;
    const payload = await updateTeacherAssignment(assignmentId, {
      teacherId,
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
  try {
    const { assignmentId } = await params;
    const auth = await requireTeacherSession(
      request,
      request.nextUrl.searchParams.get("teacherId"),
    );

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;
    const payload = await deleteTeacherAssignment(teacherId, assignmentId);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assignment could not be deleted.";
    const status = message === "Assignment was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
