import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  requireChildAccessSession,
} from "@/lib/child-access";

const VALID_INTEREST_IDS = new Set([
  "dinos", "space", "animals", "games", "sports",
  "art", "food", "music", "stories", "science", "puzzles", "ocean",
]);

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    const result = await db.query(
      `select coalesce(interests, '{}') as interests
       from public.student_profiles
       where id = $1`,
      [studentId],
    );

    const interests: string[] = result.rows[0]?.interests ?? [];
    return NextResponse.json({ interests });
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load interests." },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const body = await request.json();
    const { db } = await import("@/lib/db");

    const raw: unknown = body?.interests;
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: "interests must be an array." }, { status: 400 });
    }

    // Sanitise: keep only known ids, max 5
    const sanitised = (raw as unknown[])
      .filter((v) => typeof v === "string" && VALID_INTEREST_IDS.has(v))
      .slice(0, 5) as string[];

    // Try to update the interests column; fall back silently if column doesn't exist yet
    try {
      await db.query(
        `update public.student_profiles
         set interests = $2, updated_at = now()
         where id = $1`,
        [studentId, sanitised],
      );
    } catch (dbErr: unknown) {
      // Column may not exist in older deployments — treat as a soft save failure
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      if (msg.includes("column") && msg.includes("interests")) {
        return NextResponse.json({ ok: true, saved: false, note: "interests column not yet migrated" });
      }
      throw dbErr;
    }

    return NextResponse.json({ ok: true, saved: true, interests: sanitised });
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save interests." },
      { status },
    );
  }
}
