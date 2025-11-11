import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient, isRedisConfigured } from "./redis-client";

/**
 * Rate limit response type
 */
export type RateLimitResponse = Awaited<ReturnType<Ratelimit["limit"]>>;

/**
 * Rate limit configuration presets
 * Following industry standards for different types of operations
 */
export const RATE_LIMIT_PRESETS = {
  // Auth operations: more restrictive
  AUTH: {
    requests: 5,
    window: "15 m",
    description: "5 requests per 15 minutes for auth operations",
  }, 
  // Write operations: moderate restrictions
  CREATE: {
    requests: 20,
    window: "1 m",
    description: "20 requests per minute for create operations",
  },
  // Bulk operations: moderate restrictions
  BULK: {
    requests: 5,
    window: "1 m",
    description: "5 requests per minute for bulk operations",
  },
  // AI operations: very restrictive due to cost
  AI: {
    requests: 20,
    window: "1 h",
    description: "20 requests per hour for AI operations",
  },
  // Read operations: lenient
  READ: {
    requests: 100,
    window: "1 m",
    description: "100 requests per minute for read operations",
  },
  // General API: balanced
  GENERAL: {
    requests: 50,
    window: "1 m",
    description: "50 requests per minute for general operations",
  },
} as const;

/**
 * Type for rate limit preset keys
 */
export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

/**
 * Rate limiter configuration options
 */
export interface RateLimiterConfig {
  requests: number;
  window: string;
  prefix?: string;
}

/**
 * Rate limiter factory
 * Creates rate limiters with sliding window algorithm
 * 
 * @implements Single Responsibility Principle - Only creates rate limiters
 * @implements Open/Closed Principle - Extensible through configuration
 */
class RateLimiterFactory {
  private static instances = new Map<string, Ratelimit>();

  /**
   * Get or create a rate limiter instance
   * 
   * @param config - Rate limiter configuration
   * @returns Ratelimit instance or null if Redis not configured
   */
  static getInstance(config: RateLimiterConfig): Ratelimit | null {
    const redis = getRedisClient();
    
    if (!redis) {
      return null;
    }

    const key = `${config.prefix || "default"}:${config.requests}:${config.window}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
      prefix: config.prefix,
      analytics: true,
    });

    this.instances.set(key, limiter);
    return limiter;
  }

  /**
   * Create a rate limiter from preset
   * 
   * @param preset - Preset name
   * @param customPrefix - Optional custom prefix
   * @returns Ratelimit instance or null
   */
  static fromPreset(
    preset: RateLimitPreset,
    customPrefix?: string
  ): Ratelimit | null {
    const config = RATE_LIMIT_PRESETS[preset];
    return this.getInstance({
      ...config,
      prefix: customPrefix || `ratelimit:${preset.toLowerCase()}`,
    });
  }

  /**
   * Reset all instances (useful for testing)
   */
  static resetInstances(): void {
    this.instances.clear();
  }
}

/**
 * Rate limit checker with graceful degradation
 * 
 * @implements Dependency Inversion Principle - Depends on abstractions
 */
export class RateLimitChecker {
  private limiter: Ratelimit | null;
  private preset: RateLimitPreset;

  constructor(preset: RateLimitPreset, customPrefix?: string) {
    this.preset = preset;
    this.limiter = RateLimiterFactory.fromPreset(preset, customPrefix);
  }

  /**
   * Check if identifier is rate limited
   * Returns null if rate limiting is disabled (Redis not configured)
   * 
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns Rate limit response or null if disabled
   */
  async check(identifier: string): Promise<RateLimitResponse | null> {
    if (!this.limiter) {
      // Graceful degradation: allow request if Redis is not configured
      return null;
    }

    try {
      const result = await this.limiter.limit(identifier);
      return result;
    } catch (error) {
      console.error(`Rate limit check failed for ${this.preset}:`, error);
      // Fail open: allow request if rate limiting fails
      return null;
    }
  }

  /**
   * Check if Redis is configured
   */
  isEnabled(): boolean {
    return isRedisConfigured();
  }
}

/**
 * Create a rate limit checker
 * 
 * @param preset - Rate limit preset
 * @param customPrefix - Optional custom prefix
 * @returns RateLimitChecker instance
 */
export const createRateLimiter = (
  preset: RateLimitPreset,
  customPrefix?: string
): RateLimitChecker => {
  return new RateLimitChecker(preset, customPrefix);
};
