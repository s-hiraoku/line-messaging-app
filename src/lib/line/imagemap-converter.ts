import type { ImagemapMessage } from './message-schemas';

/**
 * Card action types (from frontend)
 */
export type CardAction =
  | {
      type: 'uri';
      label: string;
      uri: string;
    }
  | {
      type: 'message';
      label: string;
      text: string;
    }
  | {
      type: 'postback';
      label: string;
      data: string;
      displayText?: string;
    };

/**
 * Image area definition (from frontend)
 */
export interface ImageArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  action: CardAction;
}

/**
 * Card data structure (from frontend)
 */
export interface CardWithImageAreas {
  id: string;
  type: 'product' | 'location' | 'person' | 'image';
  imageUrl: string;
  title?: string;
  imageAreas: ImageArea[];
}

/**
 * Convert card action to LINE Imagemap action
 *
 * Note: Postback actions are not supported by LINE Imagemap API,
 * so they are converted to message actions instead.
 */
function convertActionToImagemapAction(
  action: CardAction,
  area: { x: number; y: number; width: number; height: number }
):
  | {
      type: 'uri';
      linkUri: string;
      area: { x: number; y: number; width: number; height: number };
    }
  | {
      type: 'message';
      text: string;
      area: { x: number; y: number; width: number; height: number };
    } {
  if (action.type === 'uri') {
    return {
      type: 'uri',
      linkUri: action.uri,
      area,
    };
  }

  // Convert both 'message' and 'postback' to message actions
  // (Imagemap doesn't support postback)
  if (action.type === 'message') {
    return {
      type: 'message',
      text: action.text,
      area,
    };
  }

  // Postback → Message conversion
  return {
    type: 'message',
    text: action.displayText || action.data,
    area,
  };
}

/**
 * Remove file extension from URL for LINE Imagemap baseUrl
 * LINE API requires baseUrl without extension
 *
 * @example
 * https://example.com/image.jpg → https://example.com/image
 */
function removeFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\.[^/.]+$/, '');
    return `${urlObj.origin}${pathname}${urlObj.search}${urlObj.hash}`;
  } catch {
    // If URL parsing fails, fallback to simple regex
    return url.replace(/\.[^/.]+$/, '');
  }
}

/**
 * Convert card with image areas to LINE Imagemap message
 *
 * @param card - Card data with imageAreas
 * @param composedImageUrl - Image URL after text overlay (from Cloudinary)
 * @param imageWidth - Image width in pixels
 * @param imageHeight - Image height in pixels
 * @returns LINE Imagemap message
 * @throws Error if validation fails
 */
export function convertCardToImagemap(
  card: CardWithImageAreas,
  composedImageUrl: string,
  imageWidth: number,
  imageHeight: number
): ImagemapMessage {
  // Validate inputs
  if (!card.imageAreas || card.imageAreas.length === 0) {
    throw new Error('Card must have at least one image area');
  }

  if (card.imageAreas.length > 50) {
    throw new Error('Maximum 50 image areas allowed (LINE API limitation)');
  }

  if (imageWidth < 1 || imageWidth > 2500 || imageHeight < 1 || imageHeight > 2500) {
    throw new Error('Image dimensions must be between 1x1 and 2500x2500 pixels');
  }

  // Convert actions
  const actions = card.imageAreas.map((area) =>
    convertActionToImagemapAction(area.action, {
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
    })
  );

  // Generate altText (fallback to card type if no title)
  const altText = card.title || `${card.type} カードメッセージ`;

  // Build Imagemap message
  const imagemapMessage: ImagemapMessage = {
    type: 'imagemap',
    baseUrl: removeFileExtension(composedImageUrl),
    altText: altText.substring(0, 400), // LINE API limit
    baseSize: {
      width: imageWidth,
      height: imageHeight,
    },
    actions,
  };

  return imagemapMessage;
}

/**
 * Validate image areas before conversion
 * Returns validation errors if any
 */
export function validateImageAreas(
  areas: ImageArea[],
  imageWidth: number,
  imageHeight: number
): string[] {
  const errors: string[] = [];

  if (!areas || areas.length === 0) {
    errors.push('At least one image area is required');
    return errors;
  }

  if (areas.length > 50) {
    errors.push('Maximum 50 image areas allowed');
  }

  areas.forEach((area, index) => {
    // Label validation
    if (!area.label || area.label.trim().length === 0) {
      errors.push(`Area ${index + 1}: Label is required`);
    }

    if (area.label && area.label.length > 20) {
      errors.push(`Area ${index + 1}: Label must be 20 characters or less`);
    }

    // Position validation
    if (area.x < 0 || area.x >= imageWidth) {
      errors.push(`Area ${index + 1}: X coordinate out of bounds`);
    }

    if (area.y < 0 || area.y >= imageHeight) {
      errors.push(`Area ${index + 1}: Y coordinate out of bounds`);
    }

    // Size validation
    if (area.width < 1 || area.x + area.width > imageWidth) {
      errors.push(`Area ${index + 1}: Width out of bounds`);
    }

    if (area.height < 1 || area.y + area.height > imageHeight) {
      errors.push(`Area ${index + 1}: Height out of bounds`);
    }

    // Action validation
    if (!area.action) {
      errors.push(`Area ${index + 1}: Action is required`);
    } else {
      if (area.action.type === 'uri' && (!area.action.uri || !area.action.uri.startsWith('https://'))) {
        errors.push(`Area ${index + 1}: URI must start with https://`);
      }

      if (area.action.type === 'message' && (!area.action.text || area.action.text.trim().length === 0)) {
        errors.push(`Area ${index + 1}: Message text is required`);
      }

      if (area.action.type === 'postback' && (!area.action.data || area.action.data.trim().length === 0)) {
        errors.push(`Area ${index + 1}: Postback data is required`);
      }
    }
  });

  return errors;
}
