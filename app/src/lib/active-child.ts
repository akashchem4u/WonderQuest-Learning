// Shared utility for persisting the active child selection across parent pages

const STORAGE_KEY = "wq_active_child_id";

export function getActiveChildId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setActiveChildId(childId: string): void {
  if (typeof window === "undefined") return;
  if (childId) localStorage.setItem(STORAGE_KEY, childId);
  else localStorage.removeItem(STORAGE_KEY);
}

export function resolveActiveChild<T extends { id: string }>(
  children: T[],
  preferredId?: string,
): T | null {
  if (!children.length) return null;
  const id = preferredId || getActiveChildId();
  return children.find(c => c.id === id) ?? children[0];
}
