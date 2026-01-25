"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/lib/realtime/use-events";
import { ArrowUpRight } from "lucide-react";
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

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: { text?: string; type?: string };
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    lineUserId: string;
  };
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data: any = await res.json();
      setMessages(data.recentMessages || []);
      setRawData(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // リアルタイム更新
  useRealtimeEvents({
    "message:inbound": () => loadMessages(),
    "message:outbound": () => loadMessages(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-bold text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="font-bold text-red-600">{error}</p>
        <button
          onClick={loadMessages}
          className="rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>メッセージ履歴</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500] rounded-full" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          送受信されたすべてのメッセージの履歴を確認できます。
        </p>
      </header>

      {/* 最近のメッセージ */}
      <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>最近のメッセージ</h2>
          <button
            onClick={loadMessages}
            className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer"
          >
            再読込
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm font-bold text-gray-400">メッセージがありません</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {messages.map((msg) => (
              <li key={msg.id} className="flex items-start gap-4 py-3">
                <div
                  className={`mt-1 shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold uppercase ${
                    msg.direction === "INBOUND"
                      ? "bg-[#00B900] text-white"
                      : "bg-white text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8)]"
                  }`}
                >
                  {msg.direction === "INBOUND" ? "受信" : "送信"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-800 font-mono">
                    {msg.content.text || `(${msg.content.type || "非テキスト"})`}
                  </p>
                  <p className="mt-1 text-xs font-mono text-gray-500">
                    {msg.user.displayName || msg.user.lineUserId.slice(0, 8) + "..."} ・{" "}
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* API デバッグ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">API デバッグ</h2>
        <DebugPanel
          title="/api/dashboard/stats (recentMessages)"
          request={{}}
          curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dashboard/stats`, method: 'GET' })}
          response={rawData}
        />
      </section>
    </div>
  );
}
