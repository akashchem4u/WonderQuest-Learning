import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getChildSkillProgress } from "@/lib/parent-activity-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const skills = await getChildSkillProgress(guardianId, studentId);
    return NextResponse.json({ skills });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch skills" },
      { status },
    );
  }
}
