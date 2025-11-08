import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const take = Math.min(Number(searchParams.get('take') ?? '50'), 200);
    const cursorIso = searchParams.get('cursor');
    const cursorDate = cursorIso ? new Date(cursorIso) : undefined;

    const users = await prisma.user.findMany({
      take,
      where: {
        ...(q
          ? {
              OR: [
                { displayName: { contains: q } },
                { lineUserId: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        pictureUrl: true,
        isFollowing: true,
        createdAt: true,
        messages: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const items = users.map(u => ({
      id: u.id,
      lineUserId: u.lineUserId,
      displayName: u.displayName,
      pictureUrl: u.pictureUrl,
      isFollowing: u.isFollowing,
      createdAt: u.createdAt,
      lastMessageAt: u.messages[0]?.createdAt ?? null,
    }));

    const nextCursor = users.length === take ? users[users.length - 1].createdAt.toISOString() : null;
    return NextResponse.json({ items, nextCursor });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
