import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ tags: z.array(z.string().min(1)).default([]) });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();
    const { tags } = schema.parse(json);

    // ensure tags exist
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    );

    // reset user tags to provided set
    await prisma.userTag.deleteMany({ where: { userId: id } });
    await prisma.userTag.createMany({
      data: tagRecords.map((t) => ({ userId: id, tagId: t.id })),
      skipDuplicates: true,
    });

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({
      id: updated?.id,
      tags: updated?.tags.map((t) => t.tag.name) ?? [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
