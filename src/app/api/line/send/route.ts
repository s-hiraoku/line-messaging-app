import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { pushMessage } from "@/lib/line/client";
import { payloadSchema } from "@/lib/line/message-schemas";
import { normalizePayload } from "@/lib/line/payload-normalizer";
import {
  ensureUser,
  persistMessages,
  persistTemplateMessage,
} from "@/lib/line/message-persister";

/**
 * POST /api/line/send
 *
 * Send messages to LINE users
 *
 * Supports multiple payload formats:
 * - Legacy text: {to, message}
 * - Simple text: {to, text}
 * - Sticker: {to, type: "sticker", packageId, stickerId}
 * - Video: {to, type: "video", videoUrl, previewUrl}
 * - Audio: {to, type: "audio", audioUrl, duration}
 * - Location: {to, type: "location", title, address, latitude, longitude}
 * - Imagemap: {to, type: "imagemap", baseUrl, altText, baseSize, actions}
 * - Template: {to, type: "template", altText, template}
 * - Array: {to, messages: [{type, ...}]}
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const json = await req.json();
    const payload = payloadSchema.parse(json);

    // 2. Normalize payload to standard format
    const normalized = normalizePayload(payload);

    // 3. Ensure user exists in database
    const user = await ensureUser(normalized.to);

    // 4. Send to LINE and persist to database
    if (normalized.isTemplate && normalized.templateData) {
      // Template message (special case)
      await pushMessage(normalized.to, {
        type: "template",
        altText: normalized.templateData.altText,
        template: normalized.templateData.template,
      });

      await persistTemplateMessage(
        user.id,
        normalized.templateData.altText,
        normalized.templateData.template
      );
    } else {
      // Regular messages
      await pushMessage(normalized.to, normalized.messages);
      await persistMessages(user.id, normalized.messages);
    }

    return NextResponse.json({ status: "sent" });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
