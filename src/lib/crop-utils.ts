/**
 * Image Cropping Utilities
 *
 * Provides helper functions for cropping images using Canvas API.
 * Used by ImageCropUploader component to process images client-side
 * before uploading to Cloudinary.
 */

/**
 * Area interface from react-easy-crop
 * Represents a rectangular area in pixels
 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates an HTMLImageElement from a URL
 *
 * @param url - Image URL (data URL or HTTP URL)
 * @returns Promise that resolves to loaded HTMLImageElement
 * @throws Error if image fails to load
 *
 * @example
 * ```typescript
 * const img = await createImage('data:image/jpeg;base64,...');
 * console.log(img.width, img.height);
 * ```
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) =>
      reject(new Error(`画像の読み込みに失敗しました: ${error}`))
    );
    image.src = url;
  });
}

/**
 * Crops an image using Canvas API and returns a Blob
 *
 * @param imageSrc - Source image URL (data URL or HTTP URL)
 * @param pixelCrop - Crop area in pixels (from react-easy-crop)
 * @param outputFormat - Output image format (default: 'image/jpeg')
 * @returns Promise that resolves to cropped image Blob
 * @throws Error if cropping fails
 *
 * @example
 * ```typescript
 * const blob = await getCroppedImg(
 *   'data:image/jpeg;base64,...',
 *   { x: 100, y: 100, width: 500, height: 500 },
 *   'image/jpeg'
 * );
 * // Upload blob to server
 * const formData = new FormData();
 * formData.set('file', blob, 'cropped-image.jpg');
 * ```
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  try {
    // Load image
    const image = await createImage(imageSrc);

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context を取得できませんでした');
    }

    // Set canvas size to crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw cropped image onto canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert canvas to Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob 変換に失敗しました'));
          }
        },
        outputFormat,
        outputFormat === 'image/jpeg' ? 0.95 : undefined // JPEG quality: 95%
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    throw new Error(`画像の切り取りに失敗しました。別の画像を選択してください。(${message})`);
  }
}
