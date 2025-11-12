import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auto-reply/default
 * Get the default auto-reply configuration
 */
export async function GET() {
  try {
    const defaultReply = await prisma.defaultAutoReply.findUnique({
      where: { id: 'default' },
    });

    if (!defaultReply) {
      // Create default entry if it doesn't exist
      const created = await prisma.defaultAutoReply.create({
        data: {
          id: 'default',
          replyText: null,
          isActive: false,
        },
      });
      return NextResponse.json({ defaultReply: created });
    }

    return NextResponse.json({ defaultReply });
  } catch (error) {
    console.error('Error fetching default reply:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default reply' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auto-reply/default
 * Update the default auto-reply configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { replyText, isActive } = body;

    // Validation
    if (replyText !== undefined && replyText !== null) {
      if (typeof replyText !== 'string' || replyText.length === 0 || replyText.length > 5000) {
        return NextResponse.json(
          { error: 'Reply text must be between 1 and 5000 characters' },
          { status: 400 }
        );
      }
    }

    const defaultReply = await prisma.defaultAutoReply.upsert({
      where: { id: 'default' },
      update: {
        ...(replyText !== undefined && { replyText }),
        ...(isActive !== undefined && { isActive }),
      },
      create: {
        id: 'default',
        replyText: replyText ?? null,
        isActive: isActive ?? false,
      },
    });

    return NextResponse.json({ defaultReply });
  } catch (error) {
    console.error('Error updating default reply:', error);
    return NextResponse.json(
      { error: 'Failed to update default reply' },
      { status: 500 }
    );
  }
}
