// DELETE /api/parent/delete-child
// Body: { studentId: string, confirmDelete: true }
// Permanently deletes child account and all associated data
// Requires parent session

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";

export async function DELETE(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    let body: { studentId?: string; confirmDelete?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { studentId, confirmDelete } = body;

    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    if (confirmDelete !== true) {
      return NextResponse.json(
        { error: "confirmDelete must be true to proceed with deletion." },
        { status: 400 },
      );
    }

    // Verify the student belongs to this guardian before deleting
    const ownershipCheck = await db.query(
      `
        select student_id
        from public.guardian_student_links
        where guardian_id = $1
          and student_id = $2::uuid
        limit 1
      `,
      [guardianId, studentId],
    );

    if (!ownershipCheck.rowCount) {
      return NextResponse.json(
        { error: "Student not found or not linked to this guardian." },
        { status: 404 },
      );
    }

    // Delete in FK-safe order
    await db.query(
      `DELETE FROM public.access_attempts WHERE identifier = $1::text`,
      [studentId],
    );

    await db.query(
      `DELETE FROM public.access_sessions WHERE student_id = $1::uuid`,
      [studentId],
    );

    // learning_sessions may not exist — guard with a table existence check
    const learningSessionsExists = await db.query(
      `
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'learning_sessions'
        limit 1
      `,
    );
    if (Number(learningSessionsExists.rowCount) > 0) {
      await db.query(
        `DELETE FROM public.learning_sessions WHERE student_id = $1::uuid`,
        [studentId],
      );
    }

    await db.query(
      `DELETE FROM public.guardian_student_links WHERE student_id = $1::uuid`,
      [studentId],
    );

    await db.query(
      `DELETE FROM public.student_profiles WHERE id = $1::uuid`,
      [studentId],
    );

    return NextResponse.json({
      deleted: true,
      message: "Child account and all data permanently deleted.",
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete child account.",
      },
      { status },
    );
  }
}
