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

describe("POST /api/line/send - Imagemap Messages", () => {
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
      type: "IMAGE",
      content: {
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    mockPushMessage.mockResolvedValue(undefined);
    mockRealtimeEmit.mockResolvedValue(undefined);
  });

  it("should send imagemap message with URI action successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });

    // Verify LINE API was called
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef1234567890abcdef", {
      type: "imagemap",
      baseUrl: "https://example.com/images/imagemap",
      altText: "画像マップ",
      baseSize: { width: 1040, height: 1040 },
      actions: [
        {
          type: "uri",
          linkUri: "https://example.com",
          area: { x: 0, y: 0, width: 520, height: 520 },
        },
      ],
    });

    // Verify realtime event was emitted
    expect(mockRealtimeEmit).toHaveBeenCalledWith("message:outbound", {
      userId: "user-123",
      text: "🗺️ 画像マップ",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should send imagemap message with message action successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "message",
            text: "エリアがタップされました",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalled();
  });

  it("should send imagemap message with multiple actions", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com/1",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
          {
            type: "uri",
            linkUri: "https://example.com/2",
            area: { x: 520, y: 0, width: 520, height: 520 },
          },
          {
            type: "message",
            text: "下部がタップされました",
            area: { x: 0, y: 520, width: 1040, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });

  it("should validate base URL", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "invalid-url", // Invalid URL
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate altText length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "a".repeat(401), // Exceeds max length of 400
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate baseSize dimensions", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 3000, height: 1040 }, // Exceeds max of 2500
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate actions array is not empty", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [], // Empty array
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate action area coordinates", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "https://example.com",
            area: { x: -10, y: 0, width: 520, height: 520 }, // Negative x coordinate
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate URI action linkUri", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "imagemap",
        baseUrl: "https://example.com/images/imagemap",
        altText: "画像マップ",
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            type: "uri",
            linkUri: "invalid-url", // Invalid URL
            area: { x: 0, y: 0, width: 520, height: 520 },
          },
        ],
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });
});
