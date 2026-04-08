import { NextRequest, NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(request: NextRequest) {
  const session = await requireTeacherSession(request);
  if (!session.ok) return session.response;
  return NextResponse.json({ teacherId: session.teacherId });
}
