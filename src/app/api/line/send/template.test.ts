import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies - must be defined before importing the route
vi.mock("@/lib/line/client", () => ({
  pushMessage: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

const mockRealtimeEmit = vi.fn();

vi.mock("@/lib/realtime/bus", () => ({
  realtime: () => ({
    emit: mockRealtimeEmit,
  }),
}));

import { POST } from "./route";
import { pushMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";

const mockPushMessage = pushMessage as ReturnType<typeof vi.fn>;
const mockPrismaUserUpsert = prisma.user.upsert as ReturnType<typeof vi.fn>;
const mockPrismaMessageCreate = prisma.message.create as ReturnType<typeof vi.fn>;

describe("POST /api/line/send - Template Messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrismaUserUpsert.mockResolvedValue({
      id: "user-123",
      lineUserId: "U1234567890abcdef1234567890abcdef",
      displayName: "Test User",
      isFollowing: true,
    });

    mockPrismaMessageCreate.mockResolvedValue({
      id: "msg-123",
      type: "TEMPLATE",
      content: {
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "以下からお選びください",
          actions: [
            {
              type: "uri",
              label: "ウェブサイト",
              uri: "https://example.com",
            },
          ],
        },
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    mockPushMessage.mockResolvedValue(undefined);
    mockRealtimeEmit.mockResolvedValue(undefined);
  });

  it("should send template message with URI action successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "以下からお選びください",
          actions: [
            {
              type: "uri",
              label: "ウェブサイト",
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });

    // Verify LINE API was called
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef1234567890abcdef", {
      type: "template",
      altText: "メニュー",
      template: {
        type: "buttons",
        text: "以下からお選びください",
        actions: [
          {
            type: "uri",
            label: "ウェブサイト",
            uri: "https://example.com",
          },
        ],
      },
    });

    // Verify realtime event was emitted
    expect(mockRealtimeEmit).toHaveBeenCalledWith("message:outbound", {
      userId: "user-123",
      text: "📋 メニュー",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should send template message with message action successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "選択してください",
        template: {
          type: "buttons",
          text: "オプションを選択",
          actions: [
            {
              type: "message",
              label: "オプション1",
              text: "オプション1を選択しました",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalled();
  });

  it("should send template message with postback action successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "アクションを選択",
        template: {
          type: "buttons",
          text: "アクションを選択してください",
          actions: [
            {
              type: "postback",
              label: "購入する",
              data: "action=buy&item_id=123",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalled();
  });

  it("should send template message with multiple actions", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "メニューを選択してください",
          actions: [
            {
              type: "uri",
              label: "ウェブサイト",
              uri: "https://example.com",
            },
            {
              type: "message",
              label: "問い合わせ",
              text: "問い合わせフォームを開く",
            },
            {
              type: "postback",
              label: "購入",
              data: "action=buy",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });

  it("should send template message with title and thumbnail", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          title: "商品メニュー",
          text: "以下からお選びください",
          thumbnailImageUrl: "https://example.com/image.jpg",
          actions: [
            {
              type: "uri",
              label: "詳細を見る",
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });

  it("should validate altText length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "a".repeat(401), // Exceeds max length of 400
        template: {
          type: "buttons",
          text: "選択してください",
          actions: [
            {
              type: "uri",
              label: "ボタン",
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate template text length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "a".repeat(161), // Exceeds max length of 160
          actions: [
            {
              type: "uri",
              label: "ボタン",
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate actions array length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "選択してください",
          actions: [
            {
              type: "uri",
              label: "ボタン1",
              uri: "https://example.com/1",
            },
            {
              type: "uri",
              label: "ボタン2",
              uri: "https://example.com/2",
            },
            {
              type: "uri",
              label: "ボタン3",
              uri: "https://example.com/3",
            },
            {
              type: "uri",
              label: "ボタン4",
              uri: "https://example.com/4",
            },
            {
              type: "uri",
              label: "ボタン5",
              uri: "https://example.com/5",
            },
          ], // Exceeds max of 4
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate action label length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          text: "選択してください",
          actions: [
            {
              type: "uri",
              label: "a".repeat(21), // Exceeds max length of 20
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate title length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "template",
        altText: "メニュー",
        template: {
          type: "buttons",
          title: "a".repeat(41), // Exceeds max length of 40
          text: "選択してください",
          actions: [
            {
              type: "uri",
              label: "ボタン",
              uri: "https://example.com",
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });
});
