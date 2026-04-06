import { NextRequest, NextResponse } from "next/server";
import {
  createTeacherAssignment,
  listTeacherAssignments,
} from "@/lib/prototype-service";
import { hasTeacherAccess } from "@/lib/teacher-access";

function readTeacherId(value: string | null) {
  return value?.trim() ?? "";
}

export async function GET(request: NextRequest) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  const teacherId = readTeacherId(request.nextUrl.searchParams.get("teacherId"));

  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required." },
      { status: 400 },
    );
  }

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
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const payload = await createTeacherAssignment({
      teacherId: body.teacherId,
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
