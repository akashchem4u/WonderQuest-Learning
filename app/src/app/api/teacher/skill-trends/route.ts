import { NextRequest, NextResponse } from "next/server";
import { getTeacherSkillTrends } from "@/lib/analytics-service";
import { hasTeacherAccess } from "@/lib/teacher-access";

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(max, Math.floor(parsed));
}

export async function GET(request: NextRequest) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  const teacherId = request.nextUrl.searchParams.get("teacherId")?.trim() ?? "";
  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required." },
      { status: 400 },
    );
  }

  const days = parsePositiveInt(request.nextUrl.searchParams.get("days"), 30, 90);
  const payload = await getTeacherSkillTrends(teacherId, { days });

  return NextResponse.json(payload);
}
