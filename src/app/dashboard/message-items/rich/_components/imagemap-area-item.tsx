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
      className={`border-2 border-black p-4 transition-all ${
        isSelected
          ? "bg-[#FFE500] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          : "bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFEF5]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 border-2 border-black"
              style={{
                backgroundColor: AREA_COLORS[index % AREA_COLORS.length],
              }}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-black">
              エリア {index + 1}
            </span>
            <span className="text-xs font-mono text-black/60">
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
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
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
                className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
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
                className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
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
            className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="選択"
          >
            <Edit2 className="h-4 w-4 text-black" />
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
