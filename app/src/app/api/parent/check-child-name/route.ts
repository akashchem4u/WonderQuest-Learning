import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("username") ?? "";
    const username = raw.trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ available: false, message: "Username is required." });
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({
        available: false,
        message: "Quest name must be 2–20 characters.",
      });
    }

    if (!/^[a-z0-9]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        message: "Only letters and numbers are allowed.",
      });
    }

    const result = await db.query(
      `select 1 from public.student_profiles where username = $1 limit 1`,
      [username],
    );

    if (result.rowCount) {
      return NextResponse.json({
        available: false,
        message: "That name is already taken — try a different one!",
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check failed." },
      { status: 500 },
    );
  }
}
