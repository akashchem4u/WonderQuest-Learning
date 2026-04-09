import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireOwnerSession(request);
  if (!auth.ok) return auth.response;

  const feedbackId = params.id?.trim();
  if (!feedbackId) {
    return NextResponse.json({ error: "Feedback ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json() as {
      action: "resolve" | "reopen";
      reviewerNote?: string;
      urgency?: string;
    };

    const newStatus = body.action === "resolve" ? "resolved" : "pending";

    const result = await db.query(
      body.urgency
        ? `update public.feedback_triage
           set review_status = $2, reviewer_note = coalesce($3, reviewer_note), urgency = $4
           where feedback_id = $1
           returning feedback_id, review_status, reviewer_note`
        : `update public.feedback_triage
           set review_status = $2, reviewer_note = coalesce($3, reviewer_note)
           where feedback_id = $1
           returning feedback_id, review_status, reviewer_note`,
      body.urgency
        ? [feedbackId, newStatus, body.reviewerNote ?? null, body.urgency]
        : [feedbackId, newStatus, body.reviewerNote ?? null],
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "Feedback item not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: feedbackId,
      status: newStatus,
      reviewerNote: result.rows[0].reviewer_note as string | null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 500 },
    );
  }
}
