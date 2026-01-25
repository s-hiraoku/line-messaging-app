"use client";

import { useEffect, useState } from "react";
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

type Template = {
  id: string;
  name: string;
  type: string;
  content: any;
  isActive: boolean;
  createdAt: string;
};

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastListUrl, setLastListUrl] = useState<string>("");
  const [lastListResponse, setLastListResponse] = useState<unknown>();
  const [lastCreateRequest, setLastCreateRequest] = useState<unknown>();
  const [lastCreateResponse, setLastCreateResponse] = useState<unknown>();

  const load = async () => {
    const url = new URL("/api/templates", typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString();
    setLastListUrl(url);
    const res = await fetch(url);
    const data = (await res.json()) as { items: Template[] };
    setLastListResponse(data);
    setItems(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      const payload = { name, type: "TEXT" as const, content: { text } };
      setLastCreateRequest(payload);
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as unknown;
      setLastCreateResponse(data);
      if (!res.ok) throw new Error("作成に失敗しました");
      setName("");
      setText("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>メッセージテンプレート</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          よく使うメッセージをテンプレートとして保存・管理できます。
        </p>
      </header>

      <div className="rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="grid gap-3 sm:grid-cols-[240px_1fr_auto]">
          <input placeholder="テンプレート名" value={name} onChange={(e) => setName(e.target.value)}
            className="rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#00B900]/30 transition-all" />
          <input placeholder="本文 (TEXT)" value={text} onChange={(e) => setText(e.target.value)}
            className="rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#00B900]/30 transition-all" />
          <button onClick={create} disabled={saving || !name || !text}
            className="rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "作成中..." : "作成"}</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-white">
            <tr>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800">名前</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800">タイプ</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800">本文</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800">作成日時</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-gray-200 hover:bg-[#e8f5e9]">
                <td className="px-4 py-2 font-bold text-gray-800">{t.name}</td>
                <td className="px-4 py-2 font-mono text-gray-800">{t.type}</td>
                <td className="px-4 py-2 truncate max-w-[360px] text-gray-500">{t.content?.text ?? ""}</td>
                <td className="px-4 py-2 font-mono text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center font-bold uppercase tracking-wider text-gray-400" colSpan={4}>テンプレートがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DebugPanel
          title="テンプレート作成 API デバッグ"
          request={lastCreateRequest}
          response={lastCreateResponse}
          curl={toCurl({ url: new URL('/api/templates', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: lastCreateRequest })}
        />
        <DebugPanel
          title="テンプレート一覧 API デバッグ"
          request={{ url: lastListUrl }}
          response={lastListResponse}
          curl={lastListUrl ? toCurl({ url: lastListUrl }) : null}
        />
      </div>
    </div>
  );
}
