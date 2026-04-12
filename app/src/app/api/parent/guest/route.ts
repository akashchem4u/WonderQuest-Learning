import { NextRequest, NextResponse } from "next/server";
import {
  PARENT_SESSION_COOKIE_NAME,
  createParentAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/parent-access";
import { hashPin } from "@/lib/pin";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const AVATARS = [
  "bunny_purple",
  "cat_orange",
  "dog_blue",
  "fox_green",
  "owl_yellow",
  "panda_pink",
  "tiger_red",
  "unicorn_teal",
];

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  // Rate-limit: max 5 guest accounts per IP per hour
  const rateCheck = checkRateLimit({
    key: `guest-create:${ipAddress ?? "unknown"}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many guest accounts created. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  try {
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const guardianUsername = `guest_${suffix}`;
    const studentUsername = `explorer_${suffix}`;

    // Generate simple 4-digit PINs for both accounts
    const parentPin = String(Math.floor(1000 + Math.random() * 9000));
    const childPin = String(Math.floor(1000 + Math.random() * 9000));

    const parentPinHash = hashPin(parentPin, guardianUsername);
    const childPinHash = hashPin(childPin, studentUsername);

    // Insert guardian
    const guardianResult = await db.query(
      `
        INSERT INTO public.guardian_profiles (username, display_name, pin_hash, is_guest, guest_expires_at)
        VALUES ($1, $2, $3, true, now() + interval '24 hours')
        RETURNING id
      `,
      [guardianUsername, "Guest", parentPinHash],
    );

    const guardianId = guardianResult.rows[0].id as string;

    // Pick random avatar
    const avatarKey = AVATARS[Math.floor(Math.random() * AVATARS.length)];

    // Insert student
    const studentResult = await db.query(
      `
        INSERT INTO public.student_profiles (username, display_name, pin_hash, avatar_key, launch_band_code, is_guest)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id
      `,
      [studentUsername, "Explorer", childPinHash, avatarKey, "K1"],
    );

    const studentId = studentResult.rows[0].id as string;

    // Link guardian → student
    await db.query(
      `
        INSERT INTO public.guardian_student_links (guardian_id, student_id)
        VALUES ($1, $2)
      `,
      [guardianId, studentId],
    );

    // Insert default progression state
    await db.query(
      `
        INSERT INTO public.progression_states (student_id)
        VALUES ($1)
        ON CONFLICT DO NOTHING
      `,
      [studentId],
    );

    // Create session
    const accessSession = await createParentAccessSession({
      guardianId,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      ok: true,
      credentials: {
        parentUsername: guardianUsername,
        parentPin,
        childUsername: studentUsername,
        childPin,
      },
    }, { status: 201 });
    response.cookies.set({
      name: PARENT_SESSION_COOKIE_NAME,
      value: accessSession.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: accessSession.expiresAt,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create guest account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
