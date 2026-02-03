"use client";

import { useRef, useState } from "react";
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

export default function MessagesImagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [uploading, setUploading] = useState(false);
  const [linkPreview, setLinkPreview] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const pickFile = () => inputRef.current?.click();
  const onFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'アップロードに失敗しました');
      setOriginalUrl(data.secure_url);
      if (linkPreview) setPreviewUrl(data.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (ev) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files?.[0];
    if (file) await onFile(file);
  };
  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = async (ev) => {
    const file = ev.clipboardData.files?.[0];
    if (file) await onFile(file);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>画像メッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500] rounded-full" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          画像を送信できます。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-800">LINE ユーザー ID</label>
          <input
            value={lineUserId}
            onChange={(e) => setLineUserId(e.target.value)}
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-800">画像URL（originalContentUrl）</label>
          <input
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            required
          />
          <p className="text-xs font-mono text-gray-500">https の直リンク。LINEの仕様に沿ったサイズ/形式の画像URLを指定してください。</p>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onPaste={onPaste}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-[#e8f5e9] p-4 text-center text-sm text-gray-700"
        >
          <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={(e) => { const f=e.target.files?.[0]; if (f) void onFile(f); }} />
          <p className="mb-2 font-bold">画像ファイルをドロップ or 貼り付け（Cmd/Ctrl+V）</p>
          <button type="button" className="rounded-xl bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]" onClick={pickFile} disabled={uploading}>{uploading ? 'アップロード中...' : 'ファイルを選択'}</button>
          <p className="mt-2 text-xs font-mono text-gray-500">Cloudinary が設定されている場合、アップロードして URL を自動入力します。</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-800">プレビュー画像URL（previewImageUrl 任意）</label>
          <input
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
          />
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <input
              type="checkbox"
              checked={linkPreview}
              onChange={(e) => {
                const checked = e.target.checked;
                setLinkPreview(checked);
                if (checked && originalUrl) {
                  setPreviewUrl(originalUrl);
                } else if (!checked) {
                  setPreviewUrl("");
                }
              }}
              className="w-4 h-4 rounded cursor-pointer accent-[#00B900]"
            />
            <span>プレビュー画像URLを original と同じにする</span>
          </div>
          <p className="text-xs font-mono text-gray-500">未指定の場合、LINE側で original をサムネイル表示することがあります。</p>
        </div>
        {/* 画像のサムネイルプレビュー（会話プレビューで代替するため省略） */}
        <LineConversation direction={'outbound'} displayName={'Bot'} message={{ type: 'image', originalContentUrl: originalUrl, previewImageUrl: (previewUrl || (linkPreview ? originalUrl : undefined)) || undefined }} />
        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
          disabled={status === "sending"}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && <p className="text-sm font-bold text-[#00B900]">送信しました。</p>}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      <DebugPanel
        title="送信 API デバッグ（image）"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({ url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: lastRequest })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
      />
    </div>
  );
}
