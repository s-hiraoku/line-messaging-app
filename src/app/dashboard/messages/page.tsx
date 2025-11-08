"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function MessagesPage() {
  const [lineUserId, setLineUserId] = useState("");
  const [message, setMessage] = useState("");
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

  return (
    <div className="max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">メッセージ送信</h1>
        <p className="text-sm text-slate-500">
          LINE ユーザー ID を指定して簡単なテキストメッセージを送信できます。
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-700">
            LINE ユーザー ID
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-700">
            メッセージ本文
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="こんにちは！"
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === "sending"}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && (
          <p className="text-sm text-green-600">メッセージを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
