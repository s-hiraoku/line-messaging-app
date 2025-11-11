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
        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white"
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

      {area.action.type === "postback" && (
        <input
          type="text"
          value={area.action.data || ""}
          onChange={(e) =>
            onUpdate({
              action: { ...area.action, data: e.target.value },
            })
          }
          className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
          placeholder="action=example&id=123"
          required
        />
      )}
    </div>
  );
}
