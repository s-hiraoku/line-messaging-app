import sharp from 'sharp';
import { cloudinary } from './client';
import type { TemplateArea } from '@/lib/template-image-splitter/types';

export interface TemplateCompositionPlan {
  id: string;
  baseSize: {
    width: number;
    height: number;
  };
  areas: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`画像の取得に失敗しました: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function ensureTemplateCoverage(template: TemplateCompositionPlan, areas: TemplateArea[]): void {
  if (!areas || areas.length === 0) {
    throw new Error('テンプレート画像を合成するには少なくとも1つのエリア画像が必要です');
  }

  if (areas.length !== template.areas.length) {
    throw new Error('テンプレートに定義されたエリア数と一致する画像を設定してください');
  }

  const missingIds = template.areas.filter((definition) => !areas.some((area) => area.id === definition.id));
  if (missingIds.length > 0) {
    throw new Error(`未設定のエリアがあります: ${missingIds.map((area) => area.id).join(', ')}`);
  }

  const emptyImages = areas.filter((area) => !area.imageUrl);
  if (emptyImages.length > 0) {
    throw new Error('各エリアに画像を設定してください');
  }
}

async function buildOverlays(template: TemplateCompositionPlan, areas: TemplateArea[]) {
  return Promise.all(
    template.areas.map(async (definition) => {
      const area = areas.find((candidate) => candidate.id === definition.id)!;
      const imageBuffer = await fetchImageBuffer(area.imageUrl!);
      const resized = await sharp(imageBuffer)
        .resize(definition.width, definition.height, { fit: 'cover' })
        .toBuffer();

      return {
        input: resized,
        left: definition.x,
        top: definition.y,
      } as sharp.OverlayOptions;
    })
  );
}

function buildDataUri(buffer: Buffer): string {
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

export async function composeTemplateImages(
  template: TemplateCompositionPlan,
  areas: TemplateArea[],
  options?: { folder?: string }
): Promise<string> {
  ensureTemplateCoverage(template, areas);

  const overlays = await buildOverlays(template, areas);
  const baseCanvas = sharp({
    create: {
      width: template.baseSize.width,
      height: template.baseSize.height,
      channels: 4,
      background: '#ffffff',
    },
  });

  const composed = await baseCanvas.composite(overlays).png().toBuffer();

  const uploadResult = await cloudinary.uploader.upload(buildDataUri(composed), {
    folder: options?.folder ?? 'template-image-splitter',
    public_id: `template-${template.id}-${Date.now()}`,
    overwrite: true,
  });

  if (!uploadResult.secure_url) {
    throw new Error('Cloudinaryアップロードに失敗しました');
  }

  return uploadResult.secure_url;
}
