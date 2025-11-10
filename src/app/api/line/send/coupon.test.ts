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

describe("POST /api/line/send - Coupon Messages", () => {
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
      type: "TEXT",
      content: {
        couponId: "COUPON001",
        text: "Coupon: COUPON001",
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    mockPushMessage.mockResolvedValue(undefined);
    mockRealtimeEmit.mockResolvedValue(undefined);
  });

  it("should send coupon message successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "coupon",
        couponId: "COUPON001",
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });

    // Verify LINE API was called
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef1234567890abcdef", {
      type: "text",
      text: "クーポンID: COUPON001",
    });

    // Verify user was upserted
    expect(mockPrismaUserUpsert).toHaveBeenCalledWith({
      where: { lineUserId: "U1234567890abcdef1234567890abcdef" },
      update: {},
      create: {
        lineUserId: "U1234567890abcdef1234567890abcdef",
        displayName: "",
        isFollowing: true,
      },
    });

    // Verify message was persisted
    expect(mockPrismaMessageCreate).toHaveBeenCalledWith({
      data: {
        type: "TEXT",
        content: {
          couponId: "COUPON001",
          text: "Coupon: COUPON001",
        },
        direction: "OUTBOUND",
        userId: "user-123",
        deliveryStatus: "SENT",
      },
    });

    // Verify realtime event was emitted
    expect(mockRealtimeEmit).toHaveBeenCalledWith("message:outbound", {
      userId: "user-123",
      text: "🎫 クーポン: COUPON001",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should validate required fields", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "coupon",
        // Missing couponId
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate couponId is not empty", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "coupon",
        couponId: "",
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should send coupon message with different coupon IDs", async () => {
    const couponIds = ["COUPON001", "COUPON002", "SPECIAL2025"];

    for (const couponId of couponIds) {
      vi.clearAllMocks();
      mockPrismaUserUpsert.mockResolvedValue({
        id: "user-123",
        lineUserId: "U1234567890abcdef1234567890abcdef",
        displayName: "Test User",
        isFollowing: true,
      });
      mockPrismaMessageCreate.mockResolvedValue({
        id: "msg-123",
        type: "TEXT",
        content: { couponId, text: `Coupon: ${couponId}` },
        direction: "OUTBOUND",
        userId: "user-123",
        deliveryStatus: "SENT",
        createdAt: new Date("2025-01-01T00:00:00Z"),
      });
      mockPushMessage.mockResolvedValue(undefined);
      mockRealtimeEmit.mockResolvedValue(undefined);

      const request = new Request("http://localhost/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "U1234567890abcdef1234567890abcdef",
          type: "coupon",
          couponId,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: "sent" });
      expect(mockPushMessage).toHaveBeenCalledWith(
        "U1234567890abcdef1234567890abcdef",
        {
          type: "text",
          text: `クーポンID: ${couponId}`,
        }
      );
    }
  });
});
