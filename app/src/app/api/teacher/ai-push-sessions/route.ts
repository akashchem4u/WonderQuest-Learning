import { NextRequest, NextResponse } from "next/server";
import { isValidTeacherId } from "@/lib/teacher-identity";
import { generateAdaptiveSuggestions, pushAdaptiveSessions } from "@/lib/adaptive-teacher";

export async function POST(request: NextRequest) {
  const teacherId = request.cookies.get("wonderquest-teacher-id")?.value ?? "";
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const suggestions = await generateAdaptiveSuggestions(teacherId);
    const pushed = await pushAdaptiveSessions(teacherId, suggestions);
    return NextResponse.json({ pushed, suggestions });
  } catch (error) {
    console.error("[api/teacher/ai-push-sessions]", error);
    return NextResponse.json({ error: "Failed to push sessions" }, { status: 500 });
  }
}
