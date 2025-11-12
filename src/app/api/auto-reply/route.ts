import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MatchType } from '@prisma/client';

/**
 * GET /api/auto-reply
 * Get all auto-reply rules
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get('isActive');

    const where =
      isActiveParam !== null
        ? { isActive: isActiveParam === 'true' }
        : undefined;

    const autoReplies = await prisma.autoReply.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ autoReplies });
  } catch (error) {
    console.error('Error fetching auto-replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-replies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auto-reply
 * Create a new auto-reply rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, keywords, replyText, priority, isActive, matchType } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.length === 0 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

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

    if (!replyText || typeof replyText !== 'string' || replyText.length === 0 || replyText.length > 5000) {
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

    if (matchType && !Object.values(MatchType).includes(matchType)) {
      return NextResponse.json(
        { error: 'Invalid match type' },
        { status: 400 }
      );
    }

    const autoReply = await prisma.autoReply.create({
      data: {
        name,
        keywords,
        replyText,
        priority: priority ?? 100,
        isActive: isActive ?? true,
        matchType: matchType ?? MatchType.CONTAINS,
      },
    });

    return NextResponse.json({ autoReply }, { status: 201 });
  } catch (error) {
    console.error('Error creating auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to create auto-reply' },
      { status: 500 }
    );
  }
}
