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
      className="relative w-full overflow-hidden border-2 border-black bg-white"
      style={{ aspectRatio: `${variant.baseSize.width} / ${variant.baseSize.height}` }}
    >
      {variant.areas.map((area, index) => (
        <div
          key={area.id}
          className="absolute rounded-sm border border-black/30 bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] text-xs font-semibold text-black/70"
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
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">{group.title}</p>
            <p className="text-sm text-black/70">{group.description}</p>
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
                    'flex h-full flex-col gap-3 border-2 border-black bg-white p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 focus-visible:outline-none',
                    isSelected && 'bg-[#E8F5E9]'
                  )}
                >
                  <TemplatePreviewGraphic variant={variant} />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="border border-black text-xs">
                      {variant.ratioLabel}
                    </Badge>
                    <Badge variant="outline" className="border border-black text-xs">
                      {variant.layout.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border border-black text-xs">
                      {variant.areaCount} エリア
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{variant.name}</p>
                    <p className="text-sm text-black/70">{variant.description}</p>
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
