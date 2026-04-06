// teacher-identity.ts
// Client-side helper to read the per-teacher profile UUID from a cookie.
// The cookie is set by /api/teacher/access after successful login.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns the teacher's UUID from the wonderquest-teacher-id cookie,
 * or "" if no valid UUID is stored (not yet logged in).
 * API routes use isValidTeacherId() to guard DB queries.
 */
export function getTeacherId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/wonderquest-teacher-id=([^;]+)/);
  const value = match?.[1] ?? "";
  return UUID_RE.test(value) ? value : "";
}

/**
 * Returns true if the value is a valid UUID string.
 */
export function isValidTeacherId(id: string | null | undefined): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}
