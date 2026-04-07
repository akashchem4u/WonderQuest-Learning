import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";
import { verifyPin } from "@/lib/pin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      token?: string;
      childPin?: string;
      newPassword?: string;
    };

    const token = (body.token ?? "").trim().toUpperCase();
    const childPin = (body.childPin ?? "").trim();
    const newPassword = body.newPassword ?? "";

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    if (!childPin || !/^\d{4}$/.test(childPin)) {
      return NextResponse.json({ error: "Child's 4-digit passcode is required." }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Find valid token
    const tokenResult = await db.query(
      `
        select id, guardian_id
        from public.password_reset_tokens
        where token = $1
          and used_at is null
          and expires_at > now()
        limit 1
      `,
      [token],
    );

    if (!tokenResult.rowCount) {
      return NextResponse.json(
        { error: "Reset code is invalid or expired." },
        { status: 400 },
      );
    }

    const tokenRow = tokenResult.rows[0];
    const guardianId = tokenRow.guardian_id as string;

    // Get guardian's email for password hashing
    const guardianResult = await db.query(
      `select email from public.guardian_profiles where id = $1 limit 1`,
      [guardianId],
    );

    if (!guardianResult.rowCount) {
      return NextResponse.json({ error: "Guardian not found." }, { status: 404 });
    }

    const email = guardianResult.rows[0].email as string | null;
    if (!email) {
      return NextResponse.json({ error: "No email associated with this account." }, { status: 400 });
    }

    // Look up linked children and verify childPin matches any of them
    const childrenResult = await db.query(
      `
        select sp.username, sp.pin_hash
        from public.guardian_student_links gsl
        join public.student_profiles sp on sp.id = gsl.student_id
        where gsl.guardian_id = $1
      `,
      [guardianId],
    );

    if (!childrenResult.rowCount) {
      return NextResponse.json(
        { error: "No linked children found. Cannot verify identity." },
        { status: 400 },
      );
    }

    const pinMatches = childrenResult.rows.some((row) =>
      verifyPin(childPin, row.username as string, row.pin_hash as string),
    );

    if (!pinMatches) {
      return NextResponse.json(
        { error: "Child passcode does not match. Please try again." },
        { status: 401 },
      );
    }

    // Update guardian password
    const newHash = hashPassword(newPassword, email);
    await db.query(
      `update public.guardian_profiles set password_hash = $1 where id = $2`,
      [newHash, guardianId],
    );

    // Mark token used
    await db.query(
      `update public.password_reset_tokens set used_at = now() where id = $1`,
      [tokenRow.id],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Password reset failed." },
      { status: 500 },
    );
  }
}
