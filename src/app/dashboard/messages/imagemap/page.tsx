"use client";

import { useState } from "react";

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: lineUserId,
          type: "imagemap",
          baseUrl,
          altText,
          baseSize: {
            width: parseInt(width),
            height: parseInt(height),
          },
          actions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "イメージマップメッセージの送信に失敗しました");
      }

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
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">イメージマップメッセージ送信</h1>
        <p className="text-sm text-slate-400">
          画像に複数のタップ可能なエリアを設定して送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-300">
            LINE ユーザー ID <span className="text-red-400">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="baseUrl" className="text-sm font-medium text-slate-300">
            画像ベースURL <span className="text-red-400">*</span>
          </label>
          <input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/images/imagemap"
            required
          />
          <p className="text-xs text-slate-500">
            HTTPS、1024x1024px以上、/1040 などのサイズ接尾辞なし
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="altText" className="text-sm font-medium text-slate-300">
            代替テキスト <span className="text-red-400">*</span>
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={400}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="画像マップ"
            required
          />
          <p className="text-xs text-slate-500">最大400文字</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-medium text-slate-300">
              幅 <span className="text-red-400">*</span>
            </label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="1"
              max="2500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-medium text-slate-300">
              高さ <span className="text-red-400">*</span>
            </label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="1"
              max="2500"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              アクションエリア <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={addAction}
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

          {actions.map((action, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-slate-700/50 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">エリア {index + 1}</span>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">アクションタイプ</label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, "type", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                  </select>
                </div>

                {action.type === "uri" && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">リンクURL</label>
                    <input
                      type="url"
                      value={action.linkUri || ""}
                      onChange={(e) => updateAction(index, "linkUri", e.target.value)}
                      className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                )}

                {action.type === "message" && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">送信テキスト</label>
                    <input
                      type="text"
                      value={action.text || ""}
                      onChange={(e) => updateAction(index, "text", e.target.value)}
                      className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="タップされました"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">X</label>
                  <input
                    type="number"
                    value={action.area.x}
                    onChange={(e) => updateAction(index, "area.x", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Y</label>
                  <input
                    type="number"
                    value={action.area.y}
                    onChange={(e) => updateAction(index, "area.y", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">幅</label>
                  <input
                    type="number"
                    value={action.area.width}
                    onChange={(e) => updateAction(index, "area.width", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">高さ</label>
                  <input
                    type="number"
                    value={action.area.height}
                    onChange={(e) => updateAction(index, "area.height", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !baseUrl || !altText}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">イメージマップメッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview */}
      {baseUrl && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="overflow-hidden rounded-2xl bg-blue-600 shadow-md">
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
                        className="absolute border-2 border-blue-400 bg-blue-400/20"
                        style={{
                          left: `${(action.area.x / parseInt(width)) * 100}%`,
                          top: `${(action.area.y / parseInt(height)) * 100}%`,
                          width: `${(action.area.width / parseInt(width)) * 100}%`,
                          height: `${(action.area.height / parseInt(height)) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">{altText}</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <details className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 shadow-lg backdrop-blur-sm">
        <summary className="cursor-pointer text-sm font-medium text-slate-300">
          デバッグ情報
        </summary>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-400">Request Body</div>
            <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
              {JSON.stringify(
                {
                  to: lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                  type: "imagemap",
                  baseUrl,
                  altText,
                  baseSize: {
                    width: parseInt(width) || 1040,
                    height: parseInt(height) || 1040,
                  },
                  actions,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
