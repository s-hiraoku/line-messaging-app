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
              style={{
                backgroundColor: AREA_COLORS[index % AREA_COLORS.length],
              }}
            />
            <span className="text-sm font-medium text-slate-300">
              エリア {index + 1}
            </span>
            <span className="text-xs text-slate-500">
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
              className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white"
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
                className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
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
                className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
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
