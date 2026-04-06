// teacher-identity.ts
// Client-side helper to read the per-teacher profile UUID from a cookie.
// The cookie is set by /api/teacher/access after successful login.

/**
 * Returns the teacher's UUID from the wonderquest-teacher-id cookie.
 * Falls back to "demo-teacher" on the server or if the cookie is absent.
 */
export function getTeacherId(): string {
  if (typeof document === "undefined") return "demo-teacher";
  const match = document.cookie.match(/wonderquest-teacher-id=([^;]+)/);
  return match?.[1] ?? "demo-teacher";
}
