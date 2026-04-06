import { NextRequest, NextResponse } from "next/server";
import { upsertTeacherNote } from "@/lib/teacher-service";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as {
      teacherId?: string;
      studentId?: string;
      body?: string;
    };

    if (!body.teacherId || !body.studentId || !body.body) {
      return NextResponse.json(
        { error: "teacherId, studentId, and body are required" },
        { status: 400 },
      );
    }

    await upsertTeacherNote(body.teacherId, body.studentId, body.body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/teacher/notes PUT] error:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
