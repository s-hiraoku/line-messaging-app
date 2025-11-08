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

const locationPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("location"),
  title: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const payloadSchema = z.union([textPayloadSchema, locationPayloadSchema]);

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
    if ("type" in payload && payload.type === "location") {
      // Send location message
      await pushMessage(payload.to, {
        type: "location",
        title: payload.title,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });

      // Persist location message
      const msg = await prisma.message.create({
        data: {
          type: "LOCATION",
          content: {
            title: payload.title,
            address: payload.address,
            latitude: payload.latitude,
            longitude: payload.longitude,
          },
          direction: "OUTBOUND",
          userId: user.id,
          deliveryStatus: "SENT",
        },
      });

      await realtime().emit("message:outbound", {
        userId: user.id,
        text: `📍 ${payload.title}`,
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
