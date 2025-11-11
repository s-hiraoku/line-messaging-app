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
      <div className="rounded-lg border border-dashed border-slate-600 bg-slate-900/40 p-8 text-center">
        <Plus className="mx-auto h-8 w-8 text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">画像上をドラッグしてタップ領域を作成</p>
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
