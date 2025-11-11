import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;
  try {
    const { userId } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lineUserId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const client = await getLineClient();
    const profile = await client.getProfile(user.lineUserId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: profile.displayName ?? "",
        pictureUrl: profile.pictureUrl ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/line/users/[userId]/refresh] Failed to refresh user profile:", {
      error,
      userId: resolvedParams.userId,
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "プロフィールの更新に失敗しました",
      },
      { status: 500 }
    );
  }
}
