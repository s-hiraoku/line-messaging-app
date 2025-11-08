import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  channelId: z.string().trim().min(1, "チャネルIDを入力してください"),
  channelSecret: z.string().trim().min(1, "チャネルシークレットを入力してください").optional(),
  channelAccessToken: z.string().trim().min(1, "アクセストークンを入力してください").optional(),
});

const CHANNEL_CONFIG_ID = "primary";

export async function GET() {
  try {
    const config = await prisma.channelConfig.findUnique({ where: { id: CHANNEL_CONFIG_ID } });
    return NextResponse.json({
      channelId: config?.channelId ?? "",
      channelSecretConfigured: Boolean(config?.channelSecret),
      channelAccessTokenConfigured: Boolean(config?.channelAccessToken),
    });
  } catch (error) {
    console.error("Failed to load channel config", error);
    return NextResponse.json(
      { error: "チャネル設定の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const { channelId, channelSecret, channelAccessToken } = updateSchema.parse(json);

    const dataToUpdate: { channelId: string; channelSecret?: string | null; channelAccessToken?: string | null } = {
      channelId,
    };
    if (typeof channelSecret === "string") dataToUpdate.channelSecret = channelSecret;
    if (typeof channelAccessToken === "string") dataToUpdate.channelAccessToken = channelAccessToken;

    const updated = await prisma.channelConfig.upsert({
      where: { id: CHANNEL_CONFIG_ID },
      create: {
        id: CHANNEL_CONFIG_ID,
        channelId: dataToUpdate.channelId,
        channelSecret: dataToUpdate.channelSecret ?? null,
        channelAccessToken: dataToUpdate.channelAccessToken ?? null,
      },
      update: {
        channelId: dataToUpdate.channelId,
        ...(dataToUpdate.channelSecret !== undefined ? { channelSecret: dataToUpdate.channelSecret } : {}),
        ...(dataToUpdate.channelAccessToken !== undefined ? { channelAccessToken: dataToUpdate.channelAccessToken } : {}),
      },
    });

    return NextResponse.json({
      channelId: updated.channelId ?? "",
      channelSecretConfigured: Boolean(updated.channelSecret),
      channelAccessTokenConfigured: Boolean(updated.channelAccessToken),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "入力値が不正です" },
        { status: 400 },
      );
    }
    console.error("Failed to update channel config", error);
    return NextResponse.json(
      { error: "チャネル設定の保存に失敗しました" },
      { status: 500 },
    );
  }
}
