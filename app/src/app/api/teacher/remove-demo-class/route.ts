import { NextRequest, NextResponse } from "next/server";
import { isValidTeacherId } from "@/lib/teacher-identity";
import { removeVirtualClassroom } from "@/lib/virtual-classroom";

export async function POST(request: NextRequest) {
  const teacherId = request.cookies.get("wonderquest-teacher-id")?.value ?? "";
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const removed = await removeVirtualClassroom(teacherId);
    return NextResponse.json({ removed });
  } catch (error) {
    console.error("[api/teacher/remove-demo-class]", error);
    return NextResponse.json({ error: "Failed to remove demo classroom" }, { status: 500 });
  }
}
