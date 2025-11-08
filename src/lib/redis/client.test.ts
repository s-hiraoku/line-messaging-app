import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Redis } from "@upstash/redis";

import { RedisClient, getRedis } from "./client";

vi.mock("@upstash/redis");

describe("RedisClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe("constructor", () => {
    it("should create Redis client when env vars are present", () => {
      process.env = {
        ...originalEnv,
        UPSTASH_REDIS_REST_URL: "https://test.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "test-token",
      };

      const client = new RedisClient();

      expect(Redis).toHaveBeenCalledWith({
        url: "https://test.upstash.io",
        token: "test-token",
      });
    });

    it("should not create Redis client when env vars are missing", () => {
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const client = new RedisClient();

      expect(Redis).not.toHaveBeenCalled();
    });
  });

  describe("publish", () => {
    it("should do nothing when Redis client is null", async () => {
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL;

      const { RedisClient } = await import("./client");
      const client = new RedisClient();
      await expect(client.publish("test-channel", { message: "hello" })).resolves.toBeUndefined();
    });
  });

  describe("getRedis", () => {
    it("should return an instance", async () => {
      process.env = {
        ...originalEnv,
        UPSTASH_REDIS_REST_URL: "https://test.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "test-token",
      };

      const { getRedis } = await import("./client");
      const client = getRedis();

      expect(client).toBeDefined();
    });
  });
});
