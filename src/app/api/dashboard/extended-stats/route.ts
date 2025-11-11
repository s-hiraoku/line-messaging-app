import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // メッセージタイプ別の分布
    const messageTypeStats = await prisma.message.groupBy({
      by: ['type'],
      _count: { id: true },
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const messageTypeDistribution = messageTypeStats.map((stat: { type: string; _count: { id: number } }) => ({
      type: stat.type,
      count: stat._count.id
    }));

    // ユーザー成長データ（過去30日間）
    const userGrowthData = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM User
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const userGrowth = userGrowthData.map((item: { date: Date; count: bigint }) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count)
    }));

    // トップアクティブユーザー（メッセージ数が多い順）
    const topActiveUsers = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        pictureUrl: true,
        _count: {
          select: { messages: true }
        }
      },
      where: {
        messages: {
          some: {}
        }
      },
      orderBy: {
        messages: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const topUsers = topActiveUsers.map((user: { id: string; displayName: string; pictureUrl: string | null; _count: { messages: number } }) => ({
      id: user.id,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
      messageCount: user._count.messages
    }));

    // リッチメニューの使用状況
    const richMenuUsage = await prisma.richMenu.findMany({
      select: {
        id: true,
        name: true,
        selected: true,
        _count: {
          select: { users: true }
        }
      }
    });

    const richMenuStats = richMenuUsage.map((menu: { id: string; name: string; selected: boolean; _count: { users: number } }) => ({
      id: menu.id,
      name: menu.name,
      selected: menu.selected,
      userCount: menu._count.users
    }));

    // ユーザーセグメント（タグ）の概要
    const tagStats = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        users: {
          _count: 'desc'
        }
      }
    });

    const userSegmentation = tagStats.map((tag: { id: string; name: string; color: string; _count: { users: number } }) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userCount: tag._count.users
    }));

    // ブロードキャストステータスの概要
    const broadcastsByStatus = await prisma.broadcast.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const broadcastStats = broadcastsByStatus.map((stat: { status: string; _count: { id: number } }) => ({
      status: stat.status,
      count: stat._count.id
    }));

    // 最近のブロードキャスト
    const recentBroadcasts = await prisma.broadcast.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        createdAt: true
      }
    });

    // 週ごとのメッセージ活動（過去7日間）
    const weeklyActivity = await prisma.$queryRaw<Array<{ date: Date; inbound: bigint; outbound: bigint }>>`
      SELECT
        DATE(createdAt) as date,
        SUM(CASE WHEN direction = 'INBOUND' THEN 1 ELSE 0 END) as inbound,
        SUM(CASE WHEN direction = 'OUTBOUND' THEN 1 ELSE 0 END) as outbound
      FROM Message
      WHERE createdAt >= ${sevenDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const weeklyActivityData = weeklyActivity.map((item: { date: Date; inbound: bigint; outbound: bigint }) => ({
      date: item.date.toISOString().split('T')[0],
      inbound: Number(item.inbound),
      outbound: Number(item.outbound)
    }));

    // 新規ユーザー（過去7日間）
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // テンプレート使用統計
    const templateUsage = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        messages: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const topTemplates = templateUsage.map((template: { id: string; name: string; category: string | null; isActive: boolean; _count: { messages: number } }) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      isActive: template.isActive,
      usageCount: template._count.messages
    }));

    const extendedStats = {
      messageTypeDistribution,
      userGrowth,
      topUsers,
      richMenuStats,
      userSegmentation,
      broadcastStats,
      recentBroadcasts: recentBroadcasts.map((b: { id: string; title: string; status: string; scheduledAt: Date | null; createdAt: Date }) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        scheduledAt: b.scheduledAt?.toISOString() || null,
        createdAt: b.createdAt.toISOString()
      })),
      weeklyActivity: weeklyActivityData,
      newUsersCount,
      topTemplates
    };

    return NextResponse.json(extendedStats);
  } catch (error) {
    console.error("Failed to fetch extended dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch extended dashboard stats" },
      { status: 500 }
    );
  }
}
