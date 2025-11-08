import { NextRequest } from "next/server";
import { realtime } from "@/lib/realtime/bus";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`),
        );
      };

      const bus = realtime();
      const onInbound = (payload: any) => write("message:inbound", payload);
      const onOutbound = (payload: any) => write("message:outbound", payload);
      const onDevLog = (payload: any) => write("dev:log", payload);
      bus.on("message:inbound", onInbound);
      bus.on("message:outbound", onOutbound);
      bus.on("dev:log", onDevLog);

      // heartbeat to keep connection alive
      const heartbeat = setInterval(() => write("ping", {}), 25000);

      // send initial connected event
      write("connected", { ok: true });

      return () => {
        clearInterval(heartbeat);
        bus.off("message:inbound", onInbound);
        bus.off("message:outbound", onOutbound);
        bus.off("dev:log", onDevLog);
      };
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
