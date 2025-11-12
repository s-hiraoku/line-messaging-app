import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auto-reply/logs
 * Get auto-reply logs with pagination and filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const autoReplyId = searchParams.get('autoReplyId');
    const userId = searchParams.get('userId');
    const replySentParam = searchParams.get('replySent');

    const where: any = {};

    if (startDateParam || endDateParam) {
      where.createdAt = {};
      if (startDateParam) where.createdAt.gte = new Date(startDateParam);
      if (endDateParam) where.createdAt.lte = new Date(endDateParam);
    }

    if (autoReplyId) where.autoReplyId = autoReplyId;
    if (userId) where.userId = userId;
    if (replySentParam !== null) where.replySent = replySentParam === 'true';

    const skip = (page - 1) * limit;

    const [logs, totalItems] = await Promise.all([
      prisma.autoReplyLog.findMany({
        where,
        include: {
          autoReply: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
              lineUserId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.autoReplyLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
