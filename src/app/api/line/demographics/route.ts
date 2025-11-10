import { NextRequest, NextResponse } from "next/server";
import { getChannelAccessToken } from "@/lib/line/client";

export async function GET(req: NextRequest) {
  try {
    const token = await getChannelAccessToken();

    // 友だちの属性情報を取得
    const demographicsUrl = `https://api.line.me/v2/bot/insight/demographic`;
    const demographicsRes = await fetch(demographicsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!demographicsRes.ok) {
      const errorText = await demographicsRes.text();
      console.error("LINE demographics API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch demographics",
          message: errorText,
        },
        { status: demographicsRes.status }
      );
    }

    const demographicsData = await demographicsRes.json();

    return NextResponse.json(demographicsData);
  } catch (error) {
    console.error("Failed to fetch LINE demographics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch demographics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
