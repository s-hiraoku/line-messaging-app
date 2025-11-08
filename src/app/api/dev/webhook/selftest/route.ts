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

    const base = mode === 'public'
      ? (publicUrl?.replace(/\/$/, '') || '')
      : 'http://localhost:3000';

    if (!base) return NextResponse.json({ error: 'publicUrl を指定してください' }, { status: 400 });

    const url = `${base}/api/line/webhook`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
      body,
    });
    const text = await res.text().catch(() => '');
    return NextResponse.json({ url, status: res.status, body: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'selftest failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

