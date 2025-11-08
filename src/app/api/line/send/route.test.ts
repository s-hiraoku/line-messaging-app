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

describe("POST /api/line/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a message and return success", async () => {
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
      content: { text: "Hello!" },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        message: "Hello!",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef", {
      type: "text",
      text: "Hello!",
    });
  });

  it("should return 400 for invalid request body", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "",
        message: "Hello!",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when message is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 500 when LINE API fails", async () => {
    const mockPushMessage = vi.fn().mockRejectedValue(new Error("LINE API error"));
    vi.spyOn(lineClient, "pushMessage").mockImplementation(mockPushMessage);

    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        message: "Hello!",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to send message");
  });
});
