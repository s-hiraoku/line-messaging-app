import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Find the rich menu in database
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

    // Set as default rich menu on LINE
    const client = getLineClient();
    await client.setDefaultRichMenu(richMenu.richMenuId);

    // Update database - unset all other default flags
    await prisma.richMenu.updateMany({
      where: { selected: true },
      data: { selected: false },
    });

    // Set this menu as default
    await prisma.richMenu.update({
      where: { id },
      data: { selected: true },
    });

    return NextResponse.json({ success: true, message: "デフォルトメニューに設定しました" });
  } catch (error) {
    console.error("Set default rich menu error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "デフォルトメニューの設定に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Find the rich menu in database
    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json({ error: "リッチメニューが見つかりません" }, { status: 404 });
    }

    // Cancel default rich menu on LINE
    const client = getLineClient();
    await client.cancelDefaultRichMenu();

    // Update database
    await prisma.richMenu.update({
      where: { id },
      data: { selected: false },
    });

    return NextResponse.json({ success: true, message: "デフォルト設定を解除しました" });
  } catch (error) {
    console.error("Cancel default rich menu error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "デフォルト設定の解除に失敗しました",
      },
      { status: 500 }
    );
  }
}
