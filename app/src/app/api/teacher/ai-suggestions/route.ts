import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveSuggestions } from "@/lib/adaptive-teacher";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { teacherId } = auth;
    const suggestions = await generateAdaptiveSuggestions(teacherId);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[api/teacher/ai-suggestions]", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
