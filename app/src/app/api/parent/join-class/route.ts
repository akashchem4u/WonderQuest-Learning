import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { joinClassByCode } from "@/lib/teacher-service";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json();
    const classCode = (body.classCode ?? "").trim().toUpperCase();
    const studentId = (body.studentId ?? "").trim();

    if (!classCode || classCode.length < 4) {
      return NextResponse.json({ error: "Please enter a valid class code." }, { status: 400 });
    }

    // Verify this student belongs to this parent
    const link = await db.query(
      `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
      [guardianId, studentId]
    );
    if (!link.rowCount) {
      return NextResponse.json({ error: "Student not found." }, { status: 403 });
    }

    const result = await joinClassByCode({ classCode, studentId });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not join class." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { guardianId } = await requireParentAccessSession(request);
  const body = await request.json() as { studentId?: string; teacherId?: string };
  const studentId = (body.studentId ?? "").trim();
  const teacherId = (body.teacherId ?? "").trim();

  if (!studentId || !teacherId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  // Verify ownership
  const link = await db.query(
    `SELECT 1 FROM public.guardian_student_links WHERE guardian_id=$1 AND student_id=$2 LIMIT 1`,
    [guardianId, studentId]
  );
  if (!link.rowCount) return NextResponse.json({ error: "Not found" }, { status: 403 });

  await db.query(
    `UPDATE public.teacher_student_roster SET active=false WHERE teacher_id=$1 AND student_id=$2`,
    [teacherId, studentId]
  );
  return NextResponse.json({ ok: true });
}
