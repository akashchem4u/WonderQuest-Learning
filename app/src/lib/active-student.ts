// Shared utility for persisting the active student selection in teacher view

const STORAGE_KEY = "wq_active_student_id";

export function getActiveStudentId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setActiveStudentId(studentId: string): void {
  if (typeof window === "undefined") return;
  if (studentId) localStorage.setItem(STORAGE_KEY, studentId);
  else localStorage.removeItem(STORAGE_KEY);
}
