import type { Redis } from "@upstash/redis";
import { Redis as UpstashRedis } from "@upstash/redis";

/**
 * Minimal Redis wrapper using Upstash REST. No-op when env is missing.
 */
export class RedisClient {
  private client: Redis | null;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    this.client = url && token ? new UpstashRedis({ url, token }) : null;
  }

  async publish(channel: string, data: unknown) {
    if (!this.client) return;
    try {
      await this.client.publish(channel, JSON.stringify(data));
    } catch {
      // swallow publish errors in POC
    }
  }
}

let cached: RedisClient | null = null;
export function getRedis(): RedisClient {
  if (!cached) cached = new RedisClient();
  return cached;
}
