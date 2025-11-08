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

    messages.forEach((msg) => {
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

    messages.forEach((msg) => {
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

    messages.forEach((msg) => {
      const day = msg.createdAt.getDay();
      if (msg.direction === "INBOUND") {
        weekdayDistribution[day].inbound++;
      } else {
        weekdayDistribution[day].outbound++;
      }
    });

    // 総計
    const totalInbound = messages.filter((m) => m.direction === "INBOUND").length;
    const totalOutbound = messages.filter((m) => m.direction === "OUTBOUND").length;

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
      daily: dailyData,
      hourly: hourlyDistribution,
      weekday: weekdayDistribution,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
