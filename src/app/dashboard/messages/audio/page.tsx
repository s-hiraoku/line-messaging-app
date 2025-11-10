"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function AudioMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState("");
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
          type: "audio",
          audioUrl,
          duration: parseInt(duration, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "音声メッセージの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const durationMs = parseInt(duration, 10);
  const isValidDuration = !isNaN(durationMs) && durationMs > 0 && durationMs <= 60000;

  return (
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">音声メッセージ送信</h1>
        <p className="text-sm text-slate-400">
          M4A形式の音声ファイルをユーザーに送信できます（最大200MB、最長60秒）。
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
          <label htmlFor="audioUrl" className="text-sm font-medium text-slate-300">
            音声ファイルURL <span className="text-red-400">*</span>
          </label>
          <input
            id="audioUrl"
            type="url"
            value={audioUrl}
            onChange={(event) => setAudioUrl(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/audio.m4a"
            required
          />
          <p className="text-xs text-slate-500">
            M4A形式、HTTPS必須、最大200MB
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium text-slate-300">
            再生時間（ミリ秒） <span className="text-red-400">*</span>
          </label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="5000"
            min="1"
            max="60000"
            required
          />
          {duration && (
            <p className={`text-xs ${isValidDuration ? "text-slate-500" : "text-red-400"}`}>
              {isValidDuration
                ? `${(durationMs / 1000).toFixed(1)}秒`
                : "1〜60000ミリ秒（1〜60秒）の範囲で入力してください"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !audioUrl || !isValidDuration}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">音声メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview Section */}
      {audioUrl && isValidDuration && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs opacity-80">音声メッセージ</div>
                    <div className="text-sm font-medium">{(durationMs / 1000).toFixed(1)}秒</div>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {(durationMs / 1000).toFixed(1)}秒
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {audioUrl && isValidDuration && (
        <details className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 shadow-lg backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-medium text-slate-300">
            デバッグ情報
          </summary>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">cURL</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {`curl -X POST https://api.line.me/v2/bot/message/push \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}' \\
  -d '{
  "to": "${lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}",
  "messages": [
    {
      "type": "audio",
      "originalContentUrl": "${audioUrl}",
      "duration": ${durationMs}
    }
  ]
}'`}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Request Body</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {JSON.stringify(
                  {
                    to: lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    type: "audio",
                    audioUrl,
                    duration: durationMs,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
