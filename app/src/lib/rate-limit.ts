// In-memory store for rate limiting (resets on server restart, but good enough for edge cases)
// For production: use Redis. For now: in-memory Map with TTL.

const store = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000; // 1 minute window
const CLEANUP_INTERVAL = 5 * 60_000; // clean up every 5 min

// Auto-cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now - value.windowStart > WINDOW_MS * 2) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  key: string;      // e.g. sessionId or ip
  limit: number;    // max requests per window
  windowMs?: number; // window size (default 60s)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { key, limit, windowMs = WINDOW_MS } = config;
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const allowed = existing.count <= limit;
  return { allowed, remaining, resetAt: existing.windowStart + windowMs };
}
