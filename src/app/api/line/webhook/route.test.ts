import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { WebhookEvent } from "@line/bot-sdk";

import { POST } from "./route";

// Mock dependencies
vi.mock("@line/bot-sdk", async () => {
  const actual = await vi.importActual("@line/bot-sdk");
  return {
    ...actual,
    validateSignature: vi.fn(),
  };
});

vi.mock("@/lib/line/client", () => ({
  getLineClient: vi.fn(() => ({
    getProfile: vi.fn(),
    replyMessage: vi.fn(),
  })),
}));

vi.mock("@/lib/realtime/bus", () => ({
  realtime: vi.fn(() => ({
    emit: vi.fn(),
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

describe("POST /api/line/webhook", () => {
  const validSignature = "valid-signature";
  const channelSecret = "test-channel-secret";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LINE_CHANNEL_SECRET = channelSecret;
  });

  it("should process follow event and create user", async () => {
    const { validateSignature } = await import("@line/bot-sdk");
    vi.mocked(validateSignature).mockReturnValue(true);

    const { getLineClient } = await import("@/lib/line/client");
    const mockGetProfile = vi.fn().mockResolvedValue({
      userId: "U1234567890abcdef",
      displayName: "Test User",
      pictureUrl: "https://example.com/pic.jpg",
      statusMessage: "Hello",
    });

    vi.mocked(getLineClient).mockReturnValue({
      getProfile: mockGetProfile,
    } as any);

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.upsert).mockResolvedValue({
      id: "user-123",
      lineUserId: "U1234567890abcdef",
      displayName: "Test User",
      pictureUrl: "https://example.com/pic.jpg",
      isFollowing: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: null,
      email: null,
      emailVerified: null,
      image: null,
    });

    const events: WebhookEvent[] = [
      {
        type: "follow",
        replyToken: "reply-token",
        source: {
          type: "user",
          userId: "U1234567890abcdef",
        },
        timestamp: Date.now(),
        mode: "active",
      },
    ];

    const request = new NextRequest("http://localhost:3000/api/line/webhook", {
      method: "POST",
      headers: {
        "x-line-signature": validSignature,
      },
      body: JSON.stringify({ events }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
    expect(mockGetProfile).toHaveBeenCalledWith("U1234567890abcdef");
  });

  it("should process unfollow event and update user", async () => {
    const { validateSignature } = await import("@line/bot-sdk");
    vi.mocked(validateSignature).mockReturnValue(true);

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 });

    const events: WebhookEvent[] = [
      {
        type: "unfollow",
        source: {
          type: "user",
          userId: "U1234567890abcdef",
        },
        timestamp: Date.now(),
        mode: "active",
      },
    ];

    const request = new NextRequest("http://localhost:3000/api/line/webhook", {
      method: "POST",
      headers: {
        "x-line-signature": validSignature,
      },
      body: JSON.stringify({ events }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { lineUserId: "U1234567890abcdef" },
      data: { isFollowing: false },
    });
  });

  it("should process text message event", async () => {
    const { validateSignature } = await import("@line/bot-sdk");
    vi.mocked(validateSignature).mockReturnValue(true);

    const { getLineClient } = await import("@/lib/line/client");
    const mockReplyMessage = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getLineClient).mockReturnValue({
      replyMessage: mockReplyMessage,
    } as any);

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.upsert).mockResolvedValue({
      id: "user-123",
      lineUserId: "U1234567890abcdef",
      displayName: "Test User",
      pictureUrl: null,
      isFollowing: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: null,
      email: null,
      emailVerified: null,
      image: null,
    });

    vi.mocked(prisma.message.create).mockResolvedValue({
      id: "msg-123",
      type: "TEXT",
      content: { text: "Hello" },
      direction: "INBOUND",
      userId: "user-123",
      deliveryStatus: "RECEIVED",
      createdAt: new Date(),
    });

    const events: WebhookEvent[] = [
      {
        type: "message",
        replyToken: "reply-token",
        source: {
          type: "user",
          userId: "U1234567890abcdef",
        },
        timestamp: Date.now(),
        mode: "active",
        message: {
          type: "text",
          id: "msg-id",
          text: "Hello",
          quoteToken: "quote-token",
        },
      },
    ];

    const request = new NextRequest("http://localhost:3000/api/line/webhook", {
      method: "POST",
      headers: {
        "x-line-signature": validSignature,
      },
      body: JSON.stringify({ events }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
    expect(mockReplyMessage).toHaveBeenCalledWith("reply-token", {
      type: "text",
      text: "メッセージありがとうございます！",
    });
  });

  it("should return 400 for invalid signature", async () => {
    const { validateSignature } = await import("@line/bot-sdk");
    vi.mocked(validateSignature).mockReturnValue(false);

    const events: WebhookEvent[] = [];

    const request = new NextRequest("http://localhost:3000/api/line/webhook", {
      method: "POST",
      headers: {
        "x-line-signature": "invalid-signature",
      },
      body: JSON.stringify({ events }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  it("should return 400 when signature header is missing", async () => {
    const events: WebhookEvent[] = [];

    const request = new NextRequest("http://localhost:3000/api/line/webhook", {
      method: "POST",
      body: JSON.stringify({ events }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });
});
