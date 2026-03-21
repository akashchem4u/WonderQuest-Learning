import { NextResponse } from "next/server";
import { createPlaySession } from "@/lib/prototype-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createPlaySession(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start the play session." },
      { status: 400 },
    );
  }
}
