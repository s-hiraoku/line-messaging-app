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

describe("POST /api/line/send - Location Messages", () => {
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
      type: "LOCATION",
      content: {
        title: "東京タワー",
        address: "東京都港区芝公園4-2-8",
        latitude: 35.658581,
        longitude: 139.745433,
      },
      direction: "OUTBOUND",
      userId: "user-123",
      deliveryStatus: "SENT",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    mockPushMessage.mockResolvedValue(undefined);
    mockRealtimeEmit.mockResolvedValue(undefined);
  });

  it("should send location message successfully", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "location",
        title: "東京タワー",
        address: "東京都港区芝公園4-2-8",
        latitude: 35.658581,
        longitude: 139.745433,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });

    // Verify LINE API was called
    expect(mockPushMessage).toHaveBeenCalledWith("U1234567890abcdef1234567890abcdef", {
      type: "location",
      title: "東京タワー",
      address: "東京都港区芝公園4-2-8",
      latitude: 35.658581,
      longitude: 139.745433,
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
        type: "LOCATION",
        content: {
          title: "東京タワー",
          address: "東京都港区芝公園4-2-8",
          latitude: 35.658581,
          longitude: 139.745433,
        },
        direction: "OUTBOUND",
        userId: "user-123",
        deliveryStatus: "SENT",
      },
    });

    // Verify realtime event was emitted
    expect(mockRealtimeEmit).toHaveBeenCalledWith("message:outbound", {
      userId: "user-123",
      text: "📍 東京タワー",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should validate latitude range", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "location",
        title: "Test Location",
        address: "Test Address",
        latitude: 91, // Invalid: exceeds max
        longitude: 139.745433,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate longitude range", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "location",
        title: "Test Location",
        address: "Test Address",
        latitude: 35.658581,
        longitude: -181, // Invalid: exceeds min
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
        type: "location",
        title: "Test Location",
        // Missing address, latitude, longitude
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
        type: "location",
        title: "a".repeat(101), // Exceeds max length of 100
        address: "Test Address",
        latitude: 35.658581,
        longitude: 139.745433,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should validate address length", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "location",
        title: "Test Location",
        address: "a".repeat(101), // Exceeds max length of 100
        latitude: 35.658581,
        longitude: 139.745433,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
    expect(mockPushMessage).not.toHaveBeenCalled();
  });

  it("should handle valid boundary coordinates", async () => {
    const request = new Request("http://localhost/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "U1234567890abcdef1234567890abcdef",
        type: "location",
        title: "North Pole",
        address: "90° N",
        latitude: 90, // Valid max latitude
        longitude: 180, // Valid max longitude
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "sent" });
    expect(mockPushMessage).toHaveBeenCalled();
  });
});
