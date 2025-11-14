"use client";

import { Plus } from "lucide-react";
import type { TapArea } from "@/types/richmenu";
import { AreaItem } from "./AreaItem";

interface AreaListProps {
  areas: TapArea[];
  selectedAreaIndex: number | null;
  onSelectArea: (index: number) => void;
  onDeleteArea: (index: number) => void;
  onUpdateArea: (index: number, updates: Partial<TapArea>) => void;
}

export function AreaList({
  areas,
  selectedAreaIndex,
  onSelectArea,
  onDeleteArea,
  onUpdateArea,
}: AreaListProps) {
  if (areas.length === 0) {
    return (
      <div className="border-2 border-dashed border-black bg-white p-8 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <Plus className="mx-auto h-8 w-8 text-black mb-2" />
        <p className="text-sm font-mono text-black/60">画像上をドラッグしてタップ領域を作成</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {areas.map((area, index) => (
        <AreaItem
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
