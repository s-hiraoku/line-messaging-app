import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

type RichMenuSize = { width: number; height: number };

const RICHMENU_SIZES: Record<string, RichMenuSize> = {
  "2500x1686": { width: 2500, height: 1686 },
  "2500x843": { width: 2500, height: 843 },
  "1200x810": { width: 1200, height: 810 },
  "1200x405": { width: 1200, height: 405 },
  "800x540": { width: 800, height: 540 },
  "800x270": { width: 800, height: 270 },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { id } = resolvedParams;

    // Get rich menu from database
    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json(
        { error: "リッチメニューが見つかりません" },
        { status: 404 }
      );
    }

    if (richMenu.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "既に公開されています" },
        { status: 400 }
      );
    }

    if (!richMenu.imageUrl) {
      return NextResponse.json(
        { error: "画像が設定されていません" },
        { status: 400 }
      );
    }

    const client = await getLineClient();

    // Step 1: Create rich menu in LINE API
    const richMenuSize = RICHMENU_SIZES[richMenu.size];
    if (!richMenuSize) {
      return NextResponse.json(
        { error: "無効なリッチメニューサイズです" },
        { status: 400 }
      );
    }

    // createRichMenu returns the richMenuId directly as a string
    const lineRichMenuId = await client.createRichMenu({
      size: richMenuSize,
      selected: richMenu.selected,
      name: richMenu.name,
      chatBarText: richMenu.chatBarText,
      areas: richMenu.areas as any,
    });

    // Step 2: Upload image to LINE API
    const imageResponse = await fetch(richMenu.imageUrl);
    if (!imageResponse.ok) {
      throw new Error("画像の取得に失敗しました");
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    await client.setRichMenuImage(lineRichMenuId, imageBuffer, "image/jpeg");

    // Step 3: Update database with LINE rich menu ID and status
    await prisma.richMenu.update({
      where: { id },
      data: {
        richMenuId: lineRichMenuId,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({
      success: true,
      richMenuId: lineRichMenuId,
      steps: {
        create: { success: true, richMenuId: lineRichMenuId },
        uploadImage: { success: true },
        updateDatabase: { success: true },
      },
    });
  } catch (error) {
    console.error("[POST /api/line/richmenu/[id]/publish] Failed to publish rich menu:", {
      error,
      richMenuId: resolvedParams.id,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json(
      {
        error: "公開に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
