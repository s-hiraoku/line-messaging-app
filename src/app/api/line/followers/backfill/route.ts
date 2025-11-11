import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getChannelAccessToken, getLineClient } from "@/lib/line/client";

const schema = z.object({
  limitPerPage: z.number().int().min(1).max(1000).default(1000),
  maxPages: z.number().int().min(1).max(50).default(1),
  start: z.string().optional(),
  syncProfile: z.boolean().default(false),
});

type FollowersResp = { userIds: string[]; next?: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { limitPerPage, maxPages, start, syncProfile } = schema.parse(body);

    let accessToken: string;
    try {
      accessToken = await getChannelAccessToken();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to issue channel access token';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const client = syncProfile ? await getLineClient() : null;

    let imported = 0;
    let pages = 0;
    let cursor = start;
    const stats: { created: number; updated: number } = { created: 0, updated: 0 };

    while (pages < maxPages) {
      const url = new URL("https://api.line.me/v2/bot/followers/ids");
      url.searchParams.set("limit", String(limitPerPage));
      if (cursor) url.searchParams.set("start", cursor);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return NextResponse.json({ error: "LINE API error", status: res.status, body: errText }, { status: res.status });
      }

      const data = (await res.json()) as FollowersResp;
      if (!Array.isArray(data.userIds) || data.userIds.length === 0) {
        cursor = undefined;
        break;
      }

      for (const lineUserId of data.userIds) {
        let displayName = "";
        let pictureUrl: string | null = null;
        if (client && syncProfile) {
          try {
            const p = await client.getProfile(lineUserId);
            displayName = p.displayName ?? "";
            pictureUrl = (p.pictureUrl as string | undefined) ?? null;
          } catch (error) {
            console.error(`[POST /api/line/followers/backfill] Failed to fetch profile for ${lineUserId}:`, {
              error,
              lineUserId,
            });
            // Continue with empty profile data
          }
        }

        const result = await prisma.user.upsert({
          where: { lineUserId },
          update: { isFollowing: true, ...(syncProfile ? { displayName, pictureUrl } : {}) },
          create: { lineUserId, displayName, pictureUrl, isFollowing: true },
        });
        imported += 1;
        if (result.createdAt.getTime() === result.updatedAt.getTime()) stats.created += 1;
        else stats.updated += 1;
      }

      pages += 1;
      cursor = data.next;
      if (!cursor) break;
    }

    return NextResponse.json({ imported, pages, next: cursor ?? null, stats });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    console.error('[POST /api/line/followers/backfill] Error:', {
      error,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
