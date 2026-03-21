import { scryptSync, timingSafeEqual } from "node:crypto";

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validatePin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export function hashPin(pin: string, username: string) {
  const salt = `wonderquest:${normalizeUsername(username)}`;
  return scryptSync(pin, salt, 32).toString("hex");
}

export function verifyPin(pin: string, username: string, storedHash: string) {
  const derived = Buffer.from(hashPin(pin, username), "hex");
  const stored = Buffer.from(storedHash, "hex");

  if (derived.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(derived, stored);
}
