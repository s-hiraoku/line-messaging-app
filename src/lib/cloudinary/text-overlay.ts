import { cloudinary } from './client';

/**
 * Image area with label for text overlay
 */
export interface ImageAreaForOverlay {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extract Cloudinary public ID from URL
 * @example
 * https://res.cloudinary.com/demo/image/upload/sample.jpg → sample
 * https://res.cloudinary.com/demo/image/upload/v1234/folder/sample.jpg → folder/sample
 */
function extractPublicId(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);

    // Check if this is a Cloudinary URL
    if (!url.hostname.includes('cloudinary.com')) {
      return null;
    }

    // Extract path after /upload/
    const match = url.pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) {
      return null;
    }

    // Remove file extension
    const pathWithoutExt = match[1].replace(/\.[^/.]+$/, '');
    return pathWithoutExt;
  } catch (error) {
    console.error('Failed to parse image URL:', error);
    return null;
  }
}

/**
 * Calculate font size based on area height
 * Ensures text fits within the area
 */
function calculateFontSize(areaHeight: number): number {
  // Use 30-50% of area height for font size
  const baseFontSize = Math.floor(areaHeight * 0.4);

  // Clamp between 16px and 64px
  return Math.max(16, Math.min(64, baseFontSize));
}

/**
 * Calculate label position (center of area)
 */
function calculateLabelPosition(area: ImageAreaForOverlay): { x: number; y: number } {
  return {
    x: area.x + Math.floor(area.width / 2),
    y: area.y + Math.floor(area.height / 2),
  };
}

/**
 * Overlay text labels on image using Cloudinary Transformation API
 *
 * @param imageUrl - Original image URL (must be Cloudinary URL)
 * @param areas - Array of image areas with labels
 * @param imageWidth - Image width in pixels
 * @param imageHeight - Image height in pixels
 * @returns URL of the image with text overlays
 * @throws Error if imageUrl is not a Cloudinary URL or transformation fails
 */
export async function overlayTextOnImage(
  imageUrl: string,
  areas: ImageAreaForOverlay[],
  imageWidth: number,
  imageHeight: number
): Promise<string> {
  // Validate inputs
  if (!imageUrl || !imageUrl.trim()) {
    throw new Error('Image URL is required');
  }

  if (!areas || areas.length === 0) {
    return imageUrl; // No labels to overlay, return original
  }

  // Extract public ID from Cloudinary URL
  const publicId = extractPublicId(imageUrl);
  if (!publicId) {
    throw new Error('Invalid Cloudinary URL. Only Cloudinary images are supported for text overlay.');
  }

  try {
    // Build transformation layers for each text label
    const transformations: any[] = [];

    // Base image size transformation
    transformations.push({
      width: imageWidth,
      height: imageHeight,
      crop: 'fill',
      quality: 'auto:good',
    });

    // Add text overlay for each area
    areas.forEach((area) => {
      if (!area.label || area.label.trim().length === 0) {
        return; // Skip areas without labels
      }

      const labelPos = calculateLabelPosition(area);
      const fontSize = calculateFontSize(area.height);

      // Text overlay transformation
      transformations.push({
        overlay: {
          font_family: 'Noto Sans JP',
          font_size: fontSize,
          font_weight: 'bold',
          text: area.label,
          text_align: 'center',
        },
        color: '#FFFFFF',
        // Semi-transparent black background for readability
        background: 'rgba(0,0,0,0.6)',
        border: '8px_solid_rgb:000000A0',
        gravity: 'north_west',
        x: labelPos.x,
        y: labelPos.y,
        flags: 'text_no_trim',
      });
    });

    // Generate Cloudinary URL with transformations
    const transformedUrl = cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
      type: 'upload',
    });

    return transformedUrl;
  } catch (error) {
    console.error('Failed to overlay text on image:', error);
    throw new Error(`Cloudinary text overlay failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that an image URL is from Cloudinary
 */
export function isCloudinaryUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return url.hostname.includes('cloudinary.com');
  } catch {
    return false;
  }
}
