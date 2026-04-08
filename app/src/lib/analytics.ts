import { PostHog } from "posthog-node";

// PostHog is only active when POSTHOG_API_KEY is set.
// In development / when key is missing, all calls are no-ops.
const client = process.env.POSTHOG_API_KEY
  ? new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,       // flush immediately on each event (serverless)
      flushInterval: 0, // no background interval in serverless
    })
  : null;

type EventName =
  | "session_started"
  | "question_answered"
  | "hint_used"
  | "session_completed"
  | "session_abandoned"
  | "badge_earned"
  | "trophy_earned"
  | "placement_completed"
  | "parent_login"
  | "teacher_login"
  | "child_account_created";

type EventProps = Record<string, string | number | boolean | null>;

/**
 * Fire a server-side analytics event.
 * distinctId should be a non-PII identifier — use student/guardian/teacher DB id.
 * Never pass names, emails, usernames, or IP addresses as distinctId or properties.
 */
export async function track(
  distinctId: string,
  event: EventName,
  properties?: EventProps,
): Promise<void> {
  if (!client) return;
  try {
    client.capture({ distinctId, event, properties: properties ?? {} });
    // flushAt:1 means the event is dispatched immediately after capture.
    // No explicit flush needed; errors are silently swallowed.
  } catch {
    // Analytics must never crash the API route
  }
}

export async function identify(
  distinctId: string,
  properties: { band?: string; level?: number; role?: "child" | "parent" | "teacher" | "owner" },
): Promise<void> {
  if (!client) return;
  try {
    client.identify({ distinctId, properties });
  } catch {
    // no-op
  }
}
