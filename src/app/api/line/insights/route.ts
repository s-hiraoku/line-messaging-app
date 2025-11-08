import { NextRequest, NextResponse } from "next/server";
import { getChannelAccessToken } from "@/lib/line/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getPreviousDate();

    const token = await getChannelAccessToken();

    // フォロワー統計を取得
    const followersUrl = `https://api.line.me/v2/bot/insight/followers?date=${date}`;
    const followersRes = await fetch(followersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let followersData = null;
    if (followersRes.ok) {
      followersData = await followersRes.json();
    }

    // メッセージ配信統計を取得（過去30日分）
    const deliveryPromises = [];
    for (let i = 0; i < 7; i++) {
      const d = getPreviousDate(i);
      deliveryPromises.push(
        fetch(`https://api.line.me/v2/bot/insight/message/delivery?date=${d}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    }

    const deliveryResults = await Promise.all(deliveryPromises);
    const deliveryData = await Promise.all(
      deliveryResults.map(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        return null;
      })
    );

    const insights = {
      date,
      followers: followersData,
      messageDelivery: deliveryData.filter((d) => d !== null),
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Failed to fetch LINE insights:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch insights",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// YYYYMMDD形式で前日の日付を取得
function getPreviousDate(daysAgo = 1): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
