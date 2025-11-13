"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { UserSelector } from "../../_components/user-selector";

type Status = "idle" | "sending" | "success" | "error";

export default function RichMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  // Imagemap fields
  const [baseUrl, setBaseUrl] = useState("https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe");
  const [altText, setAltText] = useState("リッチメッセージ");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      // Send Imagemap message (リッチメッセージ)
      const payload = {
        to: lineUserId,
        messages: [{
          type: "imagemap",
          baseUrl: baseUrl,
          altText: altText,
          baseSize: {
            width: 1040,
            height: 1040,
          },
          actions: [
            {
              type: "uri",
              linkUri: "https://example.com",
              area: {
                x: 0,
                y: 0,
                width: 520,
                height: 520,
              },
            },
            {
              type: "uri",
              linkUri: "https://example.com/page2",
              area: {
                x: 520,
                y: 0,
                width: 520,
                height: 520,
              },
            },
            {
              type: "message",
              text: "左下がタップされました",
              area: {
                x: 0,
                y: 520,
                width: 520,
                height: 520,
              },
            },
            {
              type: "message",
              text: "右下がタップされました",
              area: {
                x: 520,
                y: 520,
                width: 520,
                height: 520,
              },
            },
          ],
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
        <h2 className="mb-2 text-sm font-semibold text-blue-300">リッチメッセージとは？</h2>
        <p className="text-xs text-slate-400">
          画像に複数のタップ可能なエリアを設定できるメッセージです。ユーザーがエリアをタップすると、URLを開いたり、メッセージを送信したりできます。
          マップやメニューなど、インタラクティブな画像コンテンツに最適です。
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
            placeholder="リッチメッセージ"
            required
          />
          <p className="text-xs text-slate-500">最大400文字</p>
        </div>

        <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-300">アクションエリア設定</h3>
          <p className="text-xs text-slate-400">
            デフォルトで4つのエリア（2x2グリッド）が設定されています：
            <br />
            ・左上、右上：URLを開く
            <br />
            ・左下、右下：メッセージを送信
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
                <div className="mb-2 font-medium">リッチメッセージ</div>
                <div className="text-slate-400">
                  画像マップメッセージが送信されます。
                  <br />
                  4つのタップ可能なエリアが設定されています。
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
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#imagemap-message"
        />
      )}
    </div>
  );
}
