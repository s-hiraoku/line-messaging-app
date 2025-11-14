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
      <div className="border-2 border-dashed border-black bg-white p-8 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <Plus className="mx-auto h-8 w-8 text-black mb-2" />
        <p className="text-sm font-mono text-black/60">
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
