"use client";

import { Plus } from "lucide-react";
import type { ImagemapArea } from "./editor";
import { ImagemapAreaItem } from "./imagemap-area-item";

interface ImagemapAreaListProps {
  areas: ImagemapArea[];
  selectedAreaIndex: number | null;
  onSelectArea: (index: number) => void;
  onDeleteArea: (index: number) => void;
  onUpdateArea: (index: number, updates: Partial<ImagemapArea>) => void;
}

export function ImagemapAreaList({
  areas,
  selectedAreaIndex,
  onSelectArea,
  onDeleteArea,
  onUpdateArea,
}: ImagemapAreaListProps) {
  if (areas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-600 bg-slate-900/40 p-8 text-center">
        <Plus className="mx-auto h-8 w-8 text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">
          画像上をドラッグしてタップ領域を作成
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {areas.map((area, index) => (
        <ImagemapAreaItem
          key={index}
          area={area}
          index={index}
          isSelected={selectedAreaIndex === index}
          onSelect={() => onSelectArea(index)}
          onDelete={() => onDeleteArea(index)}
          onUpdate={(updates) => onUpdateArea(index, updates)}
        />
      ))}
    </div>
  );
}
