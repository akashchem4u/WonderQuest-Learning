import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  getRequestIpAddress,
  requireChildAccessSession,
} from "@/lib/child-access";
import { answerQuestion } from "@/lib/prototype-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";

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

    const body = await request.json();
    const accessSession = await requireChildAccessSession(request);
    const result = await answerQuestion({
      sessionId: body.sessionId,
      studentId: accessSession.studentId,
      questionKey: body.questionKey,
      answer: body.answer,
      attempt: body.attempt,
      timeSpentMs: body.timeSpentMs,
    });
    void track(accessSession.studentId, "question_answered", {
      correct: result.correct,
      hint_used: body.hintUsed ?? false,
    });
    if (result.sessionCompleted) {
      void track(accessSession.studentId, "session_completed", {
        points_earned: result.pointsEarned,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit the answer." },
      { status },
    );
  }
}
