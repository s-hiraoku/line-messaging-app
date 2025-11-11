import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const resolvedParams = await context.params;
  try {
    const { id } = resolvedParams;

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
    const client = await getLineClient();
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
    console.error("[POST /api/line/richmenu/[id]/default] Set default rich menu error:", {
      error,
      richMenuId: resolvedParams.id,
      url: request.url,
      method: request.method,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "デフォルトメニューの設定に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const resolvedParams = await context.params;
  try {
    const { id } = resolvedParams;

    // Find the rich menu in database
    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json({ error: "リッチメニューが見つかりません" }, { status: 404 });
    }

    // Cancel default rich menu on LINE
    // TODO: Implement cancel default rich menu via LINE API
    // const client = await getLineClient();
    // await fetch(`https://api.line.me/v2/bot/user/all/richmenu`, {
    //   method: 'DELETE',
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // });

    // Update database
    await prisma.richMenu.update({
      where: { id },
      data: { selected: false },
    });

    return NextResponse.json({ success: true, message: "デフォルト設定を解除しました" });
  } catch (error) {
    console.error("[DELETE /api/line/richmenu/[id]/default] Cancel default rich menu error:", {
      error,
      richMenuId: resolvedParams.id,
      url: request.url,
      method: request.method,
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "デフォルト設定の解除に失敗しました",
      },
      { status: 500 }
    );
  }
}
