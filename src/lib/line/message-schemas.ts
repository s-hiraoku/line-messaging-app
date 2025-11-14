import { z } from "zod";

// ============================================================================
// Message Type Schemas
// ============================================================================

export const textMessageSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1),
});

export const stickerMessageSchema = z.object({
  type: z.literal("sticker"),
  packageId: z.string().min(1),
  stickerId: z.string().min(1),
});

export const imageMessageSchema = z.object({
  type: z.literal("image"),
  originalContentUrl: z.string().url(),
  previewImageUrl: z.string().url().optional(),
});

export const videoMessageSchema = z.object({
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

export const audioMessageSchema = z.object({
  type: z.literal("audio"),
  originalContentUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

export const locationMessageSchema = z.object({
  type: z.literal("location"),
  title: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const couponMessageSchema = z.object({
  type: z.literal("coupon"),
  couponId: z.string().min(1),
});

// Note: Template message schema is defined after template schemas below

// ============================================================================
// Imagemap Schemas
// ============================================================================

export const imagemapActionSchema = z.discriminatedUnion("type", [
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

export const imagemapMessageSchema = z.object({
  type: z.literal("imagemap"),
  baseUrl: z.string().url(),
  altText: z.string().min(1).max(400),
  baseSize: z.object({
    width: z.number().min(1).max(2500),
    height: z.number().min(1).max(2500),
  }),
  actions: z.array(imagemapActionSchema).min(1),
});

// ============================================================================
// Template Schemas
// ============================================================================

export const templateActionSchema = z.discriminatedUnion("type", [
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

export const carouselColumnSchema = z.object({
  thumbnailImageUrl: z.string().url().optional(),
  imageBackgroundColor: z.string().optional(),
  title: z.string().max(40).optional(),
  text: z.string().min(1).max(160),
  defaultAction: templateActionSchema.optional(),
  actions: z.array(templateActionSchema).min(1).max(3),
});

export const imageCarouselColumnSchema = z.object({
  imageUrl: z.string().url(),
  action: templateActionSchema,
});

export const buttonsTemplateSchema = z.object({
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

export const confirmTemplateSchema = z.object({
  type: z.literal("confirm"),
  text: z.string().min(1).max(240),
  actions: z.array(templateActionSchema).length(2),
});

export const carouselTemplateSchema = z.object({
  type: z.literal("carousel"),
  columns: z.array(carouselColumnSchema).min(1).max(10),
  imageAspectRatio: z.enum(["rectangle", "square"]).optional(),
  imageSize: z.enum(["cover", "contain"]).optional(),
});

export const imageCarouselTemplateSchema = z.object({
  type: z.literal("image_carousel"),
  columns: z.array(imageCarouselColumnSchema).min(1).max(10),
});

export const templateSchema = z.discriminatedUnion("type", [
  buttonsTemplateSchema,
  confirmTemplateSchema,
  carouselTemplateSchema,
  imageCarouselTemplateSchema,
]);

export const templateMessageSchema = z.object({
  type: z.literal("template"),
  altText: z.string().min(1).max(400),
  template: templateSchema,
});

// ============================================================================
// Combined Message Schema
// ============================================================================

export const anyMessageSchema = z.discriminatedUnion("type", [
  textMessageSchema,
  stickerMessageSchema,
  imageMessageSchema,
  videoMessageSchema,
  audioMessageSchema,
  locationMessageSchema,
  couponMessageSchema,
  imagemapMessageSchema,
  templateMessageSchema,
]);

// ============================================================================
// Payload Schemas (API Request)
// ============================================================================

export const legacyTextPayloadSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1),
  type: z.literal("text").optional(),
});

export const stickerPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("sticker"),
  packageId: z.string().min(1),
  stickerId: z.string().min(1),
});

export const videoPayloadSchema = z.object({
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

export const audioPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("audio"),
  audioUrl: z.string().url(),
  duration: z.number().min(1).max(60000),
});

export const locationPayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("location"),
  title: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const imagemapPayloadSchema = z.object({
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

export const simpleTextPayloadSchema = z.object({
  to: z.string().min(1),
  text: z.string().min(1),
});

export const arrayPayloadSchema = z.object({
  to: z.string().min(1),
  messages: z.array(anyMessageSchema).min(1),
});

export const templatePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("template"),
  altText: z.string().min(1).max(400),
  template: templateSchema,
});

// ============================================================================
// Message Items Schemas (LINE Manager created items)
// ============================================================================
// Note: These map to existing LINE API message types:
// - richMessage → imagemap message (interactive image with tap areas)
// - cardType → flex/template message (carousel cards)

export const richMessagePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("richMessage"),
  baseUrl: z.string().url(),
  altText: z.string().min(1).max(400),
  baseSize: z.object({
    width: z.number().min(1).max(2500),
    height: z.number().min(1).max(2500),
  }),
  actions: z.array(imagemapActionSchema).min(1),
});

// Image area schema for card-type messages with interactive regions
export const imageAreaSchema = z.object({
  id: z.string().min(1),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
  label: z.string().min(1).max(20),
  action: templateActionSchema,
});

export const cardTypePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("cardType"),
  altText: z.string().min(1).max(400),
  template: templateSchema,
  // Optional: Image areas for converting card to imagemap
  imageAreas: z.array(imageAreaSchema).min(1).max(10).optional(),
  imageUrl: z.string().url().optional(),
  imageWidth: z.number().min(1).max(2500).optional(),
  imageHeight: z.number().min(1).max(2500).optional(),
});

export const payloadSchema = z.union([
  legacyTextPayloadSchema,
  stickerPayloadSchema,
  videoPayloadSchema,
  audioPayloadSchema,
  locationPayloadSchema,
  imagemapPayloadSchema,
  arrayPayloadSchema,
  simpleTextPayloadSchema,
  templatePayloadSchema,
  richMessagePayloadSchema,
  cardTypePayloadSchema,
]);

// ============================================================================
// Type Exports
// ============================================================================

export type TextMessage = z.infer<typeof textMessageSchema>;
export type StickerMessage = z.infer<typeof stickerMessageSchema>;
export type ImageMessage = z.infer<typeof imageMessageSchema>;
export type VideoMessage = z.infer<typeof videoMessageSchema>;
export type AudioMessage = z.infer<typeof audioMessageSchema>;
export type LocationMessage = z.infer<typeof locationMessageSchema>;
export type CouponMessage = z.infer<typeof couponMessageSchema>;
export type ImagemapMessage = z.infer<typeof imagemapMessageSchema>;
export type TemplateMessage = z.infer<typeof templateMessageSchema>;
export type AnyMessage = z.infer<typeof anyMessageSchema>;

export type SendMessagePayload = z.infer<typeof payloadSchema>;
