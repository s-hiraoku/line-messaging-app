import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime/bus";
import type { AnyMessage } from "./message-schemas";

/**
 * Ensure user exists in database
 */
export async function ensureUser(lineUserId: string) {
  return await prisma.user.upsert({
    where: { lineUserId },
    update: {},
    create: {
      lineUserId,
      displayName: "",
      isFollowing: true,
    },
  });
}

/**
 * Persist a text message and emit realtime event
 */
async function persistTextMessage(
  userId: string,
  text: string
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "TEXT",
      content: { text },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a sticker message and emit realtime event
 */
async function persistStickerMessage(
  userId: string,
  packageId: string,
  stickerId: string
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "STICKER",
      content: {
        packageId,
        stickerId,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: undefined,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a video message and emit realtime event
 */
async function persistVideoMessage(
  userId: string,
  videoUrl: string,
  previewUrl: string
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "VIDEO",
      content: {
        videoUrl,
        previewUrl,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: undefined,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist an audio message and emit realtime event
 */
async function persistAudioMessage(
  userId: string,
  audioUrl: string,
  duration: number
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "AUDIO",
      content: {
        audioUrl,
        duration,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: undefined,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a location message and emit realtime event
 */
async function persistLocationMessage(
  userId: string,
  title: string,
  address: string,
  latitude: number,
  longitude: number
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "LOCATION",
      content: {
        title,
        address,
        latitude,
        longitude,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `📍 ${title}`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a coupon message and emit realtime event
 */
async function persistCouponMessage(
  userId: string,
  couponId: string
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "COUPON",
      content: {
        couponId,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `🎫 クーポン (${couponId})`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist an imagemap message and emit realtime event
 */
async function persistImagemapMessage(
  userId: string,
  baseUrl: string,
  altText: string,
  baseSize: { width: number; height: number },
  actions: any[]
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "IMAGEMAP",
      content: {
        baseUrl,
        altText,
        baseSize,
        actions,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `🗺️ ${altText}`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a template message and emit realtime event
 */
export async function persistTemplateMessage(
  userId: string,
  altText: string,
  template: any
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "TEMPLATE",
      content: {
        altText,
        template,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `📋 ${altText}`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a rich message (message item) and emit realtime event
 * Note: Rich messages are sent as imagemap to LINE API but stored as RICH_MESSAGE in DB
 */
export async function persistRichMessage(
  userId: string,
  baseUrl: string,
  altText: string,
  baseSize: { width: number; height: number },
  actions: any[]
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "RICH_MESSAGE",
      content: {
        baseUrl,
        altText,
        baseSize,
        actions,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `🎨 ${altText}`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist a card-type message (message item) and emit realtime event
 * Note: Card-type messages are sent as template to LINE API but stored as CARD_TYPE in DB
 */
export async function persistCardTypeMessage(
  userId: string,
  altText: string,
  template: any
): Promise<void> {
  const msg = await prisma.message.create({
    data: {
      type: "CARD_TYPE",
      content: {
        altText,
        template,
      },
      direction: "OUTBOUND",
      userId,
      deliveryStatus: "SENT",
    },
  });

  await realtime().emit("message:outbound", {
    userId,
    text: `🎴 ${altText}`,
    createdAt: msg.createdAt.toISOString(),
  });
}

/**
 * Persist multiple messages and emit realtime events
 */
export async function persistMessages(
  userId: string,
  messages: AnyMessage[]
): Promise<void> {
  for (const message of messages) {
    switch (message.type) {
      case "text":
        await persistTextMessage(userId, message.text);
        break;

      case "sticker":
        await persistStickerMessage(
          userId,
          message.packageId,
          message.stickerId
        );
        break;

      case "video":
        await persistVideoMessage(
          userId,
          message.originalContentUrl,
          message.previewImageUrl
        );
        break;

      case "audio":
        await persistAudioMessage(
          userId,
          message.originalContentUrl,
          message.duration
        );
        break;

      case "location":
        await persistLocationMessage(
          userId,
          message.title,
          message.address,
          message.latitude,
          message.longitude
        );
        break;

      case "coupon":
        await persistCouponMessage(userId, message.couponId);
        break;

      case "imagemap":
        await persistImagemapMessage(
          userId,
          message.baseUrl,
          message.altText,
          message.baseSize,
          message.actions
        );
        break;

      case "template":
        await persistTemplateMessage(
          userId,
          message.altText,
          message.template
        );
        break;

      default:
        // Ignore unknown message types
        break;
    }
  }
}
