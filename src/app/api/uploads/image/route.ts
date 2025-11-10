import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v : undefined;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const CLOUDINARY_CLOUD_NAME = env('CLOUDINARY_CLOUD_NAME');
    const CLOUDINARY_API_KEY = env('CLOUDINARY_API_KEY');
    const CLOUDINARY_API_SECRET = env('CLOUDINARY_API_SECRET');
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary 未設定（CLOUDINARY_*）' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file を送ってください（multipart/form-data）' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `timestamp=${timestamp}`; // 最小構成
    const signature = crypto.createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex');

    const fd = new FormData();
    fd.set('file', file);
    fd.set('api_key', CLOUDINARY_API_KEY);
    fd.set('timestamp', String(timestamp));
    fd.set('signature', signature);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const res = await fetch(url, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: 'Cloudinary upload failed', status: res.status, body: data }, { status: 502 });
    }

    return NextResponse.json({
      secure_url: (data as any).secure_url,
      public_id: (data as any).public_id,
      width: (data as any).width,
      height: (data as any).height,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

