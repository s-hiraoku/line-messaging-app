"use client";

import type { TapArea } from "@/types/richmenu";

interface AreaActionFormProps {
  area: TapArea;
  onUpdate: (updates: Partial<TapArea>) => void;
}

export function AreaActionForm({ area, onUpdate }: AreaActionFormProps) {
  return (
    <div className="space-y-2">
      <select
        value={area.action.type}
        onChange={(e) =>
          onUpdate({
            action: {
              type: e.target.value as "uri" | "message" | "postback",
              ...(e.target.value === "uri" && { uri: "https://example.com" }),
              ...(e.target.value === "message" && { text: "メッセージ" }),
              ...(e.target.value === "postback" && { data: "action=example" }),
            },
          })
        }
        className="w-full border-2 border-black bg-white px-2 py-1.5 text-sm font-mono text-black transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
      >
        <option value="uri">リンク (URI)</option>
        <option value="message">メッセージ</option>
        <option value="postback">ポストバック</option>
      </select>

      {area.action.type === "uri" && (
        <input
          type="url"
          value={area.action.uri || ""}
          onChange={(e) =>
            onUpdate({
              action: { ...area.action, uri: e.target.value },
            })
          }
          className="w-full border-2 border-black bg-white px-2 py-1.5 text-sm font-mono text-black placeholder-black/40 transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
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
          className="w-full border-2 border-black bg-white px-2 py-1.5 text-sm font-mono text-black placeholder-black/40 transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          placeholder="送信されるテキスト"
          required
        />
      )}

      {area.action.type === "postback" && (
        <input
          type="text"
          value={area.action.data || ""}
          onChange={(e) =>
            onUpdate({
              action: { ...area.action, data: e.target.value },
            })
          }
          className="w-full border-2 border-black bg-white px-2 py-1.5 text-sm font-mono text-black placeholder-black/40 transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          placeholder="action=example&id=123"
          required
        />
      )}
    </div>
  );
}
