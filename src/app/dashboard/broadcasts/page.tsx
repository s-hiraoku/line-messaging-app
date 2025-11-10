"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../_components/debug-panel";

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
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">配信（ブロードキャスト）</h1>
        <p className="text-sm text-slate-500">テキストの一斉送信を試験できます。</p>
      </header>

      <div className="max-w-xl space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm text-slate-100">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="配信メッセージ"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <button onClick={send} disabled={!message || status === "sending"}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90">
          {status === "sending" ? "送信中..." : "配信する"}
        </button>
        {status === "sent" && <p className="text-sm text-emerald-600">配信しました。</p>}
        {status === "error" && error && <p className="text-sm text-red-600">{error}</p>}
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
