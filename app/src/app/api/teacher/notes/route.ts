import { NextRequest, NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(request);
  if (!auth.ok) return auth.response;
  const { teacherId } = auth;

  const { db } = await import("@/lib/db");
  try {
    const res = await db.query(
      `select tn.id, tn.body as note_text, tn.created_at, tn.student_id,
              sp.display_name as student_name
       from public.teacher_notes tn
       join public.student_profiles sp on sp.id = tn.student_id
       where tn.teacher_id = $1
       order by tn.created_at desc limit 50`,
      [teacherId],
    );
    return NextResponse.json({ notes: res.rows });
  } catch {
    return NextResponse.json({ notes: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTeacherSession(request);
  if (!auth.ok) return auth.response;
  const { teacherId } = auth;

  const body = await request.json() as { noteText?: string; studentId?: string };
  const noteText = (body.noteText ?? "").trim().slice(0, 500);
  const studentId = (body.studentId ?? "").trim();

  if (!noteText || !studentId) {
    return NextResponse.json({ error: "Note text and student are required." }, { status: 400 });
  }

  const { db } = await import("@/lib/db");
  try {
    const res = await db.query(
      `insert into public.teacher_notes (teacher_id, student_id, body)
       values ($1, $2, $3) returning id, created_at`,
      [teacherId, studentId, noteText],
    );
    return NextResponse.json({ ok: true, note: res.rows[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("does not exist")) {
      return NextResponse.json({ error: "Notes feature not yet available." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to save note." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireTeacherSession(request);
  if (!auth.ok) return auth.response;
  const { teacherId } = auth;

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("id") ?? "";
  if (!noteId) return NextResponse.json({ error: "Note id required." }, { status: 400 });

  const { db } = await import("@/lib/db");
  try {
    await db.query(
      `delete from public.teacher_notes where id = $1 and teacher_id = $2`,
      [noteId, teacherId],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
  }
}
