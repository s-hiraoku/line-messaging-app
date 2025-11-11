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
      className={`rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-500/10"
          : "border-slate-700/50 bg-slate-900/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: AREA_COLORS[index % AREA_COLORS.length] }}
            />
            <span className="text-sm font-medium text-slate-300">エリア {index + 1}</span>
            <span className="text-xs text-slate-500">
              ({area.bounds.x}, {area.bounds.y}) - {area.bounds.width}×{area.bounds.height}
            </span>
          </div>

          <AreaActionForm area={area} onUpdate={onUpdate} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
            title="選択"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
