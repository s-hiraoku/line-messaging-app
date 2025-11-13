"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { UserSelector } from "../../_components/user-selector";

type Status = "idle" | "sending" | "success" | "error";

export default function CardMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  // Carousel fields
  const [carouselAltText, setCarouselAltText] = useState("カードタイプメッセージ");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      // Send Carousel template message (カードタイプメッセージ)
      const payload = {
        to: lineUserId,
        messages: [{
          type: "template",
          altText: carouselAltText,
          template: {
            type: "carousel",
            columns: [
              {
                thumbnailImageUrl: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
                title: "カード1",
                text: "これは1つ目のカードです",
                actions: [
                  {
                    type: "uri",
                    label: "詳細を見る",
                    uri: "https://example.com/card1",
                  },
                  {
                    type: "message",
                    label: "選択する",
                    text: "カード1を選択しました",
                  },
                ],
              },
              {
                thumbnailImageUrl: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png",
                title: "カード2",
                text: "これは2つ目のカードです",
                actions: [
                  {
                    type: "uri",
                    label: "詳細を見る",
                    uri: "https://example.com/card2",
                  },
                  {
                    type: "message",
                    label: "選択する",
                    text: "カード2を選択しました",
                  },
                ],
              },
              {
                thumbnailImageUrl: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_3_violate.png",
                title: "カード3",
                text: "これは3つ目のカードです",
                actions: [
                  {
                    type: "uri",
                    label: "詳細を見る",
                    uri: "https://example.com/card3",
                  },
                  {
                    type: "message",
                    label: "選択する",
                    text: "カード3を選択しました",
                  },
                ],
              },
            ],
          },
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
        throw new Error(data.error ?? "メッセージの送信に失敗しました");
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
    <div className="max-w-4xl space-y-6">
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
        <h2 className="mb-2 text-sm font-semibold text-blue-300">カードタイプメッセージとは？</h2>
        <p className="text-xs text-slate-400">
          複数のカードをスワイプして表示できるカルーセル形式のメッセージです。各カードには画像、タイトル、説明文、アクションボタンを設定できます。
          商品紹介やメニュー選択など、複数の選択肢を提示する場面に最適です。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-300">
            送信先ユーザー <span className="text-red-400">*</span>
          </label>
          <UserSelector
            value={lineUserId}
            onValueChange={setLineUserId}
            placeholder="ユーザーを検索または LINE ユーザー ID を入力..."
          />
          <p className="text-xs text-slate-500">
            ユーザー名や表示名で検索、または LINE ユーザー ID を直接入力できます
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="carouselAltText" className="text-sm font-medium text-slate-300">
            代替テキスト <span className="text-red-400">*</span>
          </label>
          <input
            id="carouselAltText"
            type="text"
            value={carouselAltText}
            onChange={(event) => setCarouselAltText(event.target.value)}
            maxLength={400}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="カードタイプメッセージ"
            required
          />
          <p className="text-xs text-slate-500">最大400文字</p>
        </div>

        <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-300">カード設定</h3>
          <p className="text-xs text-slate-400">
            デフォルトで3つのカードが設定されています。各カードには：
            <br />
            ・サムネイル画像
            <br />
            ・タイトルとテキスト
            <br />
            ・2つのアクションボタン（URLとメッセージ）
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview section */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
        <div className="flex justify-end">
          <div className="max-w-xs">
            <div className="rounded-lg bg-slate-700 p-4 text-xs text-slate-300">
              <div>
                <div className="mb-2 font-medium">カードタイプメッセージ</div>
                <div className="text-slate-400">
                  3つのカードがカルーセル形式で送信されます。
                  <br />
                  各カードには2つのアクションボタンがあります。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          title="送信 API デバッグ"
          request={lastRequest}
          response={lastResponse}
          curl={toCurl({
            url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: lastRequest
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#template-messages"
        />
      )}
    </div>
  );
}
