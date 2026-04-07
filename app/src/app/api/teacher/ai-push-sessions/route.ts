import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveSuggestions, pushAdaptiveSessions } from "@/lib/adaptive-teacher";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function POST(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { teacherId } = auth;
    const suggestions = await generateAdaptiveSuggestions(teacherId);
    const pushed = await pushAdaptiveSessions(teacherId, suggestions);
    return NextResponse.json({ pushed, suggestions });
  } catch (error) {
    console.error("[api/teacher/ai-push-sessions]", error);
    return NextResponse.json({ error: "Failed to push sessions" }, { status: 500 });
  }
}
