import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getChildRecentSessions } from "@/lib/parent-activity-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId");
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, Number(limitParam))) : 20;

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const sessions = await getChildRecentSessions(guardianId, studentId, limit);
    return NextResponse.json({ sessions });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activity" },
      { status },
    );
  }
}
