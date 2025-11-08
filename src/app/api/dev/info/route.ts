import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

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

    // Read package.json
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkgContent = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

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

