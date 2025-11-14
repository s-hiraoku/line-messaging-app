"use client";

import { Trash2, Edit2 } from "lucide-react";
import type { TapArea } from "@/types/richmenu";
import { AREA_COLORS } from "@/constants/richmenu";
import { AreaActionForm } from "./AreaActionForm";

interface AreaItemProps {
  area: TapArea;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<TapArea>) => void;
}

export function AreaItem({
  area,
  index,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: AreaItemProps) {
  return (
    <div
      className={`border-2 border-black p-4 transition-all ${
        isSelected
          ? "bg-[#FFFEF5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          : "bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFEF5]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 border-2 border-black"
              style={{ backgroundColor: AREA_COLORS[index % AREA_COLORS.length] }}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-black">エリア {index + 1}</span>
            <span className="text-xs font-mono text-black/60">
              ({area.bounds.x}, {area.bounds.y}) - {area.bounds.width}×{area.bounds.height}
            </span>
          </div>

          <AreaActionForm area={area} onUpdate={onUpdate} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="border-2 border-black bg-white p-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="選択"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="border-2 border-black bg-red-600 p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
