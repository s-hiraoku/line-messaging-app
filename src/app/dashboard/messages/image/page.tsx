"use client";

import { useRef, useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { LineConversation } from "../_components/line-conversation";

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
  const [previewSide, setPreviewSide] = useState<'left' | 'right'>('left');

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
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>プレビュー方向:</span>
          <label className="inline-flex items-center gap-1"><input type="radio" name="pvdir" checked={previewSide==='left'} onChange={()=>setPreviewSide('left')} /> 左</label>
          <label className="inline-flex items-center gap-1"><input type="radio" name="pvdir" checked={previewSide==='right'} onChange={()=>setPreviewSide('right')} /> 右</label>
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
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onPaste={onPaste}
          className="rounded-lg border border-dashed border-slate-700 bg-slate-900 p-4 text-center text-sm text-slate-400"
        >
          <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={(e) => { const f=e.target.files?.[0]; if (f) void onFile(f); }} />
          <p className="mb-2">画像ファイルをドロップ or 貼り付け（Cmd/Ctrl+V）</p>
          <button type="button" className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500" onClick={pickFile} disabled={uploading}>{uploading ? 'アップロード中...' : 'ファイルを選択'}</button>
          <p className="mt-2 text-xs text-slate-500">Cloudinary が設定されている場合、アップロードして URL を自動入力します。</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">プレビュー画像URL（previewImageUrl 任意）</label>
          <input
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={linkPreview} onChange={(e)=> setLinkPreview(e.target.checked)} />
            <span>プレビュー画像URLを original と同じにする</span>
          </div>
          <p className="text-xs text-slate-400">未指定の場合、LINE側で original をサムネイル表示することがあります。</p>
        </div>
        {(originalUrl || previewUrl) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {originalUrl && (
              <div className="rounded border border-slate-800 bg-slate-950 p-2">
                <p className="mb-1 text-xs text-slate-400">original</p>
                <img src={originalUrl} alt="original" className="max-h-48 w-full object-contain" />
              </div>
            )}
            {previewUrl && (
              <div className="rounded border border-slate-800 bg-slate-950 p-2">
                <p className="mb-1 text-xs text-slate-400">preview</p>
                <img src={previewUrl} alt="preview" className="max-h-48 w-full object-contain" />
              </div>
            )}
          </div>
        )}
        <LineConversation direction={previewSide==='left' ? 'inbound' : 'outbound'} displayName={previewSide==='left' ? 'hiraoku' : 'あなた'} message={{ type: 'image', originalContentUrl: originalUrl, previewImageUrl: (previewUrl || (linkPreview ? originalUrl : undefined)) || undefined }} />
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
