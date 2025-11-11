import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isFollowing: true,
      },
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        pictureUrl: true,
        richMenuId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/line/users] Failed to fetch users:", {
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ユーザーの取得に失敗しました" },
      { status: 500 }
    );
  }
}
