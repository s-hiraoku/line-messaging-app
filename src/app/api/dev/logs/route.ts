import { NextRequest, NextResponse } from "next/server";
import { getLogs, clearLogs } from "@/lib/dev/logger";

export async function GET() {
  try {
    return NextResponse.json({ items: getLogs() });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    clearLogs();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

