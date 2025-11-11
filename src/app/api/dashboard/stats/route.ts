import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 今日のメッセージ数（受信/送信）
    const [todayInbound, todayOutbound] = await Promise.all([
      prisma.message.count({
        where: {
          direction: "INBOUND",
          createdAt: { gte: todayStart },
        },
      }),
      prisma.message.count({
        where: {
          direction: "OUTBOUND",
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    // ユーザー統計
    const [totalUsers, followingUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { isFollowing: true },
      }),
    ]);

    // 総メッセージ数
    const totalMessages = await prisma.message.count();

    // テンプレート数
    const totalTemplates = await prisma.template.count({
      where: { isActive: true },
    });

    // 配信状況（Draft/Scheduled）
    const [draftBroadcasts, scheduledBroadcasts] = await Promise.all([
      prisma.broadcast.count({
        where: { status: "DRAFT" },
      }),
      prisma.broadcast.count({
        where: { status: "SCHEDULED" },
      }),
    ]);

    // 最近のメッセージ（5件）
    const recentMessages = await prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            lineUserId: true,
            displayName: true,
          },
        },
      },
    });

    const stats = {
      today: {
        inbound: todayInbound,
        outbound: todayOutbound,
        total: todayInbound + todayOutbound,
      },
      users: {
        total: totalUsers,
        following: followingUsers,
      },
      messages: {
        total: totalMessages,
      },
      templates: {
        active: totalTemplates,
      },
      broadcasts: {
        draft: draftBroadcasts,
        scheduled: scheduledBroadcasts,
      },
      recentMessages: recentMessages.map((m) => ({
        id: m.id,
        direction: m.direction,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          displayName: m.user.displayName,
          lineUserId: m.user.lineUserId,
        },
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/dashboard/stats] Failed to fetch dashboard stats:", {
      error,
    });
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
