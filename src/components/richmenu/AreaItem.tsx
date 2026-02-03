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
      className={`rounded-xl p-4 transition-all duration-300 ${
        isSelected
          ? "bg-[#e8f5e9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
          : "bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#e8f5e9]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: AREA_COLORS[index % AREA_COLORS.length] }}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-800">エリア {index + 1}</span>
            <span className="text-xs font-mono text-gray-500">
              ({area.bounds.x}, {area.bounds.y}) - {area.bounds.width}×{area.bounds.height}
            </span>
          </div>

          <AreaActionForm area={area} onUpdate={onUpdate} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-xl bg-white p-2 text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9]"
            title="選択"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-red-600 p-2 text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
