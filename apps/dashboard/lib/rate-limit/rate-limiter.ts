import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient, isRedisConfigured } from "./redis-client";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/app/api/_helpers/api-response";

// Different rate limit rules for different operations
export const RATE_LIMITS = {
  // Auth: Very restrictive to prevent brute force attacks
  AUTH: { requests: 10, window: "5 m" }, // 10 attempts per 5 min
  // Write operations: Moderate limits aligned with GitHub's 80 content-creating requests/min
  CREATE: { requests: 60, window: "1 m" }, // 60 per min (1 per second avg, allows small bursts)
  // Bulk operations: More restrictive due to resource intensity
  BULK: { requests: 10, window: "1 m" }, // 10 per min (reasonable for batch processing)
  // AI operations: Cost-based limiting (very restrictive)
  AI: { requests: 15, window: "5 m" }, // 15 per 5 min
  // Read operations: Generous limits like GitHub's 5000/hour for general reads
  // READ: { requests: 100, window: "1 m" }, // 100 per min (allows active usage)
  // General API: Balanced approach
  // GENERAL: { requests: 60, window: "1 m" }, // 60 per min (3600/hour, balanced)
};

export type RateLimitType = keyof typeof RATE_LIMITS;

// Cache rate limiters so we don't create duplicates
const rateLimiters = new Map<string, Ratelimit>();

/**
 * Get a rate limiter (creates one if it doesn't exist)
 */
function getRateLimiter(type: RateLimitType): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  // Check if we already have this limiter
  if (rateLimiters.has(type)) {
    return rateLimiters.get(type)!;
  }

  // Create new limiter
  const config = RATE_LIMITS[type];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
    prefix: `ratelimit:${type.toLowerCase()}`,
    analytics: true,
  });

  rateLimiters.set(type, limiter);
  return limiter;
}

/**
 * Get a unique identifier from the request
 * Uses user ID if available, otherwise IP address
 */
export function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "anonymous";

  return `ip:${ip}`;
}

/**
 * Check if a request should be rate limited
 * Returns success: true if request is allowed
 * Returns success: false with response if rate limited
 */
export async function checkRateLimit(
  req: NextRequest,
  type: RateLimitType,
  userId?: string
): Promise<{ success: boolean; response?: NextResponse }> {
  // Skip if Redis isn't configured
  if (!isRedisConfigured()) {
    return { success: true };
  }

  const limiter = getRateLimiter(type);
  if (!limiter) {
    return { success: true };
  }

  try {
    // Check the rate limit
    const identifier = getIdentifier(req, userId);
    const result = await limiter.limit(identifier);

    // If not limited, allow the request
    if (result.success) {
      return { success: true };
    }

    // Create rate limit error response
    const response = errorResponse(req, {
      message: "Too many requests. Please try again later.",
      statusCode: 429,
    });

    // Add helpful headers
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(result.reset).toISOString()
    );

    return { success: false, response };
  } catch (error) {
    console.error(`Rate limit check failed:`, error);
    // If rate limiting fails, allow the request
    return { success: true };
  }
}

/**
 * Rate limit middleware wrapper for API routes
 * Follows the Decorator pattern
 *
 * @param handler - Next.js API route handler
 * @param options - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Your handler logic
 *   },
 *   { preset: "AUTH" }
 * );
 * ```
 */
// export function withRateLimit<T extends any[]>(
//   handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
//   options: RateLimitMiddlewareOptions
// ) {
//   return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
//     const limiter = createRateLimiter(options.preset, options.customPrefix);

//     // If rate limiting is disabled, proceed with request
//     if (!limiter.isEnabled()) {
//       return handler(req, ...args);
//     }

//     try {
//       // Get user ID if authentication is required
//       const userId = options.getUserId ? await options.getUserId(req) : undefined;

//       // Get unique identifier
//       const identifier = getIdentifier(req, userId);

//       // Check rate limit
//       const result = await limiter.check(identifier);

//       // If rate limiting is disabled or check failed, proceed
//       if (!result) {
//         return handler(req, ...args);
//       }

//       // Add rate limit headers to response
//       const headers = new Headers();
//       headers.set("X-RateLimit-Limit", result.limit.toString());
//       headers.set("X-RateLimit-Remaining", result.remaining.toString());
//       headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());

//       // Check if rate limited
//       if (!result.success) {
//         const response = errorResponse(req, {
//           message: "Too many requests. Please try again later.",
//           statusCode: 429,
//         });

//         // Add rate limit headers
//         headers.forEach((value, key) => {
//           response.headers.set(key, value);
//         });

//         return response;
//       }

//       // Execute handler and attach rate limit headers
//       const response = await handler(req, ...args);

//       // Attach rate limit headers to successful response
//       headers.forEach((value, key) => {
//         response.headers.set(key, value);
//       });

//       return response;
//     } catch (error) {
//       console.error("Rate limit middleware error:", error);

//       // Fail open if skipOnError is true
//       if (options.skipOnError !== false) {
//         return handler(req, ...args);
//       }

//       return errorResponse(req, {
//         message: "Rate limiting service unavailable",
//         statusCode: 503,
//       });
//     }
//   };
// }
