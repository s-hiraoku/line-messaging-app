import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Delete rich menu
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { id } = resolvedParams;

    // Check if rich menu exists
    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json(
        { error: "Rich menu not found" },
        { status: 404 }
      );
    }

    // TODO: Delete from LINE API if richMenuId exists
    // if (richMenu.richMenuId) {
    //   await lineClient.deleteRichMenu(richMenu.richMenuId);
    // }

    // Delete from database
    await prisma.richMenu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/line/richmenu/[id]] Failed to delete rich menu:", {
      error,
      richMenuId: resolvedParams.id,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json(
      { error: "Failed to delete rich menu" },
      { status: 500 }
    );
  }
}

// GET - Get single rich menu
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { id } = resolvedParams;

    const richMenu = await prisma.richMenu.findUnique({
      where: { id },
    });

    if (!richMenu) {
      return NextResponse.json(
        { error: "Rich menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ richMenu });
  } catch (error) {
    console.error("[GET /api/line/richmenu/[id]] Failed to fetch rich menu:", {
      error,
      richMenuId: resolvedParams.id,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json(
      { error: "Failed to fetch rich menu" },
      { status: 500 }
    );
  }
}
