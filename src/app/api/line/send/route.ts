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
const flexMessage = z.object({
  type: z.literal("flex"),
  altText: z.string().min(1).max(400),
  contents: z
    .object({ type: z.enum(["bubble", "carousel"]) })
    .passthrough(), // Flex Message JSON structure - validates type and allows additional properties
});

const anyMessage = z.discriminatedUnion("type", [
  textMessage,
  stickerMessage,
  imageMessage,
  flexMessage,
]);

// Support multiple payload formats:
// 1. Legacy text: {to, message, type?: "text"}
// 2. Legacy sticker: {to, type: "sticker", packageId, stickerId}
// 3. Simple text: {to, text}
// 4. Flex: {to, type: "flex", altText, contents}
// 5. Array format: {to, messages: [{type, ...}]}
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

const simpleTextPayloadSchema = z.object({
  to: z.string().min(1),
  text: z.string().min(1),
});

const flexPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("flex"),
  altText: z.string().min(1).max(400),
  contents: z
    .object({ type: z.enum(["bubble", "carousel"]) })
    .passthrough(),
});

const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessage).min(1),
});

const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  flexPayloadSchema,
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
      | { type: "flex"; altText: string; contents: any }
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
    } else if ("type" in payload && payload.type === "flex") {
      // Flex format: {to, type: "flex", altText, contents}
      to = payload.to;
      messages = [
        {
          type: "flex",
          altText: payload.altText,
          contents: payload.contents,
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
      } else if (m.type === "flex") {
        const msg = await prisma.message.create({
          data: {
            type: "FLEX",
            content: {
              altText: m.altText,
              contents: m.contents,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: `📊 ${m.altText}`,
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
