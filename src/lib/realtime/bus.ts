import { EventEmitter } from "events";
import { getRedis } from "@/lib/redis/client";

type Events = {
  "message:inbound": { userId: string; text?: string; createdAt: string };
  "message:outbound": { userId: string; text?: string; createdAt: string };
  "dev:log": { time: string; level: string; message: string; data?: any };
};

class RealtimeBus {
  private emitter = new EventEmitter();

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    this.emitter.on(event, listener as any);
  }

  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    this.emitter.off(event, listener as any);
  }

  async emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.emitter.emit(event, payload);
    // fan-out to Redis pub/sub channel when available
    const redis = getRedis();
    await redis.publish(event, payload);
  }
}

let instance: RealtimeBus | null = null;
export function realtime() {
  if (!instance) instance = new RealtimeBus();
  return instance;
}
