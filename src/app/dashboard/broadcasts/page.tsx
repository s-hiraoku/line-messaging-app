"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../_components/debug-panel";
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

export default function BroadcastsPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const send = async () => {
    setStatus("sending");
    setError(null);
    try {
      const payload = { message, name: "dashboard" };
      setLastRequest(payload);
      const res = await fetch("/api/line/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as unknown;
      setLastResponse(data);
      if (!res.ok) throw new Error("送信に失敗しました");
      setStatus("sent");
      setMessage("");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "不明なエラー");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>配信（ブロードキャスト）</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          テキストの一斉送信を試験できます。
        </p>
      </header>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="配信メッセージ"
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#00B900]/30 transition-all"
        />
        <button onClick={send} disabled={!message || status === "sending"}
          className="rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60">
          {status === "sending" ? "送信中..." : "配信する"}
        </button>
        {status === "sent" && <p className="text-sm font-bold text-[#00B900]">配信しました。</p>}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </div>

      <DebugPanel
        title="ブロードキャスト API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({ url: new URL('/api/line/broadcast', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: lastRequest })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message"
      />
    </div>
  );
}
