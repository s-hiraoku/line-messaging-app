import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auto-reply/analytics
 * Get analytics summary for auto-reply system
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const endDate = endDateParam ? new Date(endDateParam) : new Date(); // Default: now

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Total replies
    const totalReplies = await prisma.autoReplyLog.count({ where });

    // Successful replies
    const successfulReplies = await prisma.autoReplyLog.count({
      where: {
        ...where,
        replySent: true,
      },
    });

    // Success rate
    const successRate = totalReplies > 0 ? (successfulReplies / totalReplies) * 100 : 0;

    // Active rules count
    const activeRules = await prisma.autoReply.count({
      where: { isActive: true },
    });

    // Unique users
    const uniqueUsersData = await prisma.autoReplyLog.findMany({
      where,
      distinct: ['userId'],
      select: { userId: true },
    });
    const uniqueUsers = uniqueUsersData.length;

    // Top rules by usage
    const topRulesData = await prisma.autoReplyLog.groupBy({
      by: ['autoReplyId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topRules = await Promise.all(
      topRulesData.map(async (item) => {
        const rule = await prisma.autoReply.findUnique({
          where: { id: item.autoReplyId },
        });

        const ruleSuccessCount = await prisma.autoReplyLog.count({
          where: {
            ...where,
            autoReplyId: item.autoReplyId,
            replySent: true,
          },
        });

        const ruleSuccessRate = item._count.id > 0 ? (ruleSuccessCount / item._count.id) * 100 : 0;

        return {
          id: item.autoReplyId,
          name: rule?.name || 'Unknown',
          usageCount: item._count.id,
          successRate: ruleSuccessRate,
          percentage: totalReplies > 0 ? (item._count.id / totalReplies) * 100 : 0,
        };
      })
    );

    // Errors by type
    const errorLogs = await prisma.autoReplyLog.findMany({
      where: {
        ...where,
        replySent: false,
        errorMessage: { not: null },
      },
      select: { errorMessage: true },
    });

    const errorsByType: Record<string, number> = {};
    errorLogs.forEach((log) => {
      const errorMsg = log.errorMessage || 'Unknown';
      const errorType = errorMsg.includes('network') || errorMsg.includes('ECONNREFUSED')
        ? 'networkError'
        : errorMsg.includes('token') || errorMsg.includes('invalid')
        ? 'invalidReplyToken'
        : errorMsg.includes('rate') || errorMsg.includes('limit')
        ? 'rateLimitExceeded'
        : 'other';

      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        totalReplies,
        successRate: Number(successRate.toFixed(1)),
        activeRules,
        uniqueUsers,
      },
      topRules,
      errorsByType,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
