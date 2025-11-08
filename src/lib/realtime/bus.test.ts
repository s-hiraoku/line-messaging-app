import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";

import { realtime } from "./bus";

// Mock dependencies
vi.mock("@/lib/redis/client", () => ({
  getRedis: vi.fn(() => ({
    publish: vi.fn(),
  })),
}));

describe("RealtimeBus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit events locally", async () => {
    const bus = realtime();
    const listener = vi.fn();

    bus.on("message:inbound", listener);

    const payload = {
      userId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString(),
    };

    await bus.emit("message:inbound", payload);

    expect(listener).toHaveBeenCalledWith(payload);
  });

  it("should publish events to Redis", async () => {
    const { getRedis } = await import("@/lib/redis/client");
    const mockPublish = vi.fn();

    vi.mocked(getRedis).mockReturnValue({
      publish: mockPublish,
    } as any);

    const bus = realtime();

    const payload = {
      userId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString(),
    };

    await bus.emit("message:outbound", payload);

    expect(mockPublish).toHaveBeenCalledWith("message:outbound", payload);
  });

  it("should support multiple listeners", async () => {
    const bus = realtime();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    bus.on("message:inbound", listener1);
    bus.on("message:inbound", listener2);

    const payload = {
      userId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString(),
    };

    await bus.emit("message:inbound", payload);

    expect(listener1).toHaveBeenCalledWith(payload);
    expect(listener2).toHaveBeenCalledWith(payload);
  });

  it("should remove event listeners", async () => {
    const bus = realtime();
    const listener = vi.fn();

    bus.on("message:inbound", listener);
    bus.off("message:inbound", listener);

    const payload = {
      userId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString(),
    };

    await bus.emit("message:inbound", payload);

    expect(listener).not.toHaveBeenCalled();
  });

  it("should handle different event types", async () => {
    const bus = realtime();
    const inboundListener = vi.fn();
    const outboundListener = vi.fn();

    bus.on("message:inbound", inboundListener);
    bus.on("message:outbound", outboundListener);

    const inboundPayload = {
      userId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString(),
    };

    const outboundPayload = {
      userId: "user-456",
      text: "Hi there",
      createdAt: new Date().toISOString(),
    };

    await bus.emit("message:inbound", inboundPayload);
    await bus.emit("message:outbound", outboundPayload);

    expect(inboundListener).toHaveBeenCalledWith(inboundPayload);
    expect(inboundListener).not.toHaveBeenCalledWith(outboundPayload);
    expect(outboundListener).toHaveBeenCalledWith(outboundPayload);
    expect(outboundListener).not.toHaveBeenCalledWith(inboundPayload);
  });

  it("should return singleton instance", () => {
    const bus1 = realtime();
    const bus2 = realtime();

    expect(bus1).toBe(bus2);
  });
});
