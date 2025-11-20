import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUserId } from "@/lib/auth-helpers";
import { broadcastMessage } from "@/lib/line/client";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  message: z.string().min(1),
  name: z.string().min(1).default("broadcast"),
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await requireAuthenticatedUserId();

    const json = await req.json();
    const { message, name } = schema.parse(json);

    await broadcastMessage(userId, { type: "text", text: message });

    await prisma.broadcast.create({
      data: {
        name,
        content: { type: "text", text: message },
        status: "SENT",
      },
    });

    return NextResponse.json({ status: "sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 });
  }
}
