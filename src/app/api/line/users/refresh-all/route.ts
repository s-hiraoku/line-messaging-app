import { NextResponse } from "next/server";
import { requireAuthenticatedUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

export async function POST() {
  try {
    // Get authenticated user ID
    const userId = await requireAuthenticatedUserId();

    const users = await prisma.user.findMany({
      where: { isFollowing: true },
      select: { id: true, lineUserId: true },
    });

    const client = await getLineClient(userId);
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        if (!user.lineUserId) continue;

        const profile = await client.getProfile(user.lineUserId);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to update user ${user.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      total: users.length,
    });
  } catch (error) {
    console.error(
      "[POST /api/line/users/refresh-all] Failed to update users:",
      error
    );
    return NextResponse.json(
      { error: "Failed to update users" },
      { status: 500 }
    );
  }
}
