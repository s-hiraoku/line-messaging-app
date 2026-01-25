'use client';

import type { TemplateArea, TemplateVariant } from '@/lib/template-image-splitter/types';

interface TemplatePreviewProps {
  template: TemplateVariant;
  areas: TemplateArea[];
  previewUrl: string | null;
  isComposing: boolean;
}

export function TemplatePreview({ template, areas, previewUrl, isComposing }: TemplatePreviewProps) {
  return (
    <div className="space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
        style={{ aspectRatio: `${template.baseSize.width} / ${template.baseSize.height}` }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-side canvas preview image
          <img src={previewUrl} alt="テンプレートプレビュー" className="h-full w-full object-cover" />
        ) : (
          template.areas.map((definition, index) => {
            const area = areas.find((candidate) => candidate.id === definition.id);
            return (
              <div
                key={definition.id}
                className="absolute overflow-hidden rounded-xl bg-[#e8f5e9] shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]"
                style={{
                  left: `${(definition.x / template.baseSize.width) * 100}%`,
                  top: `${(definition.y / template.baseSize.height) * 100}%`,
                  width: `${(definition.width / template.baseSize.width) * 100}%`,
                  height: `${(definition.height / template.baseSize.height) * 100}%`,
                }}
              >
                {area?.imageUrl ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${area.imageUrl})` }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    未設定
                  </div>
                )}
                <span className="absolute left-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-semibold text-gray-700 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]">
                  {index + 1}
                </span>
              </div>
            );
          })
        )}
      </div>
      <p className="text-xs text-gray-600">
        {previewUrl
          ? '最終的な合成結果です。問題がなければこのまま送信できます。'
          : isComposing
            ? 'プレビューを生成しています…'
            : '全エリアが設定されるとここに完成イメージが表示されます。'}
      </p>
    </div>
  );
}
