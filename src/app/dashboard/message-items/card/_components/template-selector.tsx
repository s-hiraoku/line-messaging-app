'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { TemplateDefinition, TemplateVariant } from '@/lib/template-image-splitter/types';

interface TemplateSelectorProps {
  catalog: TemplateDefinition[];
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
}

function TemplatePreviewGraphic({ variant }: { variant: TemplateVariant }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]"
      style={{ aspectRatio: `${variant.baseSize.width} / ${variant.baseSize.height}` }}
    >
      {variant.areas.map((area, index) => (
        <div
          key={area.id}
          className="absolute rounded-lg bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] text-xs font-semibold text-gray-700 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_3px_rgba(255,255,255,0.8)]"
          style={{
            left: `${(area.x / variant.baseSize.width) * 100}%`,
            top: `${(area.y / variant.baseSize.height) * 100}%`,
            width: `${(area.width / variant.baseSize.width) * 100}%`,
            height: `${(area.height / variant.baseSize.height) * 100}%`,
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center drop-shadow-sm">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TemplateSelector({ catalog, selectedTemplateId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-8">
      {catalog.map((group) => (
        <section key={group.id} className="space-y-4">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{group.title}</p>
            <p className="text-sm text-gray-700">{group.description}</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.variants.map((variant) => {
              const isSelected = variant.id === selectedTemplateId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelect(variant.id)}
                  className={cn(
                    'flex h-full flex-col gap-3 rounded-2xl bg-white p-4 text-left shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none',
                    isSelected && 'bg-[#e8f5e9]'
                  )}
                >
                  <TemplatePreviewGraphic variant={variant} />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {variant.ratioLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {variant.layout.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {variant.areaCount} エリア
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{variant.name}</p>
                    <p className="text-sm text-gray-700">{variant.description}</p>
                  </div>
                  {isSelected && (
                    <p className="text-xs font-bold uppercase tracking-wider text-[#00796B]">選択中</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
