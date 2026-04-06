import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";

// GET /api/parent/notifications?studentId=
export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Verify guardian has access to this student
    const linkResult = await db.query(
      `
        select student_id
        from public.guardian_student_links
        where guardian_id = $1 and student_id = $2
        limit 1
      `,
      [guardianId, studentId],
    );

    if (!linkResult.rowCount) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await db.query(
      `
        select id, type, title, description, value, read, created_at
        from public.student_notifications
        where student_id = $1 and guardian_id = $2
        order by created_at desc
        limit 50
      `,
      [studentId, guardianId],
    );

    const notifications = result.rows.map((row) => ({
      id: row.id as string,
      type: row.type as string,
      title: row.title as string,
      description: row.description as string,
      value: (row.value as string | null) ?? null,
      read: row.read as boolean,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status },
    );
  }
}

// PATCH /api/parent/notifications — mark notifications as read
// Body: { ids: string[] }
export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];

    if (ids.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Build parameterised list — guard to guardian_id so parents can only mark their own
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
    const result = await db.query(
      `
        update public.student_notifications
        set read = true
        where guardian_id = $1 and id in (${placeholders})
      `,
      [guardianId, ...ids],
    );

    return NextResponse.json({ updated: result.rowCount ?? 0 });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update notifications" },
      { status },
    );
  }
}
