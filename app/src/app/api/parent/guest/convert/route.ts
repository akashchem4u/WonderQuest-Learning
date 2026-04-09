import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = (await request.json()) as {
      displayName?: string;
      email?: string;
      password?: string;
    };

    const displayName = (body.displayName ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    // Validate required fields
    if (!displayName) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Check email uniqueness
    const existing = await db.query(
      `SELECT id FROM public.guardian_profiles WHERE email = $1 LIMIT 1`,
      [email],
    );
    if (existing.rowCount) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    // Hash password using the existing scrypt-based password hasher
    const passwordHash = hashPassword(password, email);

    // Generate username from email prefix + 4 random chars
    const emailPrefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const username = `${emailPrefix}${randomSuffix}`;

    // Update guardian profile
    const updateResult = await db.query(
      `
        UPDATE public.guardian_profiles
        SET
          display_name = $2,
          email = $3,
          password_hash = $4,
          username = $5,
          is_guest = false,
          guest_expires_at = NULL,
          updated_at = now()
        WHERE id = $1 AND is_guest = true
        RETURNING id
      `,
      [guardianId, displayName, email, passwordHash, username],
    );

    if (!updateResult.rowCount) {
      return NextResponse.json({ error: "Account not found or already converted." }, { status: 404 });
    }

    // Update linked student profiles
    await db.query(
      `
        UPDATE public.student_profiles sp
        SET is_guest = false, updated_at = now()
        FROM public.guardian_student_links gsl
        WHERE gsl.guardian_id = $1
          AND gsl.student_id = sp.id
          AND sp.is_guest = true
      `,
      [guardianId],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Conversion failed." },
      { status },
    );
  }
}
