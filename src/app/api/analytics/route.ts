import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7", 10);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 日別メッセージ数
    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        direction: true,
      },
    });

    // 日別に集計
    const dailyStats: Record<string, { inbound: number; outbound: number; total: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dailyStats[dateStr] = { inbound: 0, outbound: 0, total: 0 };
    }

    messages.forEach((msg: { createdAt: Date; direction: string }) => {
      const dateStr = msg.createdAt.toISOString().split("T")[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].total++;
        if (msg.direction === "INBOUND") {
          dailyStats[dateStr].inbound++;
        } else {
          dailyStats[dateStr].outbound++;
        }
      }
    });

    const dailyData = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 時間帯別の分布（0-23時）
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      inbound: 0,
      outbound: 0,
    }));

    messages.forEach((msg: { createdAt: Date; direction: string }) => {
      const hour = msg.createdAt.getHours();
      if (msg.direction === "INBOUND") {
        hourlyDistribution[hour].inbound++;
      } else {
        hourlyDistribution[hour].outbound++;
      }
    });

    // 曜日別の分布（0=日曜日）
    const weekdayDistribution = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      dayName: ["日", "月", "火", "水", "木", "金", "土"][i],
      inbound: 0,
      outbound: 0,
    }));

    messages.forEach((msg: { createdAt: Date; direction: string }) => {
      const day = msg.createdAt.getDay();
      if (msg.direction === "INBOUND") {
        weekdayDistribution[day].inbound++;
      } else {
        weekdayDistribution[day].outbound++;
      }
    });

    // 総計
    const totalInbound = messages.filter((m: { direction: string }) => m.direction === "INBOUND").length;
    const totalOutbound = messages.filter((m: { direction: string }) => m.direction === "OUTBOUND").length;

    // ユーザー増減（期間内の新規ユーザー）
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // フォロー解除数（isFollowing = falseになった数は推測）
    const totalUsers = await prisma.user.count();
    const followingUsers = await prisma.user.count({
      where: { isFollowing: true },
    });

    // 応答率（受信メッセージに対する送信メッセージの割合）
    const responseRate = totalInbound > 0 ? ((totalOutbound / totalInbound) * 100).toFixed(1) : "0";

    // メッセージタイプ別の分析
    const messageTypes = await prisma.message.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
    });

    const messageTypeStats = messageTypes.map((item: { type: string; _count: { id: number } }) => ({
      type: item.type,
      count: item._count.id,
    }));

    // タグ別ユーザー数
    const tagStats = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    });

    const tagData = tagStats.map((tag: { id: string; name: string; _count: { users: number } }) => ({
      tagId: tag.id,
      tagName: tag.name,
      userCount: tag._count.users,
    }));

    // 配信統計
    const broadcastStats = await prisma.broadcast.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const broadcastData = broadcastStats.map((item: { status: string; _count: { id: number } }) => ({
      status: item.status,
      count: item._count.id,
    }));

    const totalBroadcasts = await prisma.broadcast.count();
    const scheduledBroadcasts = await prisma.broadcast.count({
      where: { status: 'SCHEDULED' },
    });

    // 前期間のデータを取得して比較
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousMessages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        direction: true,
      },
    });

    const previousInbound = previousMessages.filter((m: { direction: string }) => m.direction === "INBOUND").length;
    const previousOutbound = previousMessages.filter((m: { direction: string }) => m.direction === "OUTBOUND").length;
    const previousTotal = previousInbound + previousOutbound;

    const previousNewUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    // 変化率の計算
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const analytics = {
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
      summary: {
        totalInbound,
        totalOutbound,
        total: totalInbound + totalOutbound,
        responseRate: parseFloat(responseRate),
        newUsers,
        totalUsers,
        followingUsers,
      },
      comparison: {
        totalMessages: {
          current: totalInbound + totalOutbound,
          previous: previousTotal,
          change: calculateChange(totalInbound + totalOutbound, previousTotal),
        },
        inbound: {
          current: totalInbound,
          previous: previousInbound,
          change: calculateChange(totalInbound, previousInbound),
        },
        outbound: {
          current: totalOutbound,
          previous: previousOutbound,
          change: calculateChange(totalOutbound, previousOutbound),
        },
        newUsers: {
          current: newUsers,
          previous: previousNewUsers,
          change: calculateChange(newUsers, previousNewUsers),
        },
      },
      messageTypes: messageTypeStats,
      tags: tagData,
      broadcasts: {
        total: totalBroadcasts,
        scheduled: scheduledBroadcasts,
        byStatus: broadcastData,
      },
      daily: dailyData,
      hourly: hourlyDistribution,
      weekday: weekdayDistribution,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[GET /api/analytics] Failed to fetch analytics:", {
      error,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
