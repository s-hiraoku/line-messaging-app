'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { ImageCropUploader } from '@/app/dashboard/_components/image-crop-uploader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TemplateArea, TemplateVariant } from '@/lib/template-image-splitter/types';

interface TemplateAreaUploaderProps {
  template: TemplateVariant;
  areas: TemplateArea[];
  activeAreaId: string;
  onActiveAreaChange: (areaId: string) => void;
  onImageUploaded: (areaId: string, imageUrl: string) => void;
  onImageRemoved: (areaId: string) => void;
}

export function TemplateAreaUploader({
  template,
  areas,
  activeAreaId,
  onActiveAreaChange,
  onImageUploaded,
  onImageRemoved,
}: TemplateAreaUploaderProps) {
  const activeDefinition = template.areas.find((area) => area.id === activeAreaId) ?? template.areas[0];
  const activeAreaData = areas.find((area) => area.id === activeDefinition?.id);
  const completedCount = areas.filter((area) => !!area.imageUrl).length;
  const progressText = `${completedCount}/${template.areaCount} エリア完了`;

  const aspectRatio = useMemo(() => {
    if (!activeDefinition) return undefined;
    return Number((activeDefinition.width / activeDefinition.height).toFixed(2));
  }, [activeDefinition]);

  if (!activeDefinition) {
    return null;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-black">{activeDefinition.label}</p>
          <p className="text-xs text-black/60">{progressText}</p>
        </div>
        <Badge variant={activeAreaData?.imageUrl ? 'secondary' : 'outline'} className="border border-black text-xs">
          {activeAreaData?.imageUrl ? '画像設定済み' : '未設定'}
        </Badge>
      </header>
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <div className="space-y-3">
          {template.areas.map((definition, index) => {
            const item = areas.find((area) => area.id === definition.id);
            const isActive = definition.id === activeDefinition.id;
            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => onActiveAreaChange(definition.id)}
                className={cn(
                  'flex w-full items-center justify-between border-2 border-black bg-white px-3 py-2 text-left text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                  isActive && 'bg-[#E0F7FA]'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center border border-black bg-black/90 font-mono text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="text-black">{definition.label}</span>
                </span>
                <span className="text-xs font-semibold text-black/60">
                  {item?.imageUrl ? '完了' : '未設定'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          <div className="rounded border-2 border-dashed border-black bg-[#FFFEF5] p-4">
            <p className="mb-2 text-sm font-semibold text-black">画像をアップロード</p>
            <p className="mb-4 text-xs text-black/60">
              推奨: {activeDefinition.width}×{activeDefinition.height}px（アスペクト比 {aspectRatio ?? '自由'}）
            </p>
            <ImageCropUploader
              key={activeDefinition.id}
              onImageUploaded={(url) => onImageUploaded(activeDefinition.id, url)}
              allowAspectRatioChange={false}
              defaultAspectRatio={aspectRatio}
              placeholder={`${activeDefinition.label} 用の画像をアップロード`}
            />
          </div>
          {activeAreaData?.imageUrl ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-black">現在のプレビュー</p>
              <div className="flex items-center gap-4">
                <div className="relative h-40 w-40 overflow-hidden border-2 border-black">
                  <Image
                    src={activeAreaData.imageUrl}
                    alt={`${activeDefinition.label} プレビュー`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="border-2 border-black"
                    onClick={() => onImageRemoved(activeDefinition.id)}
                  >
                    この画像を削除
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-black/60">画像をアップロードするとプレビューが表示されます。</p>
          )}
        </div>
      </div>
    </div>
  );
}
