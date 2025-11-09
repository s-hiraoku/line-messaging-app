import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";
import * as lineClient from "@/lib/line/client";
import * as realtimeBus from "@/lib/realtime/bus";

// Mock dependencies
vi.mock("@/lib/line/client");
vi.mock("@/lib/realtime/bus");
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

describe("POST /api/line/send - Sticker Message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a sticker message successfully", async () => {
    const mockPushMessage = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(lineClient, "pushMessage").mockImplementation(mockPushMessage);

    const mockEmit = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(realtimeBus, "realtime").mockReturnValue({
      emit: mockEmit,
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
      type: "STICKER",
      content: { packageId: "11537", stickerId: "52002734" },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "sticker",
        packageId: "11537",
        stickerId: "52002734",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef", {
      type: "sticker",
      packageId: "11537",
      stickerId: "52002734",
    });
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        type: "STICKER",
        content: { packageId: "11537", stickerId: "52002734" },
        direction: "OUTBOUND",
        userId: "user-123",
        deliveryStatus: "SENT",
      },
    });
  });

  it("should return 400 when required fields are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "sticker",
        packageId: "11537",
        // stickerId is missing
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should support both text and sticker messages", async () => {
    const mockPushMessage = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(lineClient, "pushMessage").mockImplementation(mockPushMessage);

    const mockEmit = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(realtimeBus, "realtime").mockReturnValue({
      emit: mockEmit,
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
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date(),
    });

    // Test text message (original functionality)
    const textRequest = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        message: "Hello",
      }),
    });

    const textResponse = await POST(textRequest);
    expect(textResponse.status).toBe(200);
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef", {
      type: "text",
      text: "Hello",
    });
  });
});
