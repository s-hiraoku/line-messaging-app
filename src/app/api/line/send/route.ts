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

const anyMessage = z.discriminatedUnion("type", [
  textMessage,
  stickerMessage,
  imageMessage,
  videoMessage,
  audioMessage,
  locationMessage,
  imagemapMessage,
]);

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
  z.object({
    type: z.literal("datetimepicker"),
    label: z.string().min(1).max(20),
    data: z.string().min(1).max(300),
    mode: z.enum(["date", "time", "datetime"]),
    initial: z.string().optional(),
    max: z.string().optional(),
    min: z.string().optional(),
  }),
  z.object({
    type: z.literal("camera"),
    label: z.string().min(1).max(20),
  }),
  z.object({
    type: z.literal("cameraRoll"),
    label: z.string().min(1).max(20),
  }),
  z.object({
    type: z.literal("location"),
    label: z.string().min(1).max(20),
  }),
]);

// Template column for carousel
const carouselColumnSchema = z.object({
  thumbnailImageUrl: z.string().url().optional(),
  imageBackgroundColor: z.string().optional(),
  title: z.string().max(40).optional(),
  text: z.string().min(1).max(160),
  defaultAction: templateActionSchema.optional(),
  actions: z.array(templateActionSchema).min(1).max(3),
});

// Template column for image carousel
const imageCarouselColumnSchema = z.object({
  imageUrl: z.string().url(),
  action: templateActionSchema,
});

// Template schemas for each type
const buttonsTemplateSchema = z.object({
  type: z.literal("buttons"),
  text: z.string().min(1).max(160),
  actions: z.array(templateActionSchema).min(1).max(4),
  thumbnailImageUrl: z.string().url().optional(),
  imageAspectRatio: z.enum(["rectangle", "square"]).optional(),
  imageSize: z.enum(["cover", "contain"]).optional(),
  imageBackgroundColor: z.string().optional(),
  title: z.string().max(40).optional(),
  defaultAction: templateActionSchema.optional(),
});

const confirmTemplateSchema = z.object({
  type: z.literal("confirm"),
  text: z.string().min(1).max(240),
  actions: z.array(templateActionSchema).length(2),
});

const carouselTemplateSchema = z.object({
  type: z.literal("carousel"),
  columns: z.array(carouselColumnSchema).min(1).max(10),
  imageAspectRatio: z.enum(["rectangle", "square"]).optional(),
  imageSize: z.enum(["cover", "contain"]).optional(),
});

const imageCarouselTemplateSchema = z.object({
  type: z.literal("image_carousel"),
  columns: z.array(imageCarouselColumnSchema).min(1).max(10),
});

const templateSchema = z.discriminatedUnion("type", [
  buttonsTemplateSchema,
  confirmTemplateSchema,
  carouselTemplateSchema,
  imageCarouselTemplateSchema,
]);

// Support multiple payload formats:
// 1. Legacy text: {to, message, type?: "text"}
// 2. Legacy sticker: {to, type: "sticker", packageId, stickerId}
// 3. Legacy video: {to, type: "video", videoUrl, previewUrl}
// 4. Legacy audio: {to, type: "audio", audioUrl, duration}
// 5. Location: {to, type: "location", title, address, latitude, longitude}
// 6. Imagemap: {to, type: "imagemap", baseUrl, altText, baseSize, actions}
// 7. Simple text: {to, text}
// 8. Array format: {to, messages: [{type, ...}]}
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

const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessage).min(1),
});

const templatePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("template"),
  altText: z.string().min(1).max(400),
  template: templateSchema,
});

const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  videoPayloadSchema,
  audioPayloadSchema,
  locationPayloadSchema,
  imagemapPayloadSchema,
  arrayPayloadSchema,
  simpleTextPayloadSchema,
  templatePayloadSchema,
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
    } else if ("text" in payload) {
      // Simple text format: {to, text}
      to = payload.to;
      messages = [{ type: "text", text: payload.text }];
    } else if ("message" in payload) {
      // Legacy text format: {to, message}
      to = payload.to;
      messages = [{ type: "text", text: payload.message }];
    } else {
      // Fallback - should not reach here
      to = payload.to;
      messages = [{ type: "text", text: "" }];
    }

    // Send messages to LINE
    await pushMessage(to, messages as any);

    // Persist outbound message and ensure user exists
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
      } else if ("message" in payload) {
        // Legacy text format: {to, message}
        messages = [{ type: "text", text: payload.message }];
      } else {
        // Fallback - should not reach here
        messages = [{ type: "text", text: "" }];
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
