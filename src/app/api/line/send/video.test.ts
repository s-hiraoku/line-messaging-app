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

describe("POST /api/line/send - Video Message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a video message successfully", async () => {
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
      type: "VIDEO",
      content: {
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "https://example.com/preview.jpg",
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "https://example.com/preview.jpg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef", [
      {
        type: "video",
        originalContentUrl: "https://example.com/video.mp4",
        previewImageUrl: "https://example.com/preview.jpg",
      },
    ]);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        type: "VIDEO",
        content: {
          videoUrl: "https://example.com/video.mp4",
          previewUrl: "https://example.com/preview.jpg",
        },
        direction: "OUTBOUND",
        userId: "user-123",
        deliveryStatus: "SENT",
      },
    });
  });

  it("should return 400 when videoUrl is not a valid URL", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "not-a-url",
        previewUrl: "https://example.com/preview.jpg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when previewUrl is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.mp4",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when videoUrl does not use HTTPS", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "http://example.com/video.mp4",
        previewUrl: "https://example.com/preview.jpg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(data.issues.fieldErrors.videoUrl).toBeDefined();
  });

  it("should return 400 when videoUrl does not end with .mp4", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.avi",
        previewUrl: "https://example.com/preview.jpg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(data.issues.fieldErrors.videoUrl).toBeDefined();
  });

  it("should return 400 when previewUrl does not use HTTPS", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "http://example.com/preview.jpg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(data.issues.fieldErrors.previewUrl).toBeDefined();
  });

  it("should return 400 when previewUrl does not end with .jpg or .jpeg", async () => {
    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "https://example.com/preview.png",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(data.issues.fieldErrors.previewUrl).toBeDefined();
  });

  it("should accept .jpeg extension for previewUrl", async () => {
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
      type: "VIDEO",
      content: {
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "https://example.com/preview.jpeg",
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/line/send", {
      method: "POST",
      body: JSON.stringify({
        to: "U1234567890abcdef",
        type: "video",
        videoUrl: "https://example.com/video.mp4",
        previewUrl: "https://example.com/preview.jpeg",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
  });
});
