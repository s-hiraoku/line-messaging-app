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

const anyMessage = z.discriminatedUnion("type", [textMessage, stickerMessage, imageMessage]);

// Template action schema
const templateActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uri"),
    label: z.string().min(1).max(20),
    uri: z.string().url(),
  }),
  z.object({
    type: z.literal("message"),
    label: z.string().min(1).max(20),
    text: z.string().min(1).max(300),
  }),
  z.object({
    type: z.literal("postback"),
    label: z.string().min(1).max(20),
    data: z.string().min(1).max(300),
    text: z.string().max(300).optional(),
  }),
]);

// Support multiple payload formats:
// 1. Legacy text: {to, message, type?: "text"}
// 2. Legacy sticker: {to, type: "sticker", packageId, stickerId}
// 3. Simple text: {to, text}
// 4. Array format: {to, messages: [{type, ...}]}
// 5. Template: {to, type: "template", altText, template}
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

const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessage).min(1),
});

const templatePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("template"),
  altText: z.string().min(1).max(400),
  template: z.object({
    type: z.literal("buttons"),
    text: z.string().min(1).max(160),
    actions: z.array(templateActionSchema).min(1).max(4),
    thumbnailImageUrl: z.string().url().optional(),
    imageAspectRatio: z.enum(["rectangle", "square"]).optional(),
    imageSize: z.enum(["cover", "contain"]).optional(),
    imageBackgroundColor: z.string().optional(),
    title: z.string().max(40).optional(),
  }),
});

const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  arrayPayloadSchema,
  simpleTextPayloadSchema,
  templatePayloadSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const payload = payloadSchema.parse(json);

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { lineUserId: payload.to },
      update: {},
      create: {
        lineUserId: payload.to,
        displayName: "",
        isFollowing: true,
      },
    });

    // Handle different message types
    if ("type" in payload && payload.type === "template") {
      // Send template message
      await pushMessage(payload.to, {
        type: "template",
        altText: payload.altText,
        template: payload.template,
      });

      // Persist template message
      const msg = await prisma.message.create({
        data: {
          type: "TEMPLATE",
          content: {
            altText: payload.altText,
            template: payload.template,
          },
          direction: "OUTBOUND",
          userId: user.id,
          deliveryStatus: "SENT",
        },
      });

      await realtime().emit("message:outbound", {
        userId: user.id,
        text: `📋 ${payload.altText}`,
        createdAt: msg.createdAt.toISOString(),
      });
    } else {
      // Normalize all formats to messages array
      let messages: Array<
        | { type: "text"; text: string }
        | { type: "sticker"; packageId: string; stickerId: string }
        | { type: "image"; originalContentUrl: string; previewImageUrl?: string }
      >;

      if ("messages" in payload) {
        // Array format: {to, messages}
        messages = payload.messages;
      } else if ("type" in payload && payload.type === "sticker") {
        // Sticker format: {to, type: "sticker", packageId, stickerId}
        messages = [
          {
            type: "sticker",
            packageId: payload.packageId,
            stickerId: payload.stickerId,
          },
        ];
      } else if ("text" in payload) {
        // Simple text format: {to, text}
        messages = [{ type: "text", text: payload.text }];
      } else {
        // Legacy text format: {to, message}
        messages = [{ type: "text", text: payload.message }];
      }

      // Send messages to LINE
      await pushMessage(payload.to, messages as any);

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
        }
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
