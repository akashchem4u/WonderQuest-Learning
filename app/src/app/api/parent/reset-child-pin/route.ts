import { NextRequest, NextResponse } from "next/server";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { db } from "@/lib/db";
import { hashPin, validatePin } from "@/lib/pin";

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = await request.json();
    const { studentId, newPin } = body as { studentId?: string; newPin?: string };

    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    if (!newPin || !validatePin(newPin)) {
      return NextResponse.json({ error: "PIN must be exactly 4 digits." }, { status: 400 });
    }

    // Verify the guardian owns this student
    const link = await db.query(
      `select 1
       from public.guardian_student_links
       where guardian_id = $1 and student_id = $2
       limit 1`,
      [guardianId, studentId],
    );

    if (!link.rowCount) {
      return NextResponse.json({ error: "Child not linked to this account." }, { status: 403 });
    }

    // Fetch the student's username (needed for PIN hashing)
    const studentRow = await db.query(
      `select username from public.student_profiles where id = $1 limit 1`,
      [studentId],
    );

    if (!studentRow.rowCount) {
      return NextResponse.json({ error: "Child not found." }, { status: 404 });
    }

    const username = String(studentRow.rows[0].username);
    const newHash = hashPin(newPin, username);

    await db.query(
      `update public.student_profiles set pin_hash = $1 where id = $2`,
      [newHash, studentId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PIN reset failed." },
      { status },
    );
  }
}
