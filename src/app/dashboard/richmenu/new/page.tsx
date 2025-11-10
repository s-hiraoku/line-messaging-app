"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SizeType = "full" | "half";

interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback";
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
  };
}

export default function NewRichMenuPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [size, setSize] = useState<SizeType>("full");
  const [chatBarText, setChatBarText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [areas, setAreas] = useState<TapArea[]>([
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: "uri", uri: "https://example.com" },
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSizeInfo = (sizeType: SizeType) => {
    return sizeType === "full"
      ? { width: 2500, height: 1686, label: "フル" }
      : { width: 2500, height: 843, label: "ハーフ" };
  };

  const addArea = () => {
    const sizeInfo = getSizeInfo(size);
    setAreas([
      ...areas,
      {
        bounds: { x: 0, y: 0, width: 833, height: sizeInfo.height },
        action: { type: "uri", uri: "https://example.com" },
      },
    ]);
  };

  const removeArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const updateArea = (index: number, field: string, value: any) => {
    const newAreas = [...areas];
    if (field.startsWith("bounds.")) {
      const boundsField = field.split(".")[1];
      newAreas[index] = {
        ...newAreas[index],
        bounds: {
          ...newAreas[index].bounds,
          [boundsField]: parseInt(value) || 0,
        },
      };
    } else if (field.startsWith("action.")) {
      const actionField = field.split(".")[1];
      if (actionField === "type") {
        // Reset action when type changes
        const newAction: TapArea["action"] = { type: value };
        if (value === "uri") {
          newAction.uri = "https://example.com";
        } else if (value === "message") {
          newAction.text = "メッセージ";
        } else if (value === "postback") {
          newAction.data = "action=example";
        }
        newAreas[index] = {
          ...newAreas[index],
          action: newAction,
        };
      } else {
        newAreas[index] = {
          ...newAreas[index],
          action: {
            ...newAreas[index].action,
            [actionField]: value,
          },
        };
      }
    }
    setAreas(newAreas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/line/richmenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          size,
          chatBarText,
          imageUrl,
          areas,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "リッチメニューの作成に失敗しました");
      }

      router.push("/dashboard/richmenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const sizeInfo = getSizeInfo(size);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">リッチメニュー作成</h1>
        <p className="text-sm text-slate-400">
          新しいリッチメニューを作成します。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">
            メニュー名 <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="メインメニュー"
            required
          />
          <p className="text-xs text-slate-500">内部管理用の名前です</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="size" className="text-sm font-medium text-slate-300">
            サイズ <span className="text-red-400">*</span>
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value as SizeType)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="full">フル (2500x1686px)</option>
            <option value="half">ハーフ (2500x843px)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="chatBarText" className="text-sm font-medium text-slate-300">
            チャットバーテキスト <span className="text-red-400">*</span>
          </label>
          <input
            id="chatBarText"
            type="text"
            value={chatBarText}
            onChange={(e) => setChatBarText(e.target.value)}
            maxLength={14}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="メニュー"
            required
          />
          <p className="text-xs text-slate-500">最大14文字（{chatBarText.length}/14）</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="imageUrl" className="text-sm font-medium text-slate-300">
            画像URL <span className="text-red-400">*</span>
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/richmenu.jpg"
            required
          />
          <p className="text-xs text-slate-500">
            画像サイズ: {sizeInfo.width}x{sizeInfo.height}px、JPEG/PNG形式
          </p>
        </div>

        {/* Tap Areas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              タップエリア <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={addArea}
              className="inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              エリアを追加
            </button>
          </div>

          {areas.map((area, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-slate-700/50 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">エリア {index + 1}</span>
                {areas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArea(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                )}
              </div>

              {/* Bounds */}
              <div>
                <div className="mb-2 text-xs font-medium text-slate-400">座標 (px)</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">X</label>
                    <input
                      type="number"
                      value={area.bounds.x}
                      onChange={(e) => updateArea(index, "bounds.x", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white"
                      min="0"
                      max={sizeInfo.width}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Y</label>
                    <input
                      type="number"
                      value={area.bounds.y}
                      onChange={(e) => updateArea(index, "bounds.y", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white"
                      min="0"
                      max={sizeInfo.height}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">幅</label>
                    <input
                      type="number"
                      value={area.bounds.width}
                      onChange={(e) => updateArea(index, "bounds.width", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white"
                      min="1"
                      max={sizeInfo.width}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">高さ</label>
                    <input
                      type="number"
                      value={area.bounds.height}
                      onChange={(e) => updateArea(index, "bounds.height", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white"
                      min="1"
                      max={sizeInfo.height}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div>
                <div className="mb-2 text-xs font-medium text-slate-400">アクション</div>
                <div className="space-y-2">
                  <select
                    value={area.action.type}
                    onChange={(e) => updateArea(index, "action.type", e.target.value)}
                    className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                    <option value="postback">ポストバック</option>
                  </select>

                  {area.action.type === "uri" && (
                    <input
                      type="url"
                      value={area.action.uri || ""}
                      onChange={(e) => updateArea(index, "action.uri", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white placeholder-slate-500"
                      placeholder="https://example.com"
                      required
                    />
                  )}

                  {area.action.type === "message" && (
                    <input
                      type="text"
                      value={area.action.text || ""}
                      onChange={(e) => updateArea(index, "action.text", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white placeholder-slate-500"
                      placeholder="送信されるテキスト"
                      required
                    />
                  )}

                  {area.action.type === "postback" && (
                    <input
                      type="text"
                      value={area.action.data || ""}
                      onChange={(e) => updateArea(index, "action.data", e.target.value)}
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-white placeholder-slate-500"
                      placeholder="action=example&id=123"
                      required
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "作成中..." : "作成"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-md border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
