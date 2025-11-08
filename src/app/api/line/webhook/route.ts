import { NextRequest, NextResponse } from "next/server";
import { validateSignature, type WebhookEvent } from "@line/bot-sdk";
import { getLineClient } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";

function verifySignature(body: string, signature: string | null): void {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    throw new Error("Missing LINE_CHANNEL_SECRET environment variable.");
  }

  if (!signature) {
    throw new Error("Missing LINE signature header.");
  }

  const isValid = validateSignature(body, channelSecret, signature);

  if (!isValid) {
    throw new Error("Invalid LINE signature.");
  }
}

async function handleEvent(event: WebhookEvent) {
  const client = getLineClient();

  switch (event.type) {
    case "follow": {
      if (event.source.type === "user" && event.source.userId) {
        try {
          const profile = await client.getProfile(event.source.userId);
          await prisma.user.upsert({
            where: { lineUserId: event.source.userId },
            update: {
              displayName: profile.displayName ?? "",
              pictureUrl: profile.pictureUrl ?? null,
              isFollowing: true,
            },
            create: {
              lineUserId: event.source.userId,
              displayName: profile.displayName ?? "",
              pictureUrl: profile.pictureUrl ?? null,
              isFollowing: true,
            },
          });
        } catch {
          // swallow profile errors
          await prisma.user.upsert({
            where: { lineUserId: event.source.userId },
            update: { isFollowing: true },
            create: { lineUserId: event.source.userId, displayName: "", isFollowing: true },
          });
        }
      }
      break;
    }
    case "unfollow": {
      if (event.source.type === "user" && event.source.userId) {
        await prisma.user.updateMany({
          where: { lineUserId: event.source.userId },
          data: { isFollowing: false },
        });
      }
      break;
    }
    case "message": {
      if (event.message.type === "text") {
        // store inbound
        if (event.source.type === "user" && event.source.userId) {
          const user = await prisma.user.upsert({
            where: { lineUserId: event.source.userId },
            update: {},
            create: { lineUserId: event.source.userId, displayName: "", isFollowing: true },
          });
          const msg = await prisma.message.create({
            data: {
              type: "TEXT",
              content: { text: event.message.text },
              direction: "INBOUND",
              userId: user.id,
              deliveryStatus: "RECEIVED",
            },
          });
          await realtime().emit("message:inbound", {
            userId: user.id,
            text: event.message.text,
            createdAt: msg.createdAt.toISOString(),
          });
        }

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "メッセージありがとうございます！",
        });
      }
      break;
    }
    case "postback": {
      // TODO: Handle postback actions
      break;
    }
    default:
      break;
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-line-signature");
    const rawBody = await req.text();

    verifySignature(rawBody, signature);

    const events = JSON.parse(rawBody).events as WebhookEvent[];

    await Promise.all(events.map((event) => handleEvent(event)));

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
