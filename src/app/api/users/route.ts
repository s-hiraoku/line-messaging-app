import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const take = Math.min(Number(searchParams.get('take') ?? '50'), 200);

    const users = await prisma.user.findMany({
      take,
      where: q
        ? {
            OR: [
              { displayName: { contains: q } },
              { lineUserId: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        pictureUrl: true,
        isFollowing: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ items: users });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
