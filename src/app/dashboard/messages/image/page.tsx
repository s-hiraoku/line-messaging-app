"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

type Status = "idle" | "sending" | "success" | "error";

export default function MessagesImagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const msg: any = { type: "image", originalContentUrl: originalUrl.trim() };
      if (previewUrl.trim()) msg.previewImageUrl = previewUrl.trim();
      const payload = { to: lineUserId.trim(), messages: [msg] };
      setLastRequest(payload);
      const res = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponse(data);
      if (!res.ok) throw new Error((data as any).error ?? "送信に失敗しました");
      setStatus("success");
      setOriginalUrl("");
      setPreviewUrl("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl rounded-lg border border-slate-800/60 bg-slate-900/60 p-6 shadow-sm text-slate-100">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">LINE ユーザー ID</label>
          <input
            value={lineUserId}
            onChange={(e) => setLineUserId(e.target.value)}
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">画像URL（originalContentUrl）</label>
          <input
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            required
          />
          <p className="text-xs text-slate-400">https の直リンク。LINEの仕様に沿ったサイズ/形式の画像URLを指定してください。</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">プレビュー画像URL（previewImageUrl 任意）</label>
          <input
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-400">未指定の場合、LINE側で original をサムネイル表示することがあります。</p>
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90"
          disabled={status === "sending"}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && <p className="text-sm text-emerald-400">送信しました。</p>}
        {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <DebugPanel
        title="送信 API デバッグ（image）"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({ url: new URL('/api/line/send', location.origin).toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: lastRequest })}
      />
    </div>
  );
}

