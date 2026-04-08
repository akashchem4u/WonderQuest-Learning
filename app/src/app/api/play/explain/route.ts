import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  getRequestIpAddress,
  requireChildAccessSession,
} from "@/lib/child-access";
import { generateConceptExplanation } from "@/lib/concept-explainer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIpAddress(request) ?? "unknown";
    const sessionCookie = request.cookies.get("wonderquest-child-session")?.value ?? ip;

    // Per-session: 30 answers/min (generous for normal play, blocks runaway loops)
    const sessionLimit = checkRateLimit({ key: `play:session:${sessionCookie}`, limit: 30 });
    // Per-IP: 60 requests/min across all sessions from same IP
    const ipLimit = checkRateLimit({ key: `play:ip:${ip}`, limit: 60 });

    if (!sessionLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

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
