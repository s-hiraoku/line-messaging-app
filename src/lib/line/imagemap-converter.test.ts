import { describe, it, expect } from 'vitest';
import { convertCardToImagemap, validateImageAreas, type ImageArea, type CardWithImageAreas } from './imagemap-converter';

describe('imagemap-converter', () => {
  const mockImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

  const mockImageAreas: ImageArea[] = [
    {
      id: 'area1',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      label: 'Button 1',
      action: {
        type: 'uri',
        label: 'Open Link',
        uri: 'https://example.com',
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
        type: 'message',
        label: 'Send Message',
        text: 'Hello from area 2',
      },
    },
  ];

  describe('validateImageAreas', () => {
    it('returns empty array for valid areas', () => {
      const errors = validateImageAreas(mockImageAreas, 1024, 1024);
      expect(errors).toEqual([]);
    });

    it('returns error for empty areas array', () => {
      const errors = validateImageAreas([], 1024, 1024);
      expect(errors).toContain('At least one image area is required');
    });

    it('returns error for too many areas', () => {
      const tooManyAreas = Array.from({ length: 51 }, (_, i) => ({
        ...mockImageAreas[0],
        id: `area${i}`,
      }));
      const errors = validateImageAreas(tooManyAreas, 1024, 1024);
      expect(errors).toContain('Maximum 50 image areas allowed');
    });

    it('returns error for missing label', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          label: '',
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('Label is required'))).toBe(true);
    });

    it('returns error for label too long', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          label: 'This label is way too long for the 20 character limit',
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('Label must be 20 characters or less'))).toBe(true);
    });

    it('returns error for coordinates out of bounds', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          x: -10,
          y: -5,
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('coordinate out of bounds'))).toBe(true);
    });

    it('returns error for size out of bounds', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          x: 900,
          width: 200, // 900 + 200 > 1024
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('Width out of bounds'))).toBe(true);
    });

    it('returns error for invalid URI action', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          action: {
            type: 'uri',
            label: 'Link',
            uri: 'http://insecure.com', // Not HTTPS
          },
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('URI must start with https://'))).toBe(true);
    });

    it('returns error for empty message text', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          action: {
            type: 'message',
            label: 'Message',
            text: '',
          },
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('Message text is required'))).toBe(true);
    });

    it('returns error for empty postback data', () => {
      const invalidAreas: ImageArea[] = [
        {
          ...mockImageAreas[0],
          action: {
            type: 'postback',
            label: 'Postback',
            data: '',
          },
        },
      ];
      const errors = validateImageAreas(invalidAreas, 1024, 1024);
      expect(errors.some((e) => e.includes('Postback data is required'))).toBe(true);
    });
  });

  describe('convertCardToImagemap', () => {
    const mockCard: CardWithImageAreas = {
      id: 'card1',
      type: 'product',
      imageUrl: mockImageUrl,
      title: 'Product Card',
      imageAreas: mockImageAreas,
    };

    it('converts card to imagemap message', () => {
      const result = convertCardToImagemap(mockCard, mockImageUrl, 1024, 1024);

      expect(result.type).toBe('imagemap');
      expect(result.altText).toBe('Product Card');
      expect(result.baseSize).toEqual({ width: 1024, height: 1024 });
      expect(result.actions).toHaveLength(2);
    });

    it('removes file extension from baseUrl', () => {
      const result = convertCardToImagemap(mockCard, mockImageUrl, 1024, 1024);

      expect(result.baseUrl).not.toContain('.jpg');
      expect(result.baseUrl).toBe('https://res.cloudinary.com/demo/image/upload/sample');
    });

    it('converts URI action correctly', () => {
      const result = convertCardToImagemap(mockCard, mockImageUrl, 1024, 1024);

      const uriAction = result.actions[0];
      expect(uriAction.type).toBe('uri');
      expect((uriAction as any).linkUri).toBe('https://example.com');
      expect(uriAction.area).toEqual({
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
    });

    it('converts Message action correctly', () => {
      const result = convertCardToImagemap(mockCard, mockImageUrl, 1024, 1024);

      const messageAction = result.actions[1];
      expect(messageAction.type).toBe('message');
      expect((messageAction as any).text).toBe('Hello from area 2');
      expect(messageAction.area).toEqual({
        x: 400,
        y: 200,
        width: 150,
        height: 100,
      });
    });

    it('converts Postback action to Message action', () => {
      const cardWithPostback: CardWithImageAreas = {
        ...mockCard,
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Postback Button',
            action: {
              type: 'postback',
              label: 'Buy Now',
              data: 'action=buy&item_id=123',
              displayText: 'Purchased!',
            },
          },
        ],
      };

      const result = convertCardToImagemap(cardWithPostback, mockImageUrl, 1024, 1024);

      expect(result.actions[0].type).toBe('message');
      expect((result.actions[0] as any).text).toBe('Purchased!');
    });

    it('uses data as text when displayText is missing in postback', () => {
      const cardWithPostback: CardWithImageAreas = {
        ...mockCard,
        imageAreas: [
          {
            id: 'area1',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            label: 'Postback Button',
            action: {
              type: 'postback',
              label: 'Buy Now',
              data: 'action=buy&item_id=123',
            },
          },
        ],
      };

      const result = convertCardToImagemap(cardWithPostback, mockImageUrl, 1024, 1024);

      expect((result.actions[0] as any).text).toBe('action=buy&item_id=123');
    });

    it('throws error for empty imageAreas', () => {
      const cardWithoutAreas: CardWithImageAreas = {
        ...mockCard,
        imageAreas: [],
      };

      expect(() => convertCardToImagemap(cardWithoutAreas, mockImageUrl, 1024, 1024)).toThrow(
        'Card must have at least one image area'
      );
    });

    it('throws error for too many imageAreas', () => {
      const cardWithTooManyAreas: CardWithImageAreas = {
        ...mockCard,
        imageAreas: Array.from({ length: 51 }, (_, i) => ({
          ...mockImageAreas[0],
          id: `area${i}`,
        })),
      };

      expect(() => convertCardToImagemap(cardWithTooManyAreas, mockImageUrl, 1024, 1024)).toThrow(
        'Maximum 50 image areas allowed'
      );
    });

    it('throws error for invalid image dimensions', () => {
      expect(() => convertCardToImagemap(mockCard, mockImageUrl, 0, 1024)).toThrow(
        'Image dimensions must be between'
      );

      expect(() => convertCardToImagemap(mockCard, mockImageUrl, 3000, 1024)).toThrow(
        'Image dimensions must be between'
      );
    });

    it('truncates altText to 400 characters', () => {
      const longTitle = 'A'.repeat(500);
      const cardWithLongTitle: CardWithImageAreas = {
        ...mockCard,
        title: longTitle,
      };

      const result = convertCardToImagemap(cardWithLongTitle, mockImageUrl, 1024, 1024);

      expect(result.altText.length).toBe(400);
    });

    it('uses card type as altText fallback when no title', () => {
      const cardWithoutTitle: CardWithImageAreas = {
        ...mockCard,
        title: undefined,
      };

      const result = convertCardToImagemap(cardWithoutTitle, mockImageUrl, 1024, 1024);

      expect(result.altText).toBe('product カードメッセージ');
    });
  });
});
