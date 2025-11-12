import type { SendMessagePayload, AnyMessage } from "./message-schemas";

/**
 * Normalize various payload formats to a standard messages array format
 */
export function normalizePayload(payload: SendMessagePayload): {
  to: string;
  messages: AnyMessage[];
  isTemplate: boolean;
  templateData?: {
    altText: string;
    template: any;
  };
} {
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
