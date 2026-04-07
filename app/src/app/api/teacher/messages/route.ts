import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidTeacherId } from "@/lib/teacher-identity";

// GET — fetch sent messages for this teacher
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
  }
  try {
    const result = await db.query(`
      select
        sn.id,
        sn.student_id,
        sp.display_name as student_name,
        sn.title,
        sn.description as body,
        sn.created_at,
        sn.read
      from public.student_notifications sn
      join public.student_profiles sp on sp.id = sn.student_id
      join public.teacher_student_roster tsr on tsr.student_id = sn.student_id
      where tsr.teacher_id = $1
        and sn.type = 'teacher_message'
      order by sn.created_at desc
      limit 50
    `, [teacherId]);
    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed." }, { status: 400 });
  }
}

// POST — send a message to a student's guardian(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, studentId, title, messageBody } = body as {
      teacherId?: string;
      studentId?: string;
      title?: string;
      messageBody?: string;
    };

    if (!isValidTeacherId(teacherId)) return NextResponse.json({ error: "teacherId required" }, { status: 400 });
    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });
    if (!title?.trim() || !messageBody?.trim()) return NextResponse.json({ error: "title and message required" }, { status: 400 });
    if (title.length > 120) return NextResponse.json({ error: "Title too long (max 120 chars)" }, { status: 400 });
    if (messageBody.length > 1000) return NextResponse.json({ error: "Message too long (max 1000 chars)" }, { status: 400 });

    // Verify teacher is linked to this student
    const link = await db.query(
      `select 1 from public.teacher_student_roster where teacher_id = $1 and student_id = $2 limit 1`,
      [teacherId, studentId]
    );
    if (!link.rowCount) return NextResponse.json({ error: "Student not in your class." }, { status: 403 });

    // Get guardian(s) linked to this student
    const guardians = await db.query(
      `select guardian_id from public.guardian_student_links where student_id = $1`,
      [studentId]
    );

    // Insert notification for each guardian
    const inserts = guardians.rows.map((g: { guardian_id: string }) =>
      db.query(
        `insert into public.student_notifications
           (student_id, guardian_id, type, title, description)
         values ($1, $2, 'teacher_message', $3, $4)`,
        [studentId, g.guardian_id, title.trim(), messageBody.trim()]
      )
    );

    // Also insert a notification with no specific guardian if none found (so teacher can see sent log)
    if (guardians.rowCount === 0) {
      await db.query(
        `insert into public.student_notifications
           (student_id, guardian_id, type, title, description)
         values ($1, null, 'teacher_message', $2, $3)`,
        [studentId, title.trim(), messageBody.trim()]
      );
    } else {
      await Promise.all(inserts);
    }

    return NextResponse.json({ success: true, recipientCount: guardians.rowCount ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send." }, { status: 400 });
  }
}
