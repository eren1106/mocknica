import { Redis } from "@upstash/redis";

/**
 * Singleton Redis client configuration
 * Supports both Upstash Redis (remote) and local Redis via serverless-redis-http proxy
 * 
 * Local Development:
 *   REDIS_URL=http://localhost:8079
 *   REDIS_TOKEN=dev_token
 * 
 * Production (Upstash):
 *   REDIS_URL=https://your-db.upstash.io
 *   REDIS_TOKEN=your_token
 */
class RedisClient {
  private static instance: Redis | null = null;

  private constructor() {}

  /**
   * Get or create Redis client instance
   * @returns Redis client or null if not configured
   */
  static getInstance(): Redis | null {
    if (this.instance) {
      return this.instance;
    }

    const redisUrl = process.env.REDIS_URL;
    const redisToken = process.env.REDIS_TOKEN;

    if (!redisUrl) {
      console.warn("REDIS_URL not configured. Rate limiting will be disabled.");
      return null;
    }

    try {
      if (!redisToken) {
        console.warn("⚠️  REDIS_TOKEN not set. Rate limiting will be disabled.");
        return null;
      }

      this.instance = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      // Determine if using local proxy or Upstash
      const isLocal = redisUrl.startsWith("http://");
      console.info(
        isLocal
          ? "✅ Connected to local Redis (via serverless-redis-http proxy)"
          : "✅ Connected to Upstash Redis"
      );

      return this.instance;
    } catch (error) {
      console.error("❌ Failed to initialize Redis client:", error);
      return null;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Check if Redis is configured and available
   */
  static isConfigured(): boolean {
    return !!process.env.REDIS_URL;
  }
}

export const getRedisClient = () => RedisClient.getInstance();
export const isRedisConfigured = () => RedisClient.isConfigured();
