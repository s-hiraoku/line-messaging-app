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

const payloadSchema = z.union([textPayloadSchema, templatePayloadSchema]);

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
      // Send text message (legacy support)
      const message = "message" in payload ? payload.message : "";
      await pushMessage(payload.to, { type: "text", text: message });

      // Persist text message
      const msg = await prisma.message.create({
        data: {
          type: "TEXT",
          content: { text: message },
          direction: "OUTBOUND",
          userId: user.id,
          deliveryStatus: "SENT",
        },
      });

      await realtime().emit("message:outbound", {
        userId: user.id,
        text: message,
        createdAt: msg.createdAt.toISOString(),
      });
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
