import { NextRequest, NextResponse } from "next/server";
import { isValidTeacherId } from "@/lib/teacher-identity";
import { generateAdaptiveSuggestions } from "@/lib/adaptive-teacher";

export async function GET(request: NextRequest) {
  const teacherId = request.cookies.get("wonderquest-teacher-id")?.value ?? "";
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const suggestions = await generateAdaptiveSuggestions(teacherId);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[api/teacher/ai-suggestions]", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
