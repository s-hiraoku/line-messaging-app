import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

export async function POST() {
  try {
    const users = await prisma.user.findMany({
      where: { isFollowing: true },
      select: { id: true, lineUserId: true },
    });

    const client = await getLineClient();
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const profile = await client.getProfile(user.lineUserId);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            displayName: profile.displayName ?? "",
            pictureUrl: profile.pictureUrl ?? null,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to update user ${user.lineUserId}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: successCount,
      failed: errorCount,
      total: users.length,
    });
  } catch (error) {
    console.error("Failed to refresh all user profiles:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "プロフィールの一括更新に失敗しました",
      },
      { status: 500 }
    );
  }
}
