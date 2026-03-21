import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/prototype-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createFeedback(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Feedback save failed." },
      { status: 400 },
    );
  }
}
