import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pushMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";

// Message types
const textMessage = z.object({ type: z.literal("text"), text: z.string().min(1) });
const stickerMessage = z.object({
  type: z.literal("sticker"),
  packageId: z.string().min(1),
  stickerId: z.string().min(1),
});
const imageMessage = z.object({
  type: z.literal("image"),
  originalContentUrl: z.string().url(),
  previewImageUrl: z.string().url().optional(),
});
const videoMessage = z.object({
  type: z.literal("video"),
  originalContentUrl: z.string().url(),
  previewImageUrl: z.string().url(),
});
const audioMessage = z.object({
  type: z.literal("audio"),
  originalContentUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

const anyMessage = z.discriminatedUnion("type", [
  textMessage,
  stickerMessage,
  imageMessage,
  videoMessage,
  audioMessage,
]);

// Support multiple payload formats:
// 1. Legacy text: {to, message, type?: "text"}
// 2. Legacy sticker: {to, type: "sticker", packageId, stickerId}
// 3. Legacy video: {to, type: "video", videoUrl, previewUrl}
// 4. Legacy audio: {to, type: "audio", audioUrl, duration}
// 5. Simple text: {to, text}
// 6. Array format: {to, messages: [{type, ...}]}
const legacyTextPayloadSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1),
  type: z.literal("text").optional(),
});

const stickerPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("sticker"),
  packageId: z.string().min(1),
  stickerId: z.string().min(1),
});

const videoPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("video"),
  videoUrl: z.string().url(),
  previewUrl: z.string().url(),
});

const audioPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("audio"),
  audioUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

const simpleTextPayloadSchema = z.object({
  to: z.string().min(1),
  text: z.string().min(1),
});

const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessage).min(1),
});

const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  videoPayloadSchema,
  audioPayloadSchema,
  arrayPayloadSchema,
  simpleTextPayloadSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const payload = payloadSchema.parse(json);

    // Normalize all formats to messages array
    let messages: Array<
      | { type: "text"; text: string }
      | { type: "sticker"; packageId: string; stickerId: string }
      | { type: "image"; originalContentUrl: string; previewImageUrl?: string }
      | { type: "video"; originalContentUrl: string; previewImageUrl: string }
      | { type: "audio"; originalContentUrl: string; duration: number }
    >;
    let to: string;

    if ("messages" in payload) {
      // Array format: {to, messages}
      to = payload.to;
      messages = payload.messages;
    } else if ("type" in payload && payload.type === "sticker") {
      // Sticker format: {to, type: "sticker", packageId, stickerId}
      to = payload.to;
      messages = [
        {
          type: "sticker",
          packageId: payload.packageId,
          stickerId: payload.stickerId,
        },
      ];
    } else if ("type" in payload && payload.type === "video") {
      // Video format: {to, type: "video", videoUrl, previewUrl}
      to = payload.to;
      messages = [
        {
          type: "video",
          originalContentUrl: payload.videoUrl,
          previewImageUrl: payload.previewUrl,
        },
      ];
    } else if ("type" in payload && payload.type === "audio") {
      // Audio format: {to, type: "audio", audioUrl, duration}
      to = payload.to;
      messages = [
        {
          type: "audio",
          originalContentUrl: payload.audioUrl,
          duration: payload.duration,
        },
      ];
    } else if ("text" in payload) {
      // Simple text format: {to, text}
      to = payload.to;
      messages = [{ type: "text", text: payload.text }];
    } else {
      // Legacy text format: {to, message}
      to = payload.to;
      messages = [{ type: "text", text: payload.message }];
    }

    // Send messages to LINE
    await pushMessage(to, messages as any);

    // Persist outbound message and ensure user exists
    const user = await prisma.user.upsert({
      where: { lineUserId: to },
      update: {},
      create: {
        lineUserId: to,
        displayName: "",
        isFollowing: true,
      },
    });

    // Persist each message and emit events
    for (const m of messages) {
      if (m.type === "text") {
        const msg = await prisma.message.create({
          data: {
            type: "TEXT",
            content: { text: m.text },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: m.text,
          createdAt: msg.createdAt.toISOString(),
        });
      } else if (m.type === "sticker") {
        const msg = await prisma.message.create({
          data: {
            type: "STICKER",
            content: {
              packageId: m.packageId,
              stickerId: m.stickerId,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: undefined,
          createdAt: msg.createdAt.toISOString(),
        });
      } else if (m.type === "image") {
        const msg = await prisma.message.create({
          data: {
            type: "IMAGE",
            content: {
              originalContentUrl: m.originalContentUrl,
              previewImageUrl: m.previewImageUrl ?? null,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: undefined,
          createdAt: msg.createdAt.toISOString(),
        });
      } else if (m.type === "video") {
        const msg = await prisma.message.create({
          data: {
            type: "VIDEO",
            content: {
              videoUrl: m.originalContentUrl,
              previewUrl: m.previewImageUrl,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: undefined,
          createdAt: msg.createdAt.toISOString(),
        });
      } else if (m.type === "audio") {
        const msg = await prisma.message.create({
          data: {
            type: "AUDIO",
            content: {
              audioUrl: m.originalContentUrl,
              duration: m.duration,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: undefined,
          createdAt: msg.createdAt.toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
