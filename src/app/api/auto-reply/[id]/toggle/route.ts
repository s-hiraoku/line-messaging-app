import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/auto-reply/[id]/toggle
 * Toggle the isActive status of an auto-reply rule
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if auto-reply exists
    const existing = await prisma.autoReply.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Auto-reply not found' },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    const autoReply = await prisma.autoReply.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
    });

    return NextResponse.json({
      autoReply: {
        id: autoReply.id,
        isActive: autoReply.isActive,
        updatedAt: autoReply.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error toggling auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to toggle auto-reply' },
      { status: 500 }
    );
  }
}
