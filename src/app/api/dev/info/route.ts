import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pkg from "../../../../package.json" assert { type: "json" };

export async function GET() {
  try {
    // DB check
    let dbOk = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbOk = false;
    }

    const cfg = await prisma.channelConfig.findUnique({ where: { id: "primary" } });

    const info = {
      app: {
        name: pkg.name,
        version: pkg.version,
        node: process.version,
        env: process.env.NODE_ENV ?? "development",
        now: new Date().toISOString(),
      },
      runtime: {
        databaseConnected: dbOk,
        redisConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
        sseEndpoint: "/api/events",
      },
      channel: {
        channelId: cfg?.channelId ?? "",
        channelSecretConfigured: Boolean(cfg?.channelSecret),
        webhookPath: "/api/line/webhook",
      },
    } as const;

    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json({ error: "failed to load dev info" }, { status: 500 });
  }
}

