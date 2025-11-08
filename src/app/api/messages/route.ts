import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get('take') ?? '50'), 200);
    const cursor = searchParams.get('cursor') ?? undefined;

    const messages = await prisma.message.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, lineUserId: true, displayName: true } } },
    });

    const nextCursor = messages.length === take ? messages[messages.length - 1].id : null;
    return NextResponse.json({ items: messages, nextCursor });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
