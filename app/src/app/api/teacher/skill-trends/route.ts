import { NextRequest, NextResponse } from "next/server";
import { getTeacherSkillTrends } from "@/lib/analytics-service";
import { requireTeacherSession } from "@/lib/teacher-session";

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(max, Math.floor(parsed));
}

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );

  if (!auth.ok) {
    return auth.response;
  }

  const { teacherId } = auth;

  const days = parsePositiveInt(request.nextUrl.searchParams.get("days"), 30, 90);
  const payload = await getTeacherSkillTrends(teacherId, { days });

  return NextResponse.json(payload);
}
