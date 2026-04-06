import { NextRequest, NextResponse } from "next/server";
import { getTeacherAssignments, createAssignment } from "@/lib/teacher-service";
import { isValidTeacherId } from "@/lib/teacher-identity";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ assignments: [] });
  }

  try {
    const assignments = await getTeacherAssignments(teacherId);
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("[api/teacher/assignments GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      teacherId?: string;
      title?: string;
      description?: string;
      skillCodes?: string[];
      launchBandCode?: string;
      sessionMode?: string;
      dueDate?: string;
      studentIds?: string[];
    };

    if (!body.teacherId || !body.title || !body.skillCodes) {
      return NextResponse.json(
        { error: "teacherId, title, and skillCodes are required" },
        { status: 400 },
      );
    }

    const result = await createAssignment({
      teacherId: body.teacherId,
      title: body.title,
      description: body.description,
      skillCodes: body.skillCodes,
      launchBandCode: body.launchBandCode,
      sessionMode: body.sessionMode,
      dueDate: body.dueDate,
      studentIds: body.studentIds ?? [],
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[api/teacher/assignments POST] error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
