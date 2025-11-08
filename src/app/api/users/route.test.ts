import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of users", async () => {
    const mockUsers = [
      {
        id: "user-1",
        lineUserId: "U1234567890abcdef",
        displayName: "Test User 1",
        pictureUrl: "https://example.com/pic1.jpg",
        isFollowing: true,
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "user-2",
        lineUserId: "U9876543210fedcba",
        displayName: "Test User 2",
        pictureUrl: null,
        isFollowing: false,
        createdAt: new Date("2024-01-02"),
      },
    ];

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const request = new NextRequest("http://localhost:3000/api/users");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.items[0].displayName).toBe("Test User 1");
    expect(data.items[1].displayName).toBe("Test User 2");
  });

  it("should search users by query", async () => {
    const mockUsers = [
      {
        id: "user-1",
        lineUserId: "U1234567890abcdef",
        displayName: "John Doe",
        pictureUrl: null,
        isFollowing: true,
        createdAt: new Date("2024-01-01"),
      },
    ];

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const request = new NextRequest("http://localhost:3000/api/users?q=John");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { displayName: { contains: "John" } },
            { lineUserId: { contains: "John" } },
            { email: { contains: "John" } },
          ],
        },
      })
    );
  });

  it("should limit results by take parameter", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/users?take=10");

    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      })
    );
  });

  it("should enforce maximum take limit of 200", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/users?take=1000");

    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 200,
      })
    );
  });

  it("should return 400 on error", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findMany).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/users");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });
});
