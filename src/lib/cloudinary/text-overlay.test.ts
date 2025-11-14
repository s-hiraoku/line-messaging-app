import { describe, it, expect, vi, beforeEach } from 'vitest';
import { overlayTextOnImage, isCloudinaryUrl, type ImageAreaForOverlay } from './text-overlay';
import { cloudinary } from './client';

// Mock cloudinary client
vi.mock('./client', () => ({
  cloudinary: {
    url: vi.fn(),
  },
}));

describe('text-overlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isCloudinaryUrl', () => {
    it('returns true for valid Cloudinary URLs', () => {
      expect(isCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe(true);
      expect(isCloudinaryUrl('https://res.cloudinary.com/mycloud/image/upload/v1234/folder/image.png')).toBe(true);
    });

    it('returns false for non-Cloudinary URLs', () => {
      expect(isCloudinaryUrl('https://example.com/image.jpg')).toBe(false);
      expect(isCloudinaryUrl('https://imgur.com/abc.png')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(isCloudinaryUrl('not-a-url')).toBe(false);
      expect(isCloudinaryUrl('')).toBe(false);
    });
  });

  describe('overlayTextOnImage', () => {
    const mockImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const mockAreas: ImageAreaForOverlay[] = [
      {
        id: 'area1',
        label: 'Label 1',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      },
      {
        id: 'area2',
        label: 'Label 2',
        x: 400,
        y: 300,
        width: 150,
        height: 80,
      },
    ];

    beforeEach(() => {
      (cloudinary.url as any).mockReturnValue('https://res.cloudinary.com/demo/image/upload/transformed.jpg');
    });

    it('returns original URL when no areas provided', async () => {
      const result = await overlayTextOnImage(mockImageUrl, [], 1024, 1024);
      expect(result).toBe(mockImageUrl);
      expect(cloudinary.url).not.toHaveBeenCalled();
    });

    it('throws error for empty image URL', async () => {
      await expect(overlayTextOnImage('', mockAreas, 1024, 1024)).rejects.toThrow('Image URL is required');
    });

    it('throws error for non-Cloudinary URL', async () => {
      const nonCloudinaryUrl = 'https://example.com/image.jpg';
      await expect(overlayTextOnImage(nonCloudinaryUrl, mockAreas, 1024, 1024)).rejects.toThrow(
        'Invalid Cloudinary URL'
      );
    });

    it('overlays text on image with correct transformations', async () => {
      const result = await overlayTextOnImage(mockImageUrl, mockAreas, 1024, 1024);

      expect(result).toBe('https://res.cloudinary.com/demo/image/upload/transformed.jpg');
      expect(cloudinary.url).toHaveBeenCalledWith(
        'sample',
        expect.objectContaining({
          transformation: expect.arrayContaining([
            expect.objectContaining({
              width: 1024,
              height: 1024,
            }),
            expect.objectContaining({
              overlay: expect.objectContaining({
                text: 'Label 1',
                font_family: 'Noto Sans JP',
              }),
            }),
            expect.objectContaining({
              overlay: expect.objectContaining({
                text: 'Label 2',
                font_family: 'Noto Sans JP',
              }),
            }),
          ]),
          secure: true,
          type: 'upload',
        })
      );
    });

    it('skips areas without labels', async () => {
      const areasWithEmpty: ImageAreaForOverlay[] = [
        {
          id: 'area1',
          label: 'Label 1',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
        },
        {
          id: 'area2',
          label: '', // Empty label
          x: 400,
          y: 300,
          width: 150,
          height: 80,
        },
      ];

      await overlayTextOnImage(mockImageUrl, areasWithEmpty, 1024, 1024);

      const transformations = (cloudinary.url as any).mock.calls[0][1].transformation;
      // Should have base transform + only 1 text overlay (not 2)
      expect(transformations).toHaveLength(2);
    });

    it('handles Cloudinary URL with version and folder', async () => {
      const urlWithVersion = 'https://res.cloudinary.com/demo/image/upload/v1234/folder/subfolder/sample.jpg';
      await overlayTextOnImage(urlWithVersion, mockAreas, 1024, 1024);

      expect(cloudinary.url).toHaveBeenCalledWith(
        'folder/subfolder/sample',
        expect.any(Object)
      );
    });

    it('calculates appropriate font size based on area height', async () => {
      const smallArea: ImageAreaForOverlay[] = [
        {
          id: 'small',
          label: 'Small',
          x: 0,
          y: 0,
          width: 100,
          height: 50, // Small height
        },
      ];

      await overlayTextOnImage(mockImageUrl, smallArea, 1024, 1024);

      const transformations = (cloudinary.url as any).mock.calls[0][1].transformation;
      const textOverlay = transformations[1];

      // Font size should be calculated from area height (40% of 50 = 20)
      expect(textOverlay.overlay.font_size).toBeGreaterThanOrEqual(16);
      expect(textOverlay.overlay.font_size).toBeLessThanOrEqual(64);
    });
  });
});
