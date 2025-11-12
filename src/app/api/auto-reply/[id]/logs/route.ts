import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auto-reply/[id]/logs
 * Get logs for a specific auto-reply rule with statistics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Check if auto-reply exists
    const autoReply = await prisma.autoReply.findUnique({
      where: { id },
    });

    if (!autoReply) {
      return NextResponse.json(
        { error: 'Auto-reply not found' },
        { status: 404 }
      );
    }

    const where: any = { autoReplyId: id };

    if (startDateParam || endDateParam) {
      where.createdAt = {};
      if (startDateParam) where.createdAt.gte = new Date(startDateParam);
      if (endDateParam) where.createdAt.lte = new Date(endDateParam);
    }

    const skip = (page - 1) * limit;

    // Get statistics
    const [totalUsage, successCount, lastUsed, keywordBreakdown] = await Promise.all([
      prisma.autoReplyLog.count({ where }),
      prisma.autoReplyLog.count({ where: { ...where, replySent: true } }),
      prisma.autoReplyLog.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.autoReplyLog.groupBy({
        by: ['matchedKeyword'],
        where,
        _count: { id: true },
      }),
    ]);

    const successRate = totalUsage > 0 ? (successCount / totalUsage) * 100 : 0;

    const keywordStats = keywordBreakdown
      .filter((item) => item.matchedKeyword !== null)
      .map((item) => ({
        keyword: item.matchedKeyword,
        count: item._count.id,
        percentage: totalUsage > 0 ? (item._count.id / totalUsage) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Get logs
    const [logs, totalItems] = await Promise.all([
      prisma.autoReplyLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      totalUsage,
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      autoReply: {
        id: autoReply.id,
        name: autoReply.name,
        keywords: autoReply.keywords,
        replyText: autoReply.replyText,
      },
      statistics: {
        totalUsage,
        successRate: Number(successRate.toFixed(1)),
        lastUsed: lastUsed?.createdAt || null,
        keywordBreakdown: keywordStats,
      },
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching rule logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule logs' },
      { status: 500 }
    );
  }
}
