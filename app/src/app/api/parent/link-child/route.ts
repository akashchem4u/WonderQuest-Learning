import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { db } from "@/lib/db";

/**
 * POST /api/parent/link-child
 * Links an existing child account to the authenticated parent by child username.
 * Used by the onboarding flow (Step 2) when a parent enters a child's quest name.
 */
export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json() as { childUsername?: string };
    const childUsername = (body.childUsername ?? "").trim().toLowerCase();

    if (!childUsername || childUsername.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid child username." },
        { status: 400 },
      );
    }

    // Look up student by username
    const studentRes = await db.query(
      `SELECT id, display_name FROM public.student_profiles
       WHERE LOWER(username) = $1 LIMIT 1`,
      [childUsername],
    );

    if (!studentRes.rowCount) {
      return NextResponse.json(
        { error: "No child account found with that username. Check spelling and try again." },
        { status: 404 },
      );
    }

    const student = studentRes.rows[0] as { id: string; display_name: string };

    // Check if already linked
    const existingLink = await db.query(
      `SELECT 1 FROM public.guardian_student_links
       WHERE guardian_id = $1 AND student_id = $2 LIMIT 1`,
      [guardianId, student.id],
    );

    if (existingLink.rowCount) {
      return NextResponse.json(
        { message: `${student.display_name} is already connected to your account.`, alreadyLinked: true },
      );
    }

    // Create the link
    await db.query(
      `INSERT INTO public.guardian_student_links (guardian_id, student_id)
       VALUES ($1, $2)
       ON CONFLICT (guardian_id, student_id) DO NOTHING`,
      [guardianId, student.id],
    );

    return NextResponse.json({
      message: `${student.display_name} has been connected to your account!`,
      studentId: student.id,
      displayName: student.display_name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not link child account." },
      { status: 500 },
    );
  }
}
