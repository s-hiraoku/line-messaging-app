import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pushMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";

const payloadSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { to, message } = payloadSchema.parse(json);

    await pushMessage(to, { type: "text", text: message });

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
