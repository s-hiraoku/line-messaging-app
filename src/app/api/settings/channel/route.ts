import { NextResponse } from "next/server";

// Channel settings are managed via environment variables for runtime consistency.
// This API exposes read-only status so the UI can reflect whether values are configured.

export async function GET() {
  try {
    const channelId = process.env.LINE_CHANNEL_ID ?? "";
    const channelSecretConfigured = Boolean(process.env.LINE_CHANNEL_SECRET);

    return NextResponse.json({ channelId, channelSecretConfigured });
  } catch (error) {
    console.error("Failed to load channel env status", error);
    return NextResponse.json(
      { error: "チャネル設定の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT() {
  // Managed via env; prevent writes from API.
  return NextResponse.json(
    { error: "チャネル情報は環境変数（.env または .env.local）で管理されています。ファイルを更新してください。" },
    { status: 405 },
  );
}
