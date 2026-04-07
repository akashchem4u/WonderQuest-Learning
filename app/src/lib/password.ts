// password.ts
// Email/password auth utilities for parent (guardian) accounts.
//
// FUTURE — Google OAuth:
//   When Google OAuth is added, accessParent (in parent-service.ts) will be called
//   with mode 'oauth-google'. The guardian_profiles table already has the
//   google_id and oauth_provider columns ready (added in migration
//   20260409_000017_parent_email_auth.sql). Use the accessParentViaGoogle() stub
//   in parent-service.ts as the integration point.

import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

export function hashPassword(password: string, email: string): string {
  const salt = `wonderquest:parent:${email.toLowerCase().trim()}`;
  return scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, email: string, storedHash: string): boolean {
  try {
    const derived = Buffer.from(hashPassword(password, email), "hex");
    const stored = Buffer.from(storedHash, "hex");
    if (derived.length !== stored.length) return false;
    return timingSafeEqual(derived, stored);
  } catch { return false; }
}

export function generateResetToken(): string {
  return randomBytes(4).toString("hex").toUpperCase(); // 8-char hex token
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address";
  return null;
}
