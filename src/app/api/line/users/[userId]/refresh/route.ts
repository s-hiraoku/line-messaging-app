import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getLineClient } from "@/lib/line/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params;
  try {
    // Get authenticated user ID
    const authUserId = await requireAuthenticatedUserId();

    const { userId } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, lineUserId: true },
    });

    if (!user || !user.lineUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const client = await getLineClient(authUserId);
    const profile = await client.getProfile(user.lineUserId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
    });
  } catch (error) {
    console.error(
      "[POST /api/line/users/[userId]/refresh] Failed to update user:",
      {
        error,
        userId: resolvedParams.userId,
        url: req.url,
        method: req.method,
      }
    );
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
