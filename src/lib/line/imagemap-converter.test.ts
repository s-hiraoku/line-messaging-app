import { describe, it, expect } from 'vitest';
import { convertTemplateToImagemap } from './imagemap-converter';

const basePayload = {
  templateId: 'split-2-vertical-50-50',
  composedImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/composed.png',
  baseSize: { width: 1024, height: 1024 },
  areas: [
    { id: 'area-1', x: 0, y: 0, width: 1024, height: 512, imageUrl: 'https://res.cloudinary.com/demo/image/upload/a.png' },
    { id: 'area-2', x: 0, y: 512, width: 1024, height: 512, imageUrl: 'https://res.cloudinary.com/demo/image/upload/b.png' },
  ],
};

describe('convertTemplateToImagemap', () => {
  it('creates imagemap message with message actions', () => {
    const result = convertTemplateToImagemap(basePayload);

    expect(result.type).toBe('imagemap');
    expect(result.baseSize).toEqual({ width: 1024, height: 1024 });
    expect(result.actions).toHaveLength(2);
    expect(result.actions[0].type).toBe('message');
    expect(result.actions[0].area).toEqual({ x: 0, y: 0, width: 1024, height: 512 });
    expect(result.actions[1].area).toEqual({ x: 0, y: 512, width: 1024, height: 512 });
  });

  it('removes file extension from composed image url for baseUrl', () => {
    const result = convertTemplateToImagemap({
      ...basePayload,
      composedImageUrl: 'https://example.com/path/image.jpg?foo=1',
    });

    expect(result.baseUrl).toBe('https://example.com/path/image?foo=1');
  });

  it('throws when template areas are empty', () => {
    expect(() => convertTemplateToImagemap({
      ...basePayload,
      areas: [],
    })).toThrow('テンプレートエリアが設定されていません');
  });
});
