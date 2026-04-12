import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeacherSession } from "@/lib/teacher-session";

// POST /api/teacher/take-action
// A unified endpoint that dispatches one of four teacher actions
// from a single learner-skill context, without page navigation.
//
// Body:
// {
//   studentId: string,
//   skillCode: string,
//   actionType: "push_session" | "assignment" | "note" | "message",
//   note?: string,        // for note and message actions
//   dueDate?: string,     // for assignment action (ISO date)
//   teacherId?: string,   // optional override
// }

type ActionType = "push_session" | "assignment" | "note" | "message";

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    studentId?: string;
    skillCode?: string;
    actionType?: ActionType;
    note?: string;
    dueDate?: string;
    teacherId?: string;
  };

  const auth = await requireTeacherSession(request, body.teacherId ?? request.nextUrl.searchParams.get("teacherId"));
  if (!auth.ok) return auth.response;
  const { teacherId } = auth;

  const { studentId, skillCode, actionType, note, dueDate } = body;

  if (!studentId || !skillCode || !actionType) {
    return NextResponse.json(
      { error: "studentId, skillCode, and actionType are required." },
      { status: 400 },
    );
  }

  const validActions: ActionType[] = ["push_session", "assignment", "note", "message"];
  if (!validActions.includes(actionType)) {
    return NextResponse.json(
      { error: `actionType must be one of: ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  // Verify student is on this teacher's roster
  const rosterCheck = await db.query(
    `select 1 from public.teacher_student_roster
     where teacher_id = $1 and student_id = $2 and active = true limit 1`,
    [teacherId, studentId],
  );
  if (!rosterCheck.rowCount) {
    return NextResponse.json(
      { error: "Student not found on your roster." },
      { status: 404 },
    );
  }

  // Verify skill exists
  const skillRow = await db.query(
    `select id, display_name from public.skills where code = $1 limit 1`,
    [skillCode],
  );
  if (!skillRow.rowCount) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }
  const skillName = skillRow.rows[0].display_name as string;

  // ── Dispatch the action ───────────────────────────────────────────────────
  let actionId: string | null = null;
  const actionNote = note?.trim() || null;

  if (actionType === "push_session") {
    // Insert a pushed session for the student focused on this skill.
    // Columns: teacher_id, student_id, skill_code, reason, priority, note, is_ai_generated
    const result = await db.query(
      `insert into public.teacher_pushed_sessions
         (teacher_id, student_id, skill_code, reason, priority, note, is_ai_generated)
       values ($1, $2, $3, $4, $5, $6, false)
       returning id`,
      [teacherId, studentId, skillCode, "manual", "normal", actionNote],
    );
    actionId = result.rows[0]?.id as string;
  } else if (actionType === "assignment") {
    // Create a skill assignment via public.assignments + public.assignment_students.
    // skill_codes is a text[] column; wrap the single code in an array.
    const result = await db.query(
      `insert into public.assignments
         (teacher_id, title, description, skill_codes, due_date)
       values ($1, $2, $3, $4::text[], $5)
       returning id`,
      [
        teacherId,
        skillName,
        actionNote,
        [skillCode],
        dueDate ?? null,
      ],
    );
    actionId = result.rows[0]?.id as string;
    // Link the single student
    await db.query(
      `insert into public.assignment_students (assignment_id, student_id)
       values ($1, $2)
       on conflict do nothing`,
      [actionId, studentId],
    );
  } else if (actionType === "note") {
    // Add a teacher note on this student.
    // Columns: teacher_id, student_id, body  (no skill_code column on teacher_notes)
    const result = await db.query(
      `insert into public.teacher_notes (teacher_id, student_id, body)
       values ($1, $2, $3)
       returning id, created_at`,
      [teacherId, studentId, actionNote ?? ""],
    );
    actionId = result.rows[0]?.id as string;
  } else if (actionType === "message") {
    // Send a message to every guardian linked to this student via student_notifications.
    // Columns: student_id, guardian_id, type, title, description
    const guardians = await db.query(
      `select guardian_id from public.guardian_student_links where student_id = $1`,
      [studentId],
    );

    const messageTitle = `Update on "${skillName}"`;
    const messageBody =
      actionNote ??
      `Your child is working on "${skillName}". I wanted to share a quick update.`;

    if (!guardians.rowCount) {
      // No guardian — record against null so teacher sees it in their sent log
      const result = await db.query(
        `insert into public.student_notifications
           (student_id, guardian_id, type, title, description)
         values ($1, null, 'teacher_message', $2, $3)
         returning id`,
        [studentId, messageTitle, messageBody],
      );
      actionId = result.rows[0]?.id as string;
    } else {
      const inserts = await Promise.all(
        (guardians.rows as { guardian_id: string }[]).map((g) =>
          db.query(
            `insert into public.student_notifications
               (student_id, guardian_id, type, title, description)
             values ($1, $2, 'teacher_message', $3, $4)
             returning id`,
            [studentId, g.guardian_id, messageTitle, messageBody],
          ),
        ),
      );
      // Return the first notification's id as a representative action id
      actionId = inserts[0]?.rows[0]?.id as string;
    }
  }

  return NextResponse.json({
    ok: true,
    actionType,
    actionId,
    studentId,
    skillCode,
    skillName,
  });
}
