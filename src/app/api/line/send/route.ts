import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pushMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";

const textMessage = z.object({ type: z.literal("text"), text: z.string().min(1) });
const imageMessage = z.object({
  type: z.literal("image"),
  originalContentUrl: z.string().url(),
  previewImageUrl: z.string().url().optional(),
});

const anyMessage = z.discriminatedUnion("type", [textMessage, imageMessage]);

const payloadSchema = z
  .object({ to: z.string().min(1), text: z.string().min(1) }) // simple text
  .or(
    z.object({
      to: z.string().min(1),
      messages: z.array(anyMessage).min(1),
    })
  );

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.parse(json);

    const to = (parsed as any).to as string;
    const messages = "messages" in parsed ? parsed.messages : [{ type: "text", text: (parsed as any).text }];

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

    // persist each text message
    for (const m of messages as Array<any>) {
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
