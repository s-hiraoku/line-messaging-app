"use client";

import { Trash2, Edit2 } from "lucide-react";
import type { ImagemapArea } from "./editor";
import { AREA_COLORS } from "@/constants/richmenu";

interface ImagemapAreaItemProps {
  area: ImagemapArea;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<ImagemapArea>) => void;
}

export function ImagemapAreaItem({
  area,
  index,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: ImagemapAreaItemProps) {
  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-300 ${
        isSelected
          ? "bg-[#c8e6c9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
          : "bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#e8f5e9] hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{
                backgroundColor: AREA_COLORS[index % AREA_COLORS.length],
              }}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-800">
              エリア {index + 1}
            </span>
            <span className="text-xs font-mono text-gray-500">
              ({area.x}, {area.y}) - {area.width}×{area.height}
            </span>
          </div>

          {/* Action type selector */}
          <div className="space-y-2">
            <select
              value={area.action.type}
              onChange={(e) =>
                onUpdate({
                  action: {
                    type: e.target.value as "uri" | "message",
                    ...(e.target.value === "uri" && {
                      linkUri: "https://example.com",
                    }),
                    ...(e.target.value === "message" && { text: "メッセージ" }),
                  },
                })
              }
              className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:-translate-y-0.5 focus:outline-none transition-all duration-300"
            >
              <option value="uri">リンク (URI)</option>
              <option value="message">メッセージ</option>
            </select>

            {/* Action-specific input */}
            {area.action.type === "uri" && (
              <input
                type="url"
                value={area.action.linkUri || ""}
                onChange={(e) =>
                  onUpdate({
                    action: { ...area.action, linkUri: e.target.value },
                  })
                }
                className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:-translate-y-0.5 focus:outline-none transition-all duration-300"
                placeholder="https://example.com"
                required
              />
            )}

            {area.action.type === "message" && (
              <input
                type="text"
                value={area.action.text || ""}
                onChange={(e) =>
                  onUpdate({
                    action: { ...area.action, text: e.target.value },
                  })
                }
                className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:-translate-y-0.5 focus:outline-none transition-all duration-300"
                placeholder="送信されるテキスト"
                required
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-xl bg-white p-2 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
            title="選択"
          >
            <Edit2 className="h-4 w-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-red-500 p-2 text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
