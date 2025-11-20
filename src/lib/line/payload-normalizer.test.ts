import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizePayload } from './payload-normalizer';
import * as templateComposer from '../cloudinary/template-image-composer';

vi.mock('../cloudinary/template-image-composer', () => ({
  composeTemplateImages: vi.fn(),
}));

describe('payload-normalizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cardType with templateAreas', () => {
    const mockComposedUrl = 'https://res.cloudinary.com/demo/image/upload/v1/composed.png';

    beforeEach(() => {
      (templateComposer.composeTemplateImages as any).mockResolvedValue(mockComposedUrl);
    });

    it('converts template areas into an imagemap message', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Template Card',
        templateId: 'split-2-vertical-50-50',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        templateAreas: [
          { id: 'area-1', x: 0, y: 0, width: 600, height: 300, imageUrl: 'https://res.cloudinary.com/demo/image/upload/a.png' },
          { id: 'area-2', x: 0, y: 300, width: 600, height: 300, imageUrl: 'https://res.cloudinary.com/demo/image/upload/b.png' },
        ],
      };

      const result = await normalizePayload(payload);

      expect(result.isTemplate).toBe(false);
      expect(result.messageItemType).toBe('cardType');
      expect(result.messages).toHaveLength(1);
      const message = result.messages[0];
      expect(message.type).toBe('imagemap');
      expect(message.baseSize).toEqual({ width: 600, height: 600 });
      expect(message.actions).toHaveLength(2);

      expect(templateComposer.composeTemplateImages).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'split-2-vertical-50-50',
          baseSize: { width: 600, height: 600 },
        }),
        payload.templateAreas
      );
    });

    it('falls back to template payload when template areas are missing', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Template Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
      };

      const result = await normalizePayload(payload);

      expect(result.isTemplate).toBe(true);
      expect(result.templateData).toBeDefined();
      expect(templateComposer.composeTemplateImages).not.toHaveBeenCalled();
    });

    it('throws when templateId is missing for template areas', async () => {
      const payload = {
        to: 'U1234567890abcdef',
        type: 'cardType' as const,
        altText: 'Template Card',
        template: {
          type: 'carousel' as const,
          columns: [],
        },
        templateAreas: [
          { id: 'area-1', x: 0, y: 0, width: 600, height: 300, imageUrl: 'https://res.cloudinary.com/demo/image/upload/a.png' },
        ],
      };

      await expect(normalizePayload(payload as any)).rejects.toThrow(
        'templateId is required when template areas are provided'
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
