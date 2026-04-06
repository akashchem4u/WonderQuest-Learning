import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";
import { getStudentAssignments } from "@/lib/prototype-service";

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const assignments = await getStudentAssignments(studentId);
    return NextResponse.json({ assignments });
  } catch {
    return NextResponse.json({ assignments: [] });
  }
}
