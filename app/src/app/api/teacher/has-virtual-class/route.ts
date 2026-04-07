import { NextRequest, NextResponse } from "next/server";
import { hasVirtualClassroom } from "@/lib/virtual-classroom";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { teacherId } = auth;
    const isVirtual = await hasVirtualClassroom(teacherId);
    return NextResponse.json({ isVirtual });
  } catch {
    return NextResponse.json({ error: "Failed to load virtual class state." }, { status: 500 });
  }
}
