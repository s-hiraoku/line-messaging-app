import type { SendMessagePayload, AnyMessage } from "./message-schemas";
import { overlayTextOnImage, isCloudinaryUrl, type ImageAreaForOverlay } from "../cloudinary/text-overlay";
import { convertCardToImagemap, validateImageAreas, type ImageArea, type CardWithImageAreas } from "./imagemap-converter";

/**
 * Normalize various payload formats to a standard messages array format
 */
export async function normalizePayload(payload: SendMessagePayload): Promise<{
  to: string;
  messages: AnyMessage[];
  isTemplate: boolean;
  templateData?: {
    altText: string;
    template: any;
  };
  messageItemType?: "richMessage" | "cardType";
}> {
  const to = payload.to;

  // Template message (special case)
  if ("type" in payload && payload.type === "template") {
    return {
      to,
      messages: [],
      isTemplate: true,
      templateData: {
        altText: payload.altText,
        template: payload.template,
      },
    };
  }

  // Array format: {to, messages}
  if ("messages" in payload) {
    return {
      to,
      messages: payload.messages,
      isTemplate: false,
    };
  }

  // Sticker format: {to, type: "sticker", packageId, stickerId}
  if ("type" in payload && payload.type === "sticker") {
    return {
      to,
      messages: [
        {
          type: "sticker",
          packageId: payload.packageId,
          stickerId: payload.stickerId,
        },
      ],
      isTemplate: false,
    };
  }

  // Video format: {to, type: "video", videoUrl, previewUrl}
  if ("type" in payload && payload.type === "video") {
    return {
      to,
      messages: [
        {
          type: "video",
          originalContentUrl: payload.videoUrl,
          previewImageUrl: payload.previewUrl,
        },
      ],
      isTemplate: false,
    };
  }

  // Audio format: {to, type: "audio", audioUrl, duration}
  if ("type" in payload && payload.type === "audio") {
    return {
      to,
      messages: [
        {
          type: "audio",
          originalContentUrl: payload.audioUrl,
          duration: payload.duration,
        },
      ],
      isTemplate: false,
    };
  }

  // Location format: {to, type: "location", ...}
  if ("type" in payload && payload.type === "location") {
    return {
      to,
      messages: [
        {
          type: "location",
          title: payload.title,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      ],
      isTemplate: false,
    };
  }

  // Imagemap format: {to, type: "imagemap", ...}
  if ("type" in payload && payload.type === "imagemap") {
    return {
      to,
      messages: [
        {
          type: "imagemap",
          baseUrl: payload.baseUrl,
          altText: payload.altText,
          baseSize: payload.baseSize,
          actions: payload.actions,
        },
      ],
      isTemplate: false,
    };
  }

  // Rich Message format: {to, type: "richMessage", ...}
  // Note: Rich messages are stored as RICH_MESSAGE in DB but sent as imagemap to LINE API
  if ("type" in payload && payload.type === "richMessage") {
    return {
      to,
      messages: [
        {
          type: "imagemap",
          baseUrl: payload.baseUrl,
          altText: payload.altText,
          baseSize: payload.baseSize,
          actions: payload.actions,
        },
      ],
      isTemplate: false,
      messageItemType: "richMessage" as const,
    };
  }

  // Card-Type Message format: {to, type: "cardType", ...}
  // Note: Card-type messages are stored as CARD_TYPE in DB but sent as template to LINE API
  // If imageAreas are provided, convert to imagemap message instead
  if ("type" in payload && payload.type === "cardType") {
    // Check if imageAreas are provided (new image area editor feature)
    if (payload.imageAreas && payload.imageAreas.length > 0) {
      // Validate image URL is from Cloudinary
      if (!payload.imageUrl) {
        throw new Error("Image URL is required when using image areas");
      }

      if (!isCloudinaryUrl(payload.imageUrl)) {
        throw new Error("Image areas are only supported for Cloudinary images");
      }

      // Validate image areas
      const imageWidth = payload.imageWidth || 1024;
      const imageHeight = payload.imageHeight || 1024;
      const validationErrors = validateImageAreas(payload.imageAreas as ImageArea[], imageWidth, imageHeight);

      if (validationErrors.length > 0) {
        throw new Error(`Image area validation failed: ${validationErrors.join(", ")}`);
      }

      // Convert imageAreas to overlay format
      const overlayAreas: ImageAreaForOverlay[] = payload.imageAreas.map((area) => ({
        id: area.id,
        label: area.label,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
      }));

      // Overlay text labels on image using Cloudinary
      const composedImageUrl = await overlayTextOnImage(
        payload.imageUrl,
        overlayAreas,
        imageWidth,
        imageHeight
      );

      // Convert card to imagemap message
      const cardData: CardWithImageAreas = {
        id: "card-" + Date.now(),
        type: "image", // Generic type for imagemap
        imageUrl: payload.imageUrl,
        title: payload.altText,
        imageAreas: payload.imageAreas as ImageArea[],
      };

      const imagemapMessage = convertCardToImagemap(
        cardData,
        composedImageUrl,
        imageWidth,
        imageHeight
      );

      return {
        to,
        messages: [imagemapMessage],
        isTemplate: false,
        messageItemType: "cardType" as const,
      };
    }

    // Traditional card (no imageAreas) - return as template
    return {
      to,
      messages: [],
      isTemplate: true,
      templateData: {
        altText: payload.altText,
        template: payload.template,
      },
      messageItemType: "cardType" as const,
    };
  }

  // Simple text format: {to, text}
  if ("text" in payload) {
    return {
      to,
      messages: [{ type: "text", text: payload.text }],
      isTemplate: false,
    };
  }

  // Legacy text format: {to, message}
  if ("message" in payload) {
    return {
      to,
      messages: [{ type: "text", text: payload.message }],
      isTemplate: false,
    };
  }

  // Fallback (should not reach here)
  return {
    to,
    messages: [{ type: "text", text: "" }],
    isTemplate: false,
  };
}
