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
        <p className="font-bold text-black/60">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="font-bold text-red-600">{error}</p>
        <button
          onClick={loadMessages}
          className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
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
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>メッセージ履歴</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          送受信されたすべてのメッセージの履歴を確認できます。
        </p>
      </header>

      {/* 最近のメッセージ */}
      <section className="border-2 border-black bg-[#FFFEF5] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>最近のメッセージ</h2>
          <button
            onClick={loadMessages}
            className="inline-flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            再読込
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm font-bold text-black/40">メッセージがありません</p>
        ) : (
          <ul className="divide-y-2 divide-black">
            {messages.map((msg) => (
              <li key={msg.id} className="flex items-start gap-4 py-3">
                <div
                  className={`mt-1 shrink-0 border-2 border-black px-2 py-0.5 text-xs font-bold uppercase ${
                    msg.direction === "INBOUND"
                      ? "bg-[#00B900] text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {msg.direction === "INBOUND" ? "受信" : "送信"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-black font-mono">
                    {msg.content.text || `(${msg.content.type || "非テキスト"})`}
                  </p>
                  <p className="mt-1 text-xs font-mono text-black/60">
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
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">API デバッグ</h2>
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
