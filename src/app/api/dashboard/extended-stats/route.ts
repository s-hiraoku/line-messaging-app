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
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
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
    const richMenus = await prisma.richMenu.findMany({
      select: {
        id: true,
        richMenuId: true,
        name: true,
        selected: true
      }
    });

    const richMenuStats = await Promise.all(
      richMenus.map(async (menu) => {
        const userCount = await prisma.user.count({
          where: { richMenuId: menu.richMenuId }
        });
        return {
          id: menu.id,
          name: menu.name,
          selected: menu.selected,
          userCount
        };
      })
    );

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
        DATE("createdAt") as date,
        SUM(CASE WHEN direction = 'INBOUND' THEN 1 ELSE 0 END) as inbound,
        SUM(CASE WHEN direction = 'OUTBOUND' THEN 1 ELSE 0 END) as outbound
      FROM "Message"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
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

    // エンゲージメント指標
    // 1. 平均応答時間（受信メッセージから送信メッセージまでの平均時間）
    const recentMessages = await prisma.message.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        direction: 'INBOUND'
      },
      select: {
        userId: true,
        createdAt: true
      }
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    for (const inboundMsg of recentMessages) {
      const nextOutbound = await prisma.message.findFirst({
        where: {
          userId: inboundMsg.userId,
          direction: 'OUTBOUND',
          createdAt: { gt: inboundMsg.createdAt }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (nextOutbound) {
        const responseTime = nextOutbound.createdAt.getTime() - inboundMsg.createdAt.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }

    const averageResponseTime = responseCount > 0
      ? Math.round(totalResponseTime / responseCount / 1000 / 60) // 分単位
      : 0;

    // 2. アクティブユーザー率（過去7日間でメッセージを送ったユーザー）
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        messages: {
          some: {
            createdAt: { gte: sevenDaysAgo }
          }
        }
      }
    });

    const activeUserRate = totalUsers > 0
      ? ((activeUsers / totalUsers) * 100).toFixed(1)
      : "0";

    // 3. ユーザーあたりの平均メッセージ数
    const totalMessages = await prisma.message.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const messagesPerUser = activeUsers > 0
      ? (totalMessages / activeUsers).toFixed(1)
      : "0";

    // 月次比較データ
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentMonthMessages = await prisma.message.count({
      where: {
        createdAt: { gte: oneMonthAgo }
      }
    });

    const previousMonthMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo
        }
      }
    });

    const currentMonthUsers = await prisma.user.count({
      where: {
        createdAt: { gte: oneMonthAgo }
      }
    });

    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo
        }
      }
    });

    const messageGrowthRate = previousMonthMessages > 0
      ? (((currentMonthMessages - previousMonthMessages) / previousMonthMessages) * 100).toFixed(1)
      : "0";

    const userGrowthRate = previousMonthUsers > 0
      ? (((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100).toFixed(1)
      : "0";

    // 最近のアクティビティフィード（過去24時間）
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentMessages24h = await prisma.message.findMany({
      where: {
        createdAt: { gte: oneDayAgo }
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const recentUserActions = await prisma.user.findMany({
      where: {
        OR: [
          { createdAt: { gte: oneDayAgo } },
          { updatedAt: { gte: oneDayAgo } }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        displayName: true,
        pictureUrl: true,
        isFollowing: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const activityFeed = {
      recentMessages: recentMessages24h.map((msg: { id: string; type: string; direction: string; createdAt: Date; user: { displayName: string; pictureUrl: string | null } }) => ({
        id: msg.id,
        type: msg.type,
        direction: msg.direction,
        userName: msg.user.displayName,
        userPicture: msg.user.pictureUrl,
        timestamp: msg.createdAt.toISOString()
      })),
      recentUserActions: recentUserActions.map((user: { id: string; displayName: string; pictureUrl: string | null; isFollowing: boolean; createdAt: Date; updatedAt: Date }) => ({
        userId: user.id,
        userName: user.displayName,
        userPicture: user.pictureUrl,
        action: user.createdAt.toISOString() === user.updatedAt.toISOString() ? 'follow' : (user.isFollowing ? 'update' : 'unfollow'),
        timestamp: user.updatedAt.toISOString()
      }))
    };

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
      topTemplates,
      // エンゲージメント指標
      engagement: {
        averageResponseTime, // 分単位
        activeUserRate: parseFloat(activeUserRate), // パーセント
        messagesPerUser: parseFloat(messagesPerUser), // 平均メッセージ数
        activeUsers,
        totalUsers
      },
      // 月次比較
      monthlyComparison: {
        messages: {
          current: currentMonthMessages,
          previous: previousMonthMessages,
          growthRate: parseFloat(messageGrowthRate)
        },
        users: {
          current: currentMonthUsers,
          previous: previousMonthUsers,
          growthRate: parseFloat(userGrowthRate)
        }
      },
      // アクティビティフィード
      activityFeed
    };

    return NextResponse.json(extendedStats);
  } catch (error) {
    console.error("Failed to fetch extended dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch extended dashboard stats",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
