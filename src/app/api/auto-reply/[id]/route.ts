import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MatchType } from '@prisma/client';

/**
 * GET /api/auto-reply/[id]
 * Get a specific auto-reply rule
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const autoReply = await prisma.autoReply.findUnique({
      where: { id },
    });

    if (!autoReply) {
      return NextResponse.json(
        { error: 'Auto-reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ autoReply });
  } catch (error) {
    console.error('Error fetching auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-reply' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auto-reply/[id]
 * Update an auto-reply rule
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, keywords, replyText, priority, isActive, matchType } = body;

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

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.length === 0 || name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    if (keywords !== undefined) {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json(
          { error: 'At least one keyword is required' },
          { status: 400 }
        );
      }

      for (const keyword of keywords) {
        if (typeof keyword !== 'string' || keyword.length === 0 || keyword.length > 100) {
          return NextResponse.json(
            { error: 'Each keyword must be between 1 and 100 characters' },
            { status: 400 }
          );
        }
      }
    }

    if (replyText !== undefined && (typeof replyText !== 'string' || replyText.length === 0 || replyText.length > 5000)) {
      return NextResponse.json(
        { error: 'Reply text must be between 1 and 5000 characters' },
        { status: 400 }
      );
    }

    if (priority !== undefined && (typeof priority !== 'number' || priority < 0 || priority > 9999)) {
      return NextResponse.json(
        { error: 'Priority must be between 0 and 9999' },
        { status: 400 }
      );
    }

    if (matchType !== undefined && !Object.values(MatchType).includes(matchType)) {
      return NextResponse.json(
        { error: 'Invalid match type' },
        { status: 400 }
      );
    }

    const autoReply = await prisma.autoReply.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(keywords !== undefined && { keywords }),
        ...(replyText !== undefined && { replyText }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
        ...(matchType !== undefined && { matchType }),
      },
    });

    return NextResponse.json({ autoReply });
  } catch (error) {
    console.error('Error updating auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-reply' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auto-reply/[id]
 * Delete an auto-reply rule
 */
export async function DELETE(
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

    await prisma.autoReply.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Auto-reply rule deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete auto-reply' },
      { status: 500 }
    );
  }
}
