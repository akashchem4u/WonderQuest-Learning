import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  requireChildAccessSession,
} from "@/lib/child-access";
import { generateConceptExplanation } from "@/lib/concept-explainer";

export async function POST(request: NextRequest) {
  try {
    await requireChildAccessSession(request);

    const body = (await request.json()) as {
      skillCode?: string;
      subject?: string;
      bandCode?: string;
      questionText?: string;
      studentAnswer?: string;
      correctAnswer?: string;
      studentFirstName?: string;
    };

    const {
      skillCode = "unknown",
      subject = "general",
      bandCode = "G23",
      questionText,
      studentAnswer,
      correctAnswer,
      studentFirstName = "Student",
    } = body;

    if (!questionText || !studentAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required fields: questionText, studentAnswer, correctAnswer" },
        { status: 400 },
      );
    }

    const explanation = await generateConceptExplanation({
      skillCode,
      subject,
      bandCode,
      questionText,
      studentAnswer,
      correctAnswer,
      studentFirstName,
    });

    // Always return 200 — null explanation means the feature is unavailable
    // and the client should fall back to the standard retry flow gracefully.
    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof ChildAccessSessionError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[explain] Error:", error);
    return NextResponse.json({ explanation: null });
  }
}
