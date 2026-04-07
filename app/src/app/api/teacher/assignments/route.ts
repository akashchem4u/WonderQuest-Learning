import { NextRequest, NextResponse } from "next/server";
import {
  createTeacherAssignment,
  listTeacherAssignments,
} from "@/lib/prototype-service";
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
    const payload = await listTeacherAssignments(teacherId);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assignments could not be loaded.";
    const status = message === "Teacher profile was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = await requireTeacherSession(request, body.teacherId);

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;
    const payload = await createTeacherAssignment({
      teacherId,
      title: body.title,
      description: body.description,
      skillCodes: body.skillCodes,
      launchBandCode: body.launchBandCode,
      sessionMode: body.sessionMode,
      dueDate: body.dueDate,
      studentIds: body.studentIds,
    });

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assignment could not be created.";
    const status = message === "Teacher profile was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
