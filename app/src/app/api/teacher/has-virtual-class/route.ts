import { NextRequest, NextResponse } from "next/server";
import { isValidTeacherId } from "@/lib/teacher-identity";
import { hasVirtualClassroom } from "@/lib/virtual-classroom";

export async function GET(request: NextRequest) {
  const teacherId = request.cookies.get("wonderquest-teacher-id")?.value ?? "";
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ isVirtual: false });
  }

  try {
    const isVirtual = await hasVirtualClassroom(teacherId);
    return NextResponse.json({ isVirtual });
  } catch {
    return NextResponse.json({ isVirtual: false });
  }
}
