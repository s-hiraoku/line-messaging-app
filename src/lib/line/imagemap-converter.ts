import type { ImagemapMessage } from './message-schemas';
import type { TemplateArea } from '@/lib/template-image-splitter/types';

export interface TemplateImagemapPayload {
  templateId: string;
  composedImageUrl: string;
  baseSize: {
    width: number;
    height: number;
  };
  areas: TemplateArea[];
}

function removeFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\.[^/.]+$/, '');
    return `${urlObj.origin}${pathname}${urlObj.search}${urlObj.hash}`;
  } catch {
    return url.replace(/\.[^/.]+$/, '');
  }
}

export function convertTemplateToImagemap(payload: TemplateImagemapPayload): ImagemapMessage {
  if (!payload.areas || payload.areas.length === 0) {
    throw new Error('テンプレートエリアが設定されていません');
  }

  const actions = payload.areas.map((area, index) => ({
    type: 'message' as const,
    text: `エリア${index + 1}`,
    area: {
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
    },
  }));

  return {
    type: 'imagemap',
    baseUrl: removeFileExtension(payload.composedImageUrl),
    altText: `テンプレート:${payload.templateId}`.slice(0, 400),
    baseSize: payload.baseSize,
    actions,
  };
}
