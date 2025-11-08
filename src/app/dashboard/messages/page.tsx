"use client";

import { useEffect, useMemo, useState } from "react";
import { useRealtimeEvents } from "@/lib/realtime/use-events";

type Status = "idle" | "sending" | "success" | "error";

type Msg = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: { text?: string };
  createdAt: string;
  user: { id: string; lineUserId: string; displayName: string };
};

export default function MessagesPage() {
  const [lineUserId, setLineUserId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Msg[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (initial = false) => {
    setLoading(true);
    try {
      const url = new URL("/api/messages", location.origin);
      url.searchParams.set("take", "20");
      if (!initial && cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url);
      const data = (await res.json()) as { items: Msg[]; nextCursor: string | null };
      setItems((prev) => (initial ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
  }, []);

  useRealtimeEvents({
    "message:inbound": (e) => {
      setItems((prev) => [{
        id: `tmp-${Date.now()}`,
        direction: "INBOUND",
        content: { text: e.text },
        createdAt: e.createdAt,
        user: { id: e.userId, lineUserId: "", displayName: "" },
      }, ...prev]);
    },
    "message:outbound": (e) => {
      setItems((prev) => [{
        id: `tmp-${Date.now()}`,
        direction: "OUTBOUND",
        content: { text: e.text },
        createdAt: e.createdAt,
        user: { id: e.userId, lineUserId: "", displayName: "" },
      }, ...prev]);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: lineUserId, message }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "メッセージの送信に失敗しました");
      }
      setStatus("success");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const hasMore = useMemo(() => Boolean(cursor), [cursor]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">メッセージ</h1>
        <p className="text-sm text-slate-500">送受信履歴と簡易送信の検証ができます。</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-700">LINE ユーザー ID</label>
          <input id="lineUserId" type="text" value={lineUserId} onChange={(e) => setLineUserId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-700">メッセージ本文</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)}
            className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="こんにちは！" required />
        </div>
        <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={status === "sending"}>
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && <p className="text-sm text-green-600">メッセージを送信しました。</p>}
        {status === "error" && error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">最近のメッセージ</h2>
        <ul className="divide-y divide-slate-100">
          {items.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-800">{m.content?.text ?? "(非テキスト)"}</p>
                <p className="mt-1 text-xs text-slate-500">{m.direction === "INBOUND" ? "受信" : "送信"} ・ {new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${m.direction === "INBOUND" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                {m.direction === "INBOUND" ? "IN" : "OUT"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <button onClick={() => load(false)} disabled={!hasMore || loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "読み込み中..." : hasMore ? "さらに読み込む" : "すべて取得済み"}
          </button>
        </div>
      </section>
    </div>
  );
}
