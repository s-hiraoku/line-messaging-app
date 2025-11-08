import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "@line/bot-sdk";

vi.mock("@line/bot-sdk");

describe("LINE Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      LINE_CHANNEL_ACCESS_TOKEN: "test-access-token",
      LINE_CHANNEL_SECRET: "test-secret",
    };
  });

  describe("getLineClient", () => {
    it("should create a LINE client with credentials from env", async () => {
      const { getLineClient } = await import("./client");
      const client = getLineClient();

      expect(client).toBeDefined();
      expect(Client).toHaveBeenCalled();
    });
  });

});

// Note: pushMessage and broadcastMessage are thin wrappers around LINE Client methods.
// These are tested through integration tests in the API routes.
