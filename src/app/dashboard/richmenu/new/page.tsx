"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/richmenu/ImageUpload";
import { VisualEditor } from "@/components/richmenu/VisualEditor";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

export const dynamic = "force-dynamic";

type SizeType =
  | "2500x1686"  // Large Full
  | "2500x843"   // Large Half
  | "1200x810"   // Medium Full
  | "1200x405"   // Medium Half
  | "800x540"    // Small Full
  | "800x270";   // Small Half

interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback" | "datetimepicker" | "richmenuswitch";
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
    displayText?: string;
    mode?: "date" | "time" | "datetime";
    initial?: string;
    max?: string;
    min?: string;
    richMenuAliasId?: string;
  };
}

// Layout templates
const LAYOUT_TEMPLATES: Record<string, { name: string; description: string; areas: (size: "full" | "half") => TapArea[] }> = {
  "2-horizontal": {
    name: "2分割（横）",
    description: "上下2つのエリアに分割",
    areas: (size) => {
      const height = size === "full" ? 1686 : 843;
      const areaHeight = Math.floor(height / 2);
      return [
        { bounds: { x: 0, y: 0, width: 2500, height: areaHeight }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: 0, y: areaHeight, width: 2500, height: height - areaHeight }, action: { type: "uri", uri: "https://example.com" } },
      ];
    },
  },
  "2-vertical": {
    name: "2分割（縦）",
    description: "左右2つのエリアに分割",
    areas: (size) => {
      const height = size === "full" ? 1686 : 843;
      return [
        { bounds: { x: 0, y: 0, width: 1250, height }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: 1250, y: 0, width: 1250, height }, action: { type: "uri", uri: "https://example.com" } },
      ];
    },
  },
  "3-horizontal": {
    name: "3分割（横）",
    description: "上下3つのエリアに分割",
    areas: (size) => {
      const height = size === "full" ? 1686 : 843;
      const areaHeight = Math.floor(height / 3);
      return [
        { bounds: { x: 0, y: 0, width: 2500, height: areaHeight }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: 0, y: areaHeight, width: 2500, height: areaHeight }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: 0, y: areaHeight * 2, width: 2500, height: height - areaHeight * 2 }, action: { type: "uri", uri: "https://example.com" } },
      ];
    },
  },
  "3-vertical": {
    name: "3分割（縦）",
    description: "左右3つのエリアに分割",
    areas: (size) => {
      const height = size === "full" ? 1686 : 843;
      const areaWidth = Math.floor(2500 / 3);
      return [
        { bounds: { x: 0, y: 0, width: areaWidth, height }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: areaWidth, y: 0, width: areaWidth, height }, action: { type: "uri", uri: "https://example.com" } },
        { bounds: { x: areaWidth * 2, y: 0, width: 2500 - areaWidth * 2, height }, action: { type: "uri", uri: "https://example.com" } },
      ];
    },
  },
  "6-grid": {
    name: "6分割（グリッド）",
    description: "3x2のグリッドレイアウト",
    areas: (size) => {
      const height = size === "full" ? 1686 : 843;
      const areaWidth = Math.floor(2500 / 3);
      const areaHeight = Math.floor(height / 2);
      const result: TapArea[] = [];
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          result.push({
            bounds: {
              x: col * areaWidth,
              y: row * areaHeight,
              width: col === 2 ? 2500 - areaWidth * 2 : areaWidth,
              height: row === 1 ? height - areaHeight : areaHeight,
            },
            action: { type: "uri", uri: "https://example.com" },
          });
        }
      }
      return result;
    },
  },
};

export default function NewRichMenuPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [size, setSize] = useState<SizeType>("2500x1686");
  const [chatBarText, setChatBarText] = useState("");
  const [barDisplayed, setBarDisplayed] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [areas, setAreas] = useState<TapArea[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const addArea = () => {
    setAreas([
      ...areas,
      {
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        action: { type: "uri", label: "", uri: "" },
      },
    ]);
  };

  // Convert size string to simple type for templates
  const getSizeType = (size: SizeType): "full" | "half" => {
    return size.endsWith("1686") || size.endsWith("810") || size.endsWith("540") ? "full" : "half";
  };

  const applyTemplate = (templateKey: string) => {
    const template = LAYOUT_TEMPLATES[templateKey];
    if (template) {
      setAreas(template.areas(getSizeType(size)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        size,
        chatBarText,
        imageUrl,
        areas,
      };
      setLastRequest(payload);

      const response = await fetch("/api/line/richmenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          alias: alias || undefined,
          size,
          chatBarText,
          barDisplayed,
          isDefault,
          imageUrl,
          areas,
        }),
      });

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);

      if (!response.ok) {
        throw new Error(data.error || "リッチメニューの作成に失敗しました");
      }

      router.push("/dashboard/richmenu");
    } catch (err) {
      setLastResponse({ error: String(err) });
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

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
          <label htmlFor="alias" className="text-sm font-medium text-slate-300">
            エイリアス
          </label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="menu_alias"
          />
          <p className="text-xs text-slate-500">リッチメニュー切り替えで使用するエイリアス（オプション）</p>
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
            <optgroup label="大サイズ (2500px幅)">
              <option value="2500x1686">フル - 2500×1686px</option>
              <option value="2500x843">ハーフ - 2500×843px</option>
            </optgroup>
            <optgroup label="中サイズ (1200px幅)">
              <option value="1200x810">フル - 1200×810px</option>
              <option value="1200x405">ハーフ - 1200×405px</option>
            </optgroup>
            <optgroup label="小サイズ (800px幅)">
              <option value="800x540">フル - 800×540px</option>
              <option value="800x270">ハーフ - 800×270px</option>
            </optgroup>
          </select>
          <p className="text-xs text-slate-500">
            画像は指定サイズに合わせて作成してください（JPEG/PNG、最大1MB）
          </p>
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

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={barDisplayed}
              onChange={(e) => setBarDisplayed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/60 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">チャットバーを表示する</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/60 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">メニューを初期状態で開く</span>
          </label>
        </div>

        <ImageUpload
          size={size}
          onUploadComplete={setImageUrl}
          currentImageUrl={imageUrl}
        />

        {/* Layout Templates */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">
            レイアウトテンプレート
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className="rounded-lg border border-slate-600 bg-slate-900/60 p-3 text-left transition hover:border-blue-500 hover:bg-slate-800/60"
              >
                <div className="text-sm font-medium text-slate-300">{template.name}</div>
                <div className="mt-1 text-xs text-slate-500">{template.description}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            ※ テンプレートを選択すると現在のタップエリアが置き換えられます
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

          <VisualEditor imageUrl={imageUrl} size={getSizeType(size)} areas={areas} onAreasChange={setAreas} />
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

      <DebugPanel
        title="リッチメニュー作成 API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL('/api/line/richmenu', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: lastRequest,
        })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#create-rich-menu"
      />
    </div>
  );
}
