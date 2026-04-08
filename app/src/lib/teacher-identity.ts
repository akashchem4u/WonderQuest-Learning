// teacher-identity.ts
// Teacher identity helpers.
// teacherId is now resolved server-side via a DB-backed session.
// Client components must call GET /api/teacher/me to obtain the teacher ID.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @deprecated Use GET /api/teacher/me (or the useTeacherId hook) instead.
 * The wonderquest-teacher-id cookie no longer exists.
 * Returns "" so existing call-sites degrade gracefully until migrated.
 */
export function getTeacherId(): string {
  return "";
}

/**
 * Fetches the authenticated teacher's ID from the server.
 * Returns "" if the session is missing or expired.
 * Use this in React components instead of the deprecated getTeacherId().
 */
export async function fetchTeacherId(): Promise<string> {
  try {
    const res = await fetch("/api/teacher/me");
    if (!res.ok) return "";
    const data = (await res.json()) as { teacherId?: string };
    return isValidTeacherId(data.teacherId) ? data.teacherId : "";
  } catch {
    return "";
  }
}

/**
 * Returns true if the value is a valid UUID string.
 */
export function isValidTeacherId(id: string | null | undefined): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}
