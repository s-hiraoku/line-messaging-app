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
const videoMessage = z.object({
  type: z.literal("video"),
  originalContentUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Video URL must use HTTPS",
    })
    .refine((url) => url.toLowerCase().endsWith(".mp4"), {
      message: "Video URL must end with .mp4",
    }),
  previewImageUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Preview URL must use HTTPS",
    })
    .refine(
      (url) => {
        const lower = url.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg");
      },
      {
        message: "Preview URL must end with .jpg or .jpeg",
      }
    ),
});
const audioMessage = z.object({
  type: z.literal("audio"),
  originalContentUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});
const locationMessage = z.object({
  type: z.literal("location"),
  title: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
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

const imagemapMessage = z.object({
  type: z.literal("imagemap"),
  baseUrl: z.string().url(),
  altText: z.string().min(1).max(400),
  baseSize: z.object({
    width: z.number().min(1).max(2500),
    height: z.number().min(1).max(2500),
  }),
  actions: z.array(imagemapActionSchema).min(1),
});

const flexMessage = z.object({
  type: z.literal("flex"),
  altText: z.string().min(1).max(400),
  contents: z
    .object({ type: z.enum(["bubble", "carousel"]) })
    .passthrough(), // Flex Message JSON structure - validates type and allows additional properties
});
const couponMessage = z.object({
  type: z.literal("coupon"),
  couponId: z.string().min(1),
});

const anyMessage = z.discriminatedUnion("type", [
  textMessage,
  stickerMessage,
  imageMessage,
  videoMessage,
  audioMessage,
  locationMessage,
  imagemapMessage,
  flexMessage,
  couponMessage,
]);

// Support multiple payload formats:
// 1. Legacy text: {to, message, type?: "text"}
// 2. Legacy sticker: {to, type: "sticker", packageId, stickerId}
// 3. Legacy video: {to, type: "video", videoUrl, previewUrl}
// 4. Legacy audio: {to, type: "audio", audioUrl, duration}
// 5. Location: {to, type: "location", title, address, latitude, longitude}
// 6. Imagemap: {to, type: "imagemap", baseUrl, altText, baseSize, actions}
// 7. Flex: {to, type: "flex", altText, contents}
// 8. Coupon: {to, type: "coupon", couponId}
// 9. Simple text: {to, text}
// 10. Array format: {to, messages: [{type, ...}]}
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

const videoPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("video"),
  videoUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Video URL must use HTTPS",
    })
    .refine((url) => url.toLowerCase().endsWith(".mp4"), {
      message: "Video URL must end with .mp4",
    }),
  previewUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Preview URL must use HTTPS",
    })
    .refine(
      (url) => {
        const lower = url.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg");
      },
      {
        message: "Preview URL must end with .jpg or .jpeg",
      }
    ),
});

const audioPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("audio"),
  audioUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

const locationPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("location"),
  title: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

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

const couponPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("coupon"),
  couponId: z.string().min(1),
});

const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessage).min(1),
});

const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  videoPayloadSchema,
  audioPayloadSchema,
  locationPayloadSchema,
  imagemapPayloadSchema,
  flexPayloadSchema,
  couponPayloadSchema,
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
      | { type: "video"; originalContentUrl: string; previewImageUrl: string }
      | { type: "audio"; originalContentUrl: string; duration: number }
      | {
          type: "location";
          title: string;
          address: string;
          latitude: number;
          longitude: number;
        }
      | {
          type: "imagemap";
          baseUrl: string;
          altText: string;
          baseSize: { width: number; height: number };
          actions: Array<
            | {
                type: "uri";
                linkUri: string;
                area: { x: number; y: number; width: number; height: number };
              }
            | {
                type: "message";
                text: string;
                area: { x: number; y: number; width: number; height: number };
              }
          >;
        }
      | { type: "flex"; altText: string; contents: any }
      | { type: "coupon"; couponId: string }
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
    } else if ("type" in payload && payload.type === "video") {
      // Video format: {to, type: "video", videoUrl, previewUrl}
      to = payload.to;
      messages = [
        {
          type: "video",
          originalContentUrl: payload.videoUrl,
          previewImageUrl: payload.previewUrl,
        },
      ];
    } else if ("type" in payload && payload.type === "audio") {
      // Audio format: {to, type: "audio", audioUrl, duration}
      to = payload.to;
      messages = [
        {
          type: "audio",
          originalContentUrl: payload.audioUrl,
          duration: payload.duration,
        },
      ];
    } else if ("type" in payload && payload.type === "location") {
      // Location format: {to, type: "location", title, address, latitude, longitude}
      to = payload.to;
      messages = [
        {
          type: "location",
          title: payload.title,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      ];
    } else if ("type" in payload && payload.type === "imagemap") {
      // Imagemap format: {to, type: "imagemap", baseUrl, altText, baseSize, actions}
      to = payload.to;
      messages = [
        {
          type: "imagemap",
          baseUrl: payload.baseUrl,
          altText: payload.altText,
          baseSize: payload.baseSize,
          actions: payload.actions,
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
    } else if ("type" in payload && payload.type === "coupon") {
      // Coupon format: {to, type: "coupon", couponId}
      to = payload.to;
      messages = [
        {
          type: "coupon",
          couponId: payload.couponId,
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
      } else if (m.type === "video") {
        const msg = await prisma.message.create({
          data: {
            type: "VIDEO",
            content: {
              videoUrl: m.originalContentUrl,
              previewUrl: m.previewImageUrl,
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
      } else if (m.type === "audio") {
        const msg = await prisma.message.create({
          data: {
            type: "AUDIO",
            content: {
              audioUrl: m.originalContentUrl,
              duration: m.duration,
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
      } else if (m.type === "location") {
        const msg = await prisma.message.create({
          data: {
            type: "LOCATION",
            content: {
              title: m.title,
              address: m.address,
              latitude: m.latitude,
              longitude: m.longitude,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: `📍 ${m.title}`,
          createdAt: msg.createdAt.toISOString(),
        });
      } else if (m.type === "imagemap") {
        const msg = await prisma.message.create({
          data: {
            type: "IMAGEMAP",
            content: {
              baseUrl: m.baseUrl,
              altText: m.altText,
              baseSize: m.baseSize,
              actions: m.actions,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: `🗺️ ${m.altText}`,
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
      } else if (m.type === "coupon") {
        const msg = await prisma.message.create({
          data: {
            type: "COUPON",
            content: {
              couponId: m.couponId,
            },
            direction: "OUTBOUND",
            userId: user.id,
            deliveryStatus: "SENT",
          },
        });
        await realtime().emit("message:outbound", {
          userId: user.id,
          text: `🎫 Coupon: ${m.couponId}`,
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

    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
