"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { LineConversation } from "../_components/line-conversation";
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

export default function MessagesTextPage() {
  const [lineUserId, setLineUserId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const payload = { to: lineUserId, messages: [{ type: "text", text: message }] };
      setLastRequest(payload);
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>テキストメッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          個別のユーザーにテキストメッセージを送信できます。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-black">LINE ユーザー ID</label>
          <input id="lineUserId" type="text" value={lineUserId} onChange={(e) => setLineUserId(e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-black">メッセージ本文</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)}
            className="h-24 w-full border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            placeholder="こんにちは！" required />
        </div>
        <LineConversation direction={'inbound'} displayName={'ユーザー'} message={{ type: 'text', text: message }} />
        <button type="submit" className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none" disabled={status === "sending"}>
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && <p className="text-sm font-bold text-[#00B900]">メッセージを送信しました。</p>}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      <DebugPanel
        title="送信 API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({ url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: lastRequest })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
      />
    </div>
  );
}
