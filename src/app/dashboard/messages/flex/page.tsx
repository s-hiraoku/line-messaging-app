"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const TEMPLATES = {
  restaurant: {
    type: "bubble",
    hero: {
      type: "image",
      url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Brown Cafe",
          weight: "bold",
          size: "xl",
        },
        {
          type: "box",
          layout: "baseline",
          margin: "md",
          contents: [
            {
              type: "icon",
              size: "sm",
              url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
            },
            {
              type: "text",
              text: "4.0",
              size: "sm",
              color: "#999999",
              margin: "md",
              flex: 0,
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "link",
          height: "sm",
          action: {
            type: "uri",
            label: "ウェブサイト",
            uri: "https://example.com",
          },
        },
      ],
    },
  },
  shopping: {
    type: "bubble",
    hero: {
      type: "image",
      url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png",
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "商品名",
          weight: "bold",
          size: "xl",
        },
        {
          type: "box",
          layout: "baseline",
          margin: "md",
          contents: [
            {
              type: "text",
              text: "¥3,000",
              size: "xl",
              color: "#ff0000",
              flex: 0,
            },
            {
              type: "text",
              text: "¥5,000",
              size: "sm",
              color: "#999999",
              margin: "md",
              decoration: "line-through",
              flex: 0,
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          height: "sm",
          action: {
            type: "message",
            label: "購入する",
            text: "この商品を購入します",
          },
        },
      ],
    },
  },
  event: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "イベント名",
          weight: "bold",
          size: "xl",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "日時",
                  color: "#aaaaaa",
                  size: "sm",
                  flex: 1,
                },
                {
                  type: "text",
                  text: "2025年3月15日 14:00",
                  wrap: true,
                  color: "#666666",
                  size: "sm",
                  flex: 5,
                },
              ],
            },
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "場所",
                  color: "#aaaaaa",
                  size: "sm",
                  flex: 1,
                },
                {
                  type: "text",
                  text: "東京",
                  wrap: true,
                  color: "#666666",
                  size: "sm",
                  flex: 5,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          height: "sm",
          action: {
            type: "uri",
            label: "詳細を見る",
            uri: "https://example.com/event",
          },
        },
      ],
    },
  },
};

export default function FlexMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [altText, setAltText] = useState("");
  const [flexJson, setFlexJson] = useState(JSON.stringify(TEMPLATES.restaurant, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setFlexJson(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const loadTemplate = (templateKey: keyof typeof TEMPLATES) => {
    setFlexJson(JSON.stringify(TEMPLATES[templateKey], null, 2));
    setJsonError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const contents = JSON.parse(flexJson);

      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: lineUserId,
          type: "flex",
          altText,
          contents,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Flex Messageの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Flex Message 送信</h1>
        <p className="text-sm text-slate-400">
          カスタマイズ可能なレイアウトでリッチなメッセージを送信できます。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
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
                placeholder="Flex Message"
                required
              />
              <p className="text-xs text-slate-500">最大400文字</p>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">テンプレート</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadTemplate("restaurant")}
                  className="rounded border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800/60"
                >
                  レストラン
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("shopping")}
                  className="rounded border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800/60"
                >
                  ショッピング
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("event")}
                  className="rounded border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800/60"
                >
                  イベント
                </button>
              </div>
            </div>

            {/* JSON Editor */}
            <div className="space-y-2">
              <label htmlFor="flexJson" className="text-sm font-medium text-slate-300">
                Flex Message JSON <span className="text-red-400">*</span>
              </label>
              <textarea
                id="flexJson"
                value={flexJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="h-96 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="{}"
                required
              />
              {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
              <p className="text-xs text-slate-500">
                <a
                  href="https://developers.line.biz/flex-simulator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Flex Message Simulator
                </a>{" "}
                でメッセージを作成できます
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={status === "sending" || !lineUserId || !altText || !!jsonError}
              >
                {status === "sending" ? "送信中..." : "送信"}
              </button>
              {status === "success" && (
                <p className="text-sm text-green-400">Flex Messageを送信しました。</p>
              )}
              {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </form>
        </div>

        {/* Right Column - Preview & Debug */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
            <div className="flex justify-end">
              <div className="max-w-xs">
                <div className="rounded-lg bg-slate-700 p-4 text-xs text-slate-300">
                  {jsonError ? (
                    <div className="text-red-400">JSON形式が正しくありません</div>
                  ) : (
                    <div className="whitespace-pre-wrap break-all">
                      Flex Message
                      <br />
                      <span className="text-slate-500">
                        （実際のプレビューは LINE Flex Simulator をご利用ください）
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                      type: "flex",
                      altText,
                      contents: jsonError ? {} : JSON.parse(flexJson || "{}"),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
