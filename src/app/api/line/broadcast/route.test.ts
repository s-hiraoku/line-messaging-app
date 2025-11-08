import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";
import * as lineClient from "@/lib/line/client";

// Mock dependencies
vi.mock("@/lib/line/client");
vi.mock("@/lib/prisma", () => ({
  prisma: {
    broadcast: {
      create: vi.fn(),
    },
  },
}));

describe("POST /api/line/broadcast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should broadcast a message and return success", async () => {
    const mockBroadcastMessage = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(lineClient, "broadcastMessage").mockImplementation(mockBroadcastMessage);

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.broadcast.create).mockResolvedValue({
      id: "broadcast-123",
      name: "test-broadcast",
      content: { type: "text", text: "Broadcast message" },
      scheduledAt: null,
      status: "SENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/broadcast", {
      method: "POST",
      body: JSON.stringify({
        name: "test-broadcast",
        message: "Broadcast message",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockBroadcastMessage).toHaveBeenCalledWith({
      type: "text",
      text: "Broadcast message",
    });
  });

  it("should use default name when not provided", async () => {
    const mockBroadcastMessage = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(lineClient, "broadcastMessage").mockImplementation(mockBroadcastMessage);

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.broadcast.create).mockResolvedValue({
      id: "broadcast-123",
      name: "broadcast",
      content: { type: "text", text: "Test" },
      scheduledAt: null,
      status: "SENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/broadcast", {
      method: "POST",
      body: JSON.stringify({
        message: "Test",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });

  it("should return 400 for invalid request body", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/broadcast", {
      method: "POST",
      body: JSON.stringify({
        message: "",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 500 when broadcast fails", async () => {
    const mockBroadcastMessage = vi.fn().mockRejectedValue(new Error("LINE API error"));
    vi.spyOn(lineClient, "broadcastMessage").mockImplementation(mockBroadcastMessage);

    const request = new NextRequest("http://localhost:3000/api/line/broadcast", {
      method: "POST",
      body: JSON.stringify({
        name: "test",
        message: "Test message",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to broadcast");
  });
});
