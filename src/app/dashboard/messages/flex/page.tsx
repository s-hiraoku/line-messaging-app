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
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

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

      const payload = {
        to: lineUserId,
        messages: [{
          type: "flex",
          altText,
          contents,
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
        throw new Error(data.error ?? "Flex Messageの送信に失敗しました");
      }

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>Flexメッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          カスタマイズ可能なFlexメッセージを送信できます。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                placeholder="Flex Message"
                required
              />
              <p className="text-xs font-mono text-black/60">最大400文字</p>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-black">テンプレート</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadTemplate("restaurant")}
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  レストラン
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("shopping")}
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  ショッピング
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("event")}
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  イベント
                </button>
              </div>
            </div>

            {/* JSON Editor */}
            <div className="space-y-2">
              <label htmlFor="flexJson" className="text-sm font-bold uppercase tracking-wider text-black">
                Flex Message JSON <span className="text-red-600">*</span>
              </label>
              <textarea
                id="flexJson"
                value={flexJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="h-96 w-full border-2 border-black bg-white px-3 py-2 font-mono text-xs text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
                placeholder="{}"
                required
              />
              {jsonError && <p className="text-xs font-mono text-red-600">{jsonError}</p>}
              <p className="text-xs font-mono text-black/60">
                <a
                  href="https://developers.line.biz/flex-simulator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black hover:text-black/80"
                >
                  Flex Message Simulator
                </a>{" "}
                でメッセージを作成できます
              </p>
            </div>

            <div className="flex items-center gap-3 border-t-2 border-black pt-4">
              <button
                type="submit"
                className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status === "sending" || !lineUserId || !altText || !!jsonError}
              >
                {status === "sending" ? "送信中..." : "送信"}
              </button>
              {status === "success" && (
                <p className="text-sm font-bold text-[#00B900]">Flex Messageを送信しました。</p>
              )}
              {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
            </div>
          </form>
        </div>

        {/* Right Column - Preview & Debug */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="border-2 border-black bg-[#FFFEF5] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-black">プレビュー</h2>
            <div className="flex justify-end">
              <div className="max-w-xs">
                <div className="border-2 border-black bg-white p-4 text-xs text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {jsonError ? (
                    <div className="text-red-600">JSON形式が正しくありません</div>
                  ) : (
                    <div className="whitespace-pre-wrap break-all">
                      Flex Message
                      <br />
                      <span className="text-black/60">
                        （実際のプレビューは LINE Flex Simulator をご利用ください）
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DebugPanel
            title="Flex Message API デバッグ"
            request={lastRequest}
            response={lastResponse}
            curl={toCurl({
              url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: lastRequest
            })}
            docsUrl="https://developers.line.biz/ja/reference/messaging-api/#flex-message"
          />
        </div>
      </div>
    </div>
  );
}
