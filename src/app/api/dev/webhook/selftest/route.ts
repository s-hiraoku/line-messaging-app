import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/dev/webhook/selftest
 * body: { mode: 'local' | 'public', publicUrl?: string }
 * Sends a signed dummy payload to /api/line/webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json().catch(() => ({}))) as { mode?: string; publicUrl?: string };
    const mode = json.mode === 'public' ? 'public' : 'local';
    const publicUrl = typeof json.publicUrl === 'string' ? json.publicUrl : '';

    const cfg = await prisma.channelConfig.findUnique({ where: { id: 'primary' } });
    const secret = cfg?.channelSecret;
    if (!secret) return NextResponse.json({ error: 'チャネルシークレット未設定' }, { status: 400 });

    const body = JSON.stringify({ events: [] });
    const signature = createHmac('sha256', secret).update(body).digest('base64');

    let base: string;
    if (mode === 'public') {
      base = (publicUrl?.replace(/\/$/, '') || '');
    } else {
      const host = req.headers.get('host') || 'localhost:3000';
      const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
      const protocol = isLocalhost ? 'http' : 'https';
      base = `${protocol}://${host}`;
    }

    if (!base) return NextResponse.json({ error: 'publicUrl を指定してください' }, { status: 400 });

    // Accept both origin-only (https://xxx.trycloudflare.com) and full path (.../api/line/webhook)
    const url = base.endsWith('/api/line/webhook') ? base : `${base}/api/line/webhook`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
        body,
      });
      const text = await res.text().catch(() => '');
      return NextResponse.json({ url, status: res.status, body: text });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ url, error: msg }, { status: 502 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'selftest failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
