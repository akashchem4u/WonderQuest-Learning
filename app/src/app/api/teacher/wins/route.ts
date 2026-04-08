import { NextRequest, NextResponse } from "next/server";
import { getTeacherWins } from "@/lib/analytics-service";
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

  const days = parsePositiveInt(request.nextUrl.searchParams.get("days"), 7, 30);
  const limit = parsePositiveInt(request.nextUrl.searchParams.get("limit"), 20, 100);

  const wins = await getTeacherWins(teacherId, { days, limit });

  return NextResponse.json({
    teacherId,
    rangeDays: days,
    wins,
  });
}
