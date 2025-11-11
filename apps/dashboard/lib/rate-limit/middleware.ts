import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, RateLimitPreset } from "./rate-limiter";
import { errorResponse } from "@/app/api/_helpers/api-response";

/**
 * Extract identifier from request
 * Priority: User ID > IP Address > Forwarded IP > Default
 * 
 * @param req - Next.js request object
 * @param userId - Optional authenticated user ID
 * @returns Unique identifier for rate limiting
 */
export const getIdentifier = (req: NextRequest, userId?: string): string => {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "anonymous";

  return `ip:${ip}`;
};

/**
 * Rate limit middleware options
 */
export interface RateLimitMiddlewareOptions {
  preset: RateLimitPreset;
  getUserId?: (req: NextRequest) => Promise<string | undefined>;
  customPrefix?: string;
  skipOnError?: boolean; // Continue even if rate limiting fails
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
export function withRateLimit<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  options: RateLimitMiddlewareOptions
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const limiter = createRateLimiter(options.preset, options.customPrefix);

    // If rate limiting is disabled, proceed with request
    if (!limiter.isEnabled()) {
      return handler(req, ...args);
    }

    try {
      // Get user ID if authentication is required
      const userId = options.getUserId ? await options.getUserId(req) : undefined;
      
      // Get unique identifier
      const identifier = getIdentifier(req, userId);

      // Check rate limit
      const result = await limiter.check(identifier);

      // If rate limiting is disabled or check failed, proceed
      if (!result) {
        return handler(req, ...args);
      }

      // Add rate limit headers to response
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", result.limit.toString());
      headers.set("X-RateLimit-Remaining", result.remaining.toString());
      headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());

      // Check if rate limited
      if (!result.success) {
        const response = errorResponse(req, {
          message: "Too many requests. Please try again later.",
          statusCode: 429,
        });
        
        // Add rate limit headers
        headers.forEach((value, key) => {
          response.headers.set(key, value);
        });
        
        return response;
      }

      // Execute handler and attach rate limit headers
      const response = await handler(req, ...args);
      
      // Attach rate limit headers to successful response
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      
      // Fail open if skipOnError is true
      if (options.skipOnError !== false) {
        return handler(req, ...args);
      }

      return errorResponse(req, {
        message: "Rate limiting service unavailable",
        statusCode: 503,
      });
    }
  };
}

/**
 * Standalone rate limit check function
 * For use cases where middleware wrapper is not suitable
 * 
 * @param req - Next.js request object
 * @param preset - Rate limit preset
 * @param userId - Optional user ID
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  req: NextRequest,
  preset: RateLimitPreset,
  userId?: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const limiter = createRateLimiter(preset);

  if (!limiter.isEnabled()) {
    return { success: true };
  }

  const identifier = getIdentifier(req, userId);
  const result = await limiter.check(identifier);

  if (!result) {
    return { success: true };
  }

  if (!result.success) {
    const response = errorResponse(req, {
      message: "Too many requests. Please try again later.",
      statusCode: 429,
    });

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());

    return { success: false, response };
  }

  return { success: true };
}
