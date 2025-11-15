'use client';

import type { TemplateArea, TemplateVariant } from '@/lib/template-image-splitter/types';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function composeTemplatePreviewDataUrl(
  template: TemplateVariant,
  areas: TemplateArea[]
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = template.baseSize.width;
  canvas.height = template.baseSize.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context を取得できませんでした');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const definition of template.areas) {
    const area = areas.find((candidate) => candidate.id === definition.id);
    if (!area?.imageUrl) continue;

    const image = await loadImage(area.imageUrl);
    const scale = Math.max(definition.width / image.width, definition.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = definition.x + (definition.width - drawWidth) / 2;
    const offsetY = definition.y + (definition.height - drawHeight) / 2;

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  return canvas.toDataURL('image/png');
}
