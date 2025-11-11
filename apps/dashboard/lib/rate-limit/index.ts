/**
 * Rate Limiting Module
 * 
 * Enterprise-grade rate limiting using Upstash Redis
 * Supports both remote Upstash and local Redis instances
 * 
 * @module rate-limit
 * 
 * @example Basic Usage with Middleware
 * ```typescript
 * import { withRateLimit } from "@/lib/rate-limit";
 * 
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Your handler logic
 *   },
 *   { preset: "AUTH" }
 * );
 * ```
 * 
 * @example With Authentication
 * ```typescript
 * import { withRateLimit } from "@/lib/rate-limit";
 * import { auth } from "@/lib/auth";
 * 
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Your handler logic
 *   },
 *   { 
 *     preset: "CREATE",
 *     getUserId: async (req) => {
 *       const session = await auth.api.getSession({ headers: req.headers });
 *       return session?.user.id;
 *     }
 *   }
 * );
 * ```
 * 
 * @example Manual Check
 * ```typescript
 * import { checkRateLimit } from "@/lib/rate-limit";
 * 
 * const { success, response } = await checkRateLimit(req, "AI", userId);
 * if (!success) return response;
 * ```
 */

// Core functionality
export { withRateLimit, checkRateLimit, getIdentifier } from "./middleware";
export type { RateLimitMiddlewareOptions } from "./middleware";

// Rate limiter
export {
  createRateLimiter,
  RateLimitChecker,
  RATE_LIMIT_PRESETS,
} from "./rate-limiter";
export type { RateLimitPreset, RateLimiterConfig, RateLimitResponse } from "./rate-limiter";

// Redis client
export { getRedisClient, isRedisConfigured } from "./redis-client";
