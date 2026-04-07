import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateResetToken } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { identifier?: string };
    const identifier = (body.identifier ?? "").trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Email or username is required." },
        { status: 400 },
      );
    }

    // Find guardian by email or username
    const result = await db.query(
      `
        select id, display_name
        from public.guardian_profiles
        where lower(email) = lower($1)
           or lower(username) = lower($1)
        limit 1
      `,
      [identifier],
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: "No account found with that email or username." },
        { status: 404 },
      );
    }

    const guardian = result.rows[0];
    const token = generateResetToken();

    await db.query(
      `
        insert into public.password_reset_tokens (guardian_id, token)
        values ($1, $2)
      `,
      [guardian.id, token],
    );

    return NextResponse.json({
      token,
      displayName: guardian.display_name as string,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 500 },
    );
  }
}
