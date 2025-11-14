"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

type Status = "idle" | "sending" | "success" | "error";

type ActionType = "uri" | "message";

interface ImagemapAction {
  type: ActionType;
  area: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  linkUri?: string;
  text?: string;
}

export default function ImagemapMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [width, setWidth] = useState("1040");
  const [height, setHeight] = useState("1040");
  const [actions, setActions] = useState<ImagemapAction[]>([
    {
      type: "uri",
      area: { x: 0, y: 0, width: 520, height: 520 },
      linkUri: "https://example.com",
    },
  ]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const payload = {
        to: lineUserId,
        messages: [{
          type: "imagemap",
          baseUrl,
          altText,
          baseSize: {
            width: parseInt(width),
            height: parseInt(height),
          },
          actions,
        }],
      };
      setLastRequest(payload);
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setLastResponse(data);
        throw new Error(data.error ?? "イメージマップメッセージの送信に失敗しました");
      }

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        type: "uri",
        area: { x: 0, y: 0, width: 520, height: 520 },
        linkUri: "https://example.com",
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (field.startsWith("area.")) {
      const areaField = field.split(".")[1];
      newActions[index] = {
        ...newActions[index],
        area: {
          ...newActions[index].area,
          [areaField]: parseInt(value),
        },
      };
    } else if (field === "type") {
      const newAction: ImagemapAction = {
        type: value as ActionType,
        area: newActions[index].area,
      };
      if (value === "uri") {
        newAction.linkUri = "https://example.com";
      } else {
        newAction.text = "タップされました";
      }
      newActions[index] = newAction;
    } else {
      newActions[index] = {
        ...newActions[index],
        [field]: value,
      };
    }
    setActions(newActions);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>イメージマップメッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          タップ可能な領域を持つ画像を送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-black">
            LINE ユーザー ID <span className="text-red-600">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="baseUrl" className="text-sm font-bold uppercase tracking-wider text-black">
            画像ベースURL <span className="text-red-600">*</span>
          </label>
          <input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="https://example.com/images/imagemap"
            required
          />
          <p className="text-xs font-mono text-black/60">
            HTTPS、1024x1024px以上、/1040 などのサイズ接尾辞なし
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="altText" className="text-sm font-bold uppercase tracking-wider text-black">
            代替テキスト <span className="text-red-600">*</span>
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={400}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="画像マップ"
            required
          />
          <p className="text-xs font-mono text-black/60">最大400文字</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-bold uppercase tracking-wider text-black">
              幅 <span className="text-red-600">*</span>
            </label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              min="1"
              max="2500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-bold uppercase tracking-wider text-black">
              高さ <span className="text-red-600">*</span>
            </label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              min="1"
              max="2500"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider text-black">
              アクションエリア <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              onClick={addAction}
              className="inline-flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
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

          {actions.map((action, index) => (
            <div
              key={index}
              className="space-y-3 border-2 border-black bg-[#FFFEF5] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">エリア {index + 1}</span>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black">アクションタイプ</label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, "type", e.target.value)}
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                  </select>
                </div>

                {action.type === "uri" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black">リンクURL</label>
                    <input
                      type="url"
                      value={action.linkUri || ""}
                      onChange={(e) => updateAction(index, "linkUri", e.target.value)}
                      className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                )}

                {action.type === "message" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black">送信テキスト</label>
                    <input
                      type="text"
                      value={action.text || ""}
                      onChange={(e) => updateAction(index, "text", e.target.value)}
                      className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                      placeholder="タップされました"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black">X</label>
                  <input
                    type="number"
                    value={action.area.x}
                    onChange={(e) => updateAction(index, "area.x", e.target.value)}
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black">Y</label>
                  <input
                    type="number"
                    value={action.area.y}
                    onChange={(e) => updateAction(index, "area.y", e.target.value)}
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black">幅</label>
                  <input
                    type="number"
                    value={action.area.width}
                    onChange={(e) => updateAction(index, "area.width", e.target.value)}
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black">高さ</label>
                  <input
                    type="number"
                    value={action.area.height}
                    onChange={(e) => updateAction(index, "area.height", e.target.value)}
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === "sending" || !lineUserId || !baseUrl || !altText}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && (
          <p className="text-sm font-bold text-[#00B900]">イメージマップメッセージを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      {/* Preview */}
      {baseUrl && (
        <div className="border-2 border-black bg-[#FFFEF5] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-black">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative">
                  <img
                    src={`${baseUrl}/1040`}
                    alt={altText}
                    className="w-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Show action areas as overlays */}
                  <div className="absolute inset-0">
                    {actions.map((action, index) => (
                      <div
                        key={index}
                        className="absolute border-2 border-black bg-black/10"
                        style={{
                          left: `${(action.area.x / parseInt(width)) * 100}%`,
                          top: `${(action.area.y / parseInt(height)) * 100}%`,
                          width: `${(action.area.width / parseInt(width)) * 100}%`,
                          height: `${(action.area.height / parseInt(height)) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-black">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-black/60">{altText}</div>
            </div>
          </div>
        </div>
      )}

      <DebugPanel
        title="イメージマップ API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: lastRequest
        })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#imagemap-message"
      />
    </div>
  );
}
