import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of messages with user info", async () => {
    const mockMessages = [
      {
        id: "msg-1",
        type: "TEXT",
        content: { text: "Hello!" },
        direction: "INBOUND",
        userId: "user-1",
        deliveryStatus: "RECEIVED",
        createdAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          lineUserId: "U1234567890abcdef",
          displayName: "Test User",
        },
      },
      {
        id: "msg-2",
        type: "TEXT",
        content: { text: "Hi there!" },
        direction: "OUTBOUND",
        userId: "user-2",
        deliveryStatus: "SENT",
        createdAt: new Date("2024-01-02"),
        user: {
          id: "user-2",
          lineUserId: "U9876543210fedcba",
          displayName: "Another User",
        },
      },
    ];

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);

    const request = new NextRequest("http://localhost:3000/api/messages");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.items[0]).toHaveProperty("user");
    expect(data.nextCursor).toBeNull();
  });

  it("should paginate with cursor", async () => {
    const mockMessages = Array.from({ length: 50 }, (_, i) => ({
      id: `msg-${i}`,
      type: "TEXT",
      content: { text: `Message ${i}` },
      direction: "INBOUND",
      userId: "user-1",
      deliveryStatus: "RECEIVED",
      createdAt: new Date(),
      user: {
        id: "user-1",
        lineUserId: "U1234567890abcdef",
        displayName: "Test User",
      },
    }));

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);

    const request = new NextRequest("http://localhost:3000/api/messages?take=50");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(50);
    expect(data.nextCursor).toBe("msg-49");
  });

  it("should use cursor for pagination", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/messages?cursor=msg-10");

    await GET(request);

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        cursor: { id: "msg-10" },
      })
    );
  });

  it("should limit results by take parameter", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/messages?take=20");

    await GET(request);

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
      })
    );
  });

  it("should enforce maximum take limit of 200", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/messages?take=500");

    await GET(request);

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 200,
      })
    );
  });

  it("should return 400 on error", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.message.findMany).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/messages");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });
});
