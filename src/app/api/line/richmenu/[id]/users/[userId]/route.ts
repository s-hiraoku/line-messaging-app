import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

interface RouteContext {
  params: Promise<{ id: string; userId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id, userId } = await context.params;

    // Find the rich menu
    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json({ error: "リッチメニューが見つかりません" }, { status: 404 });
    }

    if (!richMenu.richMenuId) {
      return NextResponse.json(
        { error: "LINE上にまだアップロードされていません" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    // Link rich menu to user on LINE
    const client = getLineClient();
    await client.linkRichMenuToUser(user.lineUserId, richMenu.richMenuId);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: { richMenuId: richMenu.richMenuId },
    });

    return NextResponse.json({
      success: true,
      message: "ユーザーにリッチメニューを設定しました",
    });
  } catch (error) {
    console.error("Link rich menu error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "リッチメニューの設定に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    // Unlink rich menu from user on LINE
    const client = getLineClient();
    await client.unlinkRichMenuFromUser(user.lineUserId);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: { richMenuId: null },
    });

    return NextResponse.json({
      success: true,
      message: "ユーザーのリッチメニュー設定を解除しました",
    });
  } catch (error) {
    console.error("Unlink rich menu error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "リッチメニュー設定の解除に失敗しました",
      },
      { status: 500 }
    );
  }
}
