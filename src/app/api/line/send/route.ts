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

const imagemapActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uri"),
    linkUri: z.string().url(),
    area: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(1),
      height: z.number().min(1),
    }),
  }),
  z.object({
    type: z.literal("message"),
    text: z.string().min(1),
    area: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(1),
      height: z.number().min(1),
    }),
  }),
]);

const imagemapPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("imagemap"),
  baseUrl: z.string().url(),
  altText: z.string().min(1).max(400),
  baseSize: z.object({
    width: z.number().min(1).max(2500),
    height: z.number().min(1).max(2500),
  }),
  actions: z.array(imagemapActionSchema).min(1),
});

const payloadSchema = z.union([textPayloadSchema, imagemapPayloadSchema]);

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
    if ("type" in payload && payload.type === "imagemap") {
      // Send imagemap message
      await pushMessage(payload.to, {
        type: "imagemap",
        baseUrl: payload.baseUrl,
        altText: payload.altText,
        baseSize: payload.baseSize,
        actions: payload.actions,
      });

      // Persist imagemap message
      const msg = await prisma.message.create({
        data: {
          type: "IMAGE",
          content: {
            baseUrl: payload.baseUrl,
            altText: payload.altText,
            baseSize: payload.baseSize,
            actions: payload.actions,
          },
          direction: "OUTBOUND",
          userId: user.id,
          deliveryStatus: "SENT",
        },
      });

      await realtime().emit("message:outbound", {
        userId: user.id,
        text: `🗺️ ${payload.altText}`,
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
