"use client";

import { useEffect } from "react";

type Handlers = Partial<{
  "message:inbound": (data: any) => void;
  "message:outbound": (data: any) => void;
  ping: (data: any) => void;
  connected: (data: any) => void;
}>;

export function useRealtimeEvents(handlers: Handlers) {
  useEffect(() => {
    const es = new EventSource("/api/events");

    const bind = <K extends keyof Handlers>(event: K) => {
      const handler = handlers[event];
      if (!handler) return;
      es.addEventListener(event as string, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          // @ts-expect-error generic handler map
          handler(data);
        } catch {
          // ignore parse errors
        }
      });
    };

    bind("message:inbound");
    bind("message:outbound");
    bind("ping");
    bind("connected");

    return () => {
      es.close();
    };
  }, []);
}

