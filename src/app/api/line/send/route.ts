import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pushMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";

const textPayloadSchema = z.object({
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

const audioPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("audio"),
  audioUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

const videoPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("video"),
  videoUrl: z.string().url(),
  previewUrl: z.string().url(),
});

const payloadSchema = z.union([
  textPayloadSchema,
  stickerPayloadSchema,
  audioPayloadSchema,
  videoPayloadSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const payload = payloadSchema.parse(json);

    let lineMessage: any;
    let messageType: "TEXT" | "STICKER" | "AUDIO" | "VIDEO";
    let messageContent: any;

    if ("type" in payload && payload.type === "sticker") {
      // Sticker message
      lineMessage = {
        type: "sticker" as const,
        packageId: payload.packageId,
        stickerId: payload.stickerId,
      };
      messageType = "STICKER";
      messageContent = {
        packageId: payload.packageId,
        stickerId: payload.stickerId,
      };
    } else if ("type" in payload && payload.type === "audio") {
      // Audio message
      lineMessage = {
        type: "audio" as const,
        originalContentUrl: payload.audioUrl,
        duration: payload.duration,
      };
      messageType = "AUDIO";
      messageContent = {
        audioUrl: payload.audioUrl,
        duration: payload.duration,
      };
    } else if ("type" in payload && payload.type === "video") {
      // Video message
      lineMessage = {
        type: "video" as const,
        originalContentUrl: payload.videoUrl,
        previewImageUrl: payload.previewUrl,
      };
      messageType = "VIDEO";
      messageContent = {
        videoUrl: payload.videoUrl,
        previewUrl: payload.previewUrl,
      };
    } else {
      // Text message
      lineMessage = { type: "text" as const, text: payload.message };
      messageType = "TEXT";
      messageContent = { text: payload.message };
    }

    await pushMessage(payload.to, lineMessage);

    // Persist outbound message and ensure user exists
    const user = await prisma.user.upsert({
      where: { lineUserId: payload.to },
      update: {},
      create: {
        lineUserId: payload.to,
        displayName: "",
        isFollowing: true,
      },
    });

    const msg = await prisma.message.create({
      data: {
        type: messageType,
        content: messageContent,
        direction: "OUTBOUND",
        userId: user.id,
        deliveryStatus: "SENT",
      },
    });

    await realtime().emit("message:outbound", {
      userId: user.id,
      text: messageType === "TEXT" ? payload.message : undefined,
      createdAt: msg.createdAt.toISOString(),
    });

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
