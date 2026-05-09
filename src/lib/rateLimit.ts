/**
 * Simple in-memory rate limiter for Next.js Server Actions.
 *
 * Each entry tracks the number of requests within a rolling time window.
 * For distributed / serverless deployments consider replacing this with
 * an Upstash Redis-backed solution.
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up stale entries every 5 minutes to prevent unbounded memory growth.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now - entry.windowStart > CLEANUP_INTERVAL_MS) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)

/**
 * Check whether the given key has exceeded the allowed request rate.
 *
 * @param key       Unique identifier (e.g. `"login:192.0.2.1"` or `"earnTokens:<userId>"`)
 * @param limit     Maximum number of requests allowed within the window
 * @param windowMs  Length of the sliding window in milliseconds (default: 60 s)
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfterMs: number }`
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a fresh window
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count < limit) {
    entry.count += 1
    return { allowed: true }
  }

  const retryAfterMs = windowMs - (now - entry.windowStart)
  return { allowed: false, retryAfterMs }
}
