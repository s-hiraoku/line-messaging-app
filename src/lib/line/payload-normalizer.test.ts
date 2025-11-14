import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizePayload } from './payload-normalizer';
import * as textOverlay from '../cloudinary/text-overlay';

// Mock Cloudinary text overlay
vi.mock('../cloudinary/text-overlay', () => ({
  overlayTextOnImage: vi.fn(),
  isCloudinaryUrl: vi.fn(),
}));

describe('payload-normalizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cardType with imageAreas', () => {
    const mockCloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const mockComposedUrl = 'https://res.cloudinary.com/demo/image/upload/transformed.jpg';

    beforeEach(() => {
      (textOverlay.isCloudinaryUrl as any).mockReturnValue(true);
      (textOverlay.overlayTextOnImage as any).mockResolvedValue(mockComposedUrl);
    });

    it('converts cardType with imageAreas to imagemap message', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Buy Now',
            action: {
              type: 'uri' as const,
              label: 'Buy Now',
              uri: 'https://example.com/buy',
            },
          },
        ],
        imageUrl: mockCloudinaryUrl,
        imageWidth: 1024,
        imageHeight: 1024,
      };

      const result = await normalizePayload(payload);

      expect(result.isTemplate).toBe(false);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].type).toBe('imagemap');
      expect(result.messageItemType).toBe('cardType');

      // Verify Cloudinary overlay was called
      expect(textOverlay.overlayTextOnImage).toHaveBeenCalledWith(
        mockCloudinaryUrl,
        [
          {
            id: 'area1',
            label: 'Buy Now',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
          },
        ],
        1024,
        1024
      );
    });

    it('converts cardType without imageAreas to template message', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
      };

      const result = await normalizePayload(payload);

      expect(result.isTemplate).toBe(true);
      expect(result.templateData).toBeDefined();
      expect(result.messageItemType).toBe('cardType');

      // Verify Cloudinary overlay was NOT called
      expect(textOverlay.overlayTextOnImage).not.toHaveBeenCalled();
    });

    it('throws error when imageUrl is missing for imageAreas', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Buy Now',
            action: {
              type: 'uri' as const,
              label: 'Buy Now',
              uri: 'https://example.com/buy',
            },
          },
        ],
      };

      await expect(normalizePayload(payload as any)).rejects.toThrow(
        'Image URL is required when using image areas'
      );
    });

    it('throws error when imageUrl is not from Cloudinary', async () => {
      (textOverlay.isCloudinaryUrl as any).mockReturnValue(false);

      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Buy Now',
            action: {
              type: 'uri' as const,
              label: 'Buy Now',
              uri: 'https://example.com/buy',
            },
          },
        ],
        imageUrl: 'https://example.com/image.jpg',
        imageWidth: 1024,
        imageHeight: 1024,
      };

      await expect(normalizePayload(payload)).rejects.toThrow(
        'Image areas are only supported for Cloudinary images'
      );
    });

    it('throws validation error for invalid image areas', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: -10, // Invalid: negative x
            y: 100,
            width: 200,
            height: 150,
            label: 'Buy Now',
            action: {
              type: 'uri' as const,
              label: 'Buy Now',
              uri: 'https://example.com/buy',
            },
          },
        ],
        imageUrl: mockCloudinaryUrl,
        imageWidth: 1024,
        imageHeight: 1024,
      };

      await expect(normalizePayload(payload)).rejects.toThrow('Image area validation failed');
    });

    it('converts multiple imageAreas correctly', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Button 1',
            action: {
              type: 'uri' as const,
              label: 'Button 1',
              uri: 'https://example.com/1',
            },
          },
          {
            id: 'area2',
            x: 400,
            y: 200,
            width: 150,
            height: 100,
            label: 'Button 2',
            action: {
              type: 'message' as const,
              label: 'Button 2',
              text: 'Hello',
            },
          },
        ],
        imageUrl: mockCloudinaryUrl,
        imageWidth: 1024,
        imageHeight: 1024,
      };

      const result = await normalizePayload(payload);

      expect(result.messages[0].type).toBe('imagemap');
      const imagemapMsg = result.messages[0] as any;
      expect(imagemapMsg.actions).toHaveLength(2);
      expect(imagemapMsg.actions[0].type).toBe('uri');
      expect(imagemapMsg.actions[1].type).toBe('message');
    });

    it('uses default dimensions when not provided', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Product Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Buy Now',
            action: {
              type: 'uri' as const,
              label: 'Buy Now',
              uri: 'https://example.com/buy',
            },
          },
        ],
        imageUrl: mockCloudinaryUrl,
        // imageWidth and imageHeight not provided
      };

      const result = await normalizePayload(payload);

      expect(result.messages[0].type).toBe('imagemap');

      // Verify default dimensions (1024x1024) were used
      expect(textOverlay.overlayTextOnImage).toHaveBeenCalledWith(
        mockCloudinaryUrl,
        expect.any(Array),
        1024,
        1024
      );
    });
  });

  describe('legacy payload formats', () => {
    it('normalizes simple text payload', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        text: 'Hello',
      };

      const result = await normalizePayload(payload);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        type: 'text',
        text: 'Hello',
      });
      expect(result.isTemplate).toBe(false);
    });

    it('normalizes sticker payload', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'sticker' as const,
        packageId: '1',
        stickerId: '1',
      };

      const result = await normalizePayload(payload);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        type: 'sticker',
        packageId: '1',
        stickerId: '1',
      });
    });

    it('normalizes richMessage payload', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'richMessage' as const,
        baseUrl: 'https://example.com/image',
        altText: 'Rich Message',
        baseSize: { width: 1024, height: 1024 },
        actions: [
          {
            type: 'uri' as const,
            linkUri: 'https://example.com',
            area: { x: 0, y: 0, width: 100, height: 100 },
          },
        ],
      };

      const result = await normalizePayload(payload);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].type).toBe('imagemap');
      expect(result.messageItemType).toBe('richMessage');
    });
  });
});
