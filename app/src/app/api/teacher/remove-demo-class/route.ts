import { NextRequest, NextResponse } from "next/server";
import { removeVirtualClassroom } from "@/lib/virtual-classroom";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function POST(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { teacherId } = auth;
    const removed = await removeVirtualClassroom(teacherId);
    return NextResponse.json({ removed });
  } catch (error) {
    console.error("[api/teacher/remove-demo-class]", error);
    return NextResponse.json({ error: "Failed to remove demo classroom" }, { status: 500 });
  }
}
