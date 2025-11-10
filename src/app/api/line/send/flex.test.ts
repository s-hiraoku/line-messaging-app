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

describe("POST /api/line/send - Flex Messages", () => {
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
      type: "FLEX",
      content: {
        altText: "Flex Message",
        contents: { type: "bubble" },
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    mockPushMessage.mockResolvedValue(undefined);
    mockRealtimeEmit.mockResolvedValue(undefined);
  });

  it("should send flex message successfully", async () => {
    const flexContents = {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Hello, World!",
          },
        ],
      },
    };

    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Flex Message",
        contents: flexContents,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });

    // Verify LINE API was called
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef1234567890abcdef", {
      type: "flex",
      altText: "Flex Message",
      contents: flexContents,
    });

    // Verify realtime event was emitted
    expect(mockRealtimeEmit).toHaveBeenCalledWith("message:outbound", {
      userId: "user-123",
      text: "📊 Flex Message",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should send complex flex message", async () => {
    const flexContents = {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://example.com/image.jpg",
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Product Name",
            weight: "bold",
            size: "xl",
          },
          {
            type: "box",
            layout: "baseline",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "¥3,000",
                size: "xl",
                color: "#ff0000",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "Buy Now",
              uri: "https://example.com/buy",
            },
          },
        ],
      },
    };

    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Product Details",
        contents: flexContents,
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
        type: "flex",
        altText: "a".repeat(401), // Exceeds max length of 400
        contents: { type: "bubble" },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate required fields", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        // Missing altText and contents
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should handle carousel flex message", async () => {
    const flexContents = {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "Item 1",
              },
            ],
          },
        },
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "Item 2",
              },
            ],
          },
        },
      ],
    };

    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Carousel Message",
        contents: flexContents,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });

  it("should reject invalid contents type (string)", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Test Message",
        contents: "invalid string",
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should reject invalid contents type (missing type field)", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Test Message",
        contents: { body: { type: "box" } }, // Missing required 'type' field
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should reject invalid contents type (invalid enum value)", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "flex",
        altText: "Test Message",
        contents: { type: "invalid_type" }, // Invalid type value
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });
});
