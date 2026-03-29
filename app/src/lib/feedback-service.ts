// feedback-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
//
// Exports: createFeedback

import { db } from "@/lib/db";
import { triageFeedback } from "@/lib/feedback-triage";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackInput = {
  submittedByRole: string;
  guardianId?: string;
  studentId?: string;
  sourceChannel: string;
  reportedType?: string;
  message: string;
  context?: Record<string, unknown>;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeContext(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

// ─── Exported service functions ───────────────────────────────────────────────

export async function createFeedback(input: FeedbackInput) {
  const submittedByRole = ensureText(input.submittedByRole) || "parent";
  const sourceChannel = ensureText(input.sourceChannel) || "unknown";
  const message = ensureText(input.message);

  if (!message) {
    throw new Error("Feedback message is required.");
  }

  const context = {
    ...normalizeContext(input.context),
    reportedType: ensureText(input.reportedType) || "general",
  };

  const triage = triageFeedback({
    message,
    reportedType: ensureText(input.reportedType),
    sourceChannel,
  });

  const inserted = await db.query(
    `
      insert into public.feedback_items (
        submitted_by_role,
        guardian_id,
        student_id,
        source_channel,
        message,
        context
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      returning id
    `,
    [
      submittedByRole,
      input.guardianId || null,
      input.studentId || null,
      sourceChannel,
      message,
      JSON.stringify(context),
    ],
  );

  await db.query(
    `
      insert into public.feedback_triage (
        feedback_id,
        ai_category,
        confidence,
        urgency,
        impacted_area,
        duplicate_cluster_id,
        summary,
        routing_target,
        review_status
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    `,
    [
      inserted.rows[0].id,
      triage.category,
      triage.confidence,
      triage.urgency,
      triage.impactedArea,
      triage.duplicateClusterId,
      triage.summary,
      triage.routingTarget,
    ],
  );

  return {
    feedbackId: inserted.rows[0].id as string,
    triage: {
      category: triage.category,
      confidence: triage.confidence,
      urgency: triage.urgency,
      routingTarget: triage.routingTarget,
    },
  };
}
