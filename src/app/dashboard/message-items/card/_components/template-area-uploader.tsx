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
          <p className="text-sm font-semibold text-gray-800">{activeDefinition.label}</p>
          <p className="text-xs text-gray-600">{progressText}</p>
        </div>
        <Badge variant={activeAreaData?.imageUrl ? 'secondary' : 'outline'} className="text-xs">
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
                  'flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left text-sm shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5',
                  isActive && 'bg-[#e8f5e9]'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gray-700 font-mono text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{definition.label}</span>
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {item?.imageUrl ? '完了' : '未設定'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-[#e8f5e9] p-4 transition-all duration-300">
            <p className="mb-2 text-sm font-semibold text-gray-800">画像をアップロード</p>
            <p className="mb-4 text-xs text-gray-600">
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-800">現在のプレビュー</p>
              <div className="flex items-center gap-4">
                <div className="relative h-40 w-40 overflow-hidden rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
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
                    className="rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
                    onClick={() => onImageRemoved(activeDefinition.id)}
                  >
                    この画像を削除
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600">画像をアップロードするとプレビューが表示されます。</p>
          )}
        </div>
      </div>
    </div>
  );
}
