"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";
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
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>音声メッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          音声ファイルを送信できます。
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
          <label htmlFor="audioUrl" className="text-sm font-bold uppercase tracking-wider text-black">
            音声ファイルURL <span className="text-red-600">*</span>
          </label>
          <input
            id="audioUrl"
            type="url"
            value={audioUrl}
            onChange={(event) => setAudioUrl(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="https://example.com/audio.m4a"
            required
          />
          <p className="text-xs font-mono text-black/60">
            M4A形式、HTTPS必須、最大200MB
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-bold uppercase tracking-wider text-black">
            再生時間（ミリ秒） <span className="text-red-600">*</span>
          </label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="5000"
            min="1"
            max="60000"
            required
          />
          {duration && (
            <p className={`text-xs font-mono ${isValidDuration ? "text-black/60" : "text-red-600 font-bold"}`}>
              {isValidDuration
                ? `${(durationMs / 1000).toFixed(1)}秒`
                : "1〜60000ミリ秒（1〜60秒）の範囲で入力してください"}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          disabled={status === "sending" || !lineUserId || !audioUrl || !isValidDuration}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && (
          <p className="text-sm font-bold text-[#00B900]">音声メッセージを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      {/* Preview Section */}
      {audioUrl && isValidDuration && (
        <LineConversation
          message={{
            type: "audio",
            audioUrl,
            duration: durationMs,
          }}
        />
      )}

      {/* Debug Panel */}
      {audioUrl && isValidDuration && (
        <DebugPanel
          title="送信 API デバッグ"
          request={{ to: lineUserId, type: "audio", audioUrl, duration: durationMs }}
          response={undefined}
          curl={toCurl({
            url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { to: lineUserId, type: "audio", audioUrl, duration: durationMs }
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
        />
      )}
    </div>
  );
}
