"use client";

import { useEffect, useState } from "react";
import { DebugPanel, toCurl } from "../_components/debug-panel";

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
      <header className="space-y-1">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">テンプレート</h1>
        <p className="text-sm text-black/60">テキストテンプレートの作成と一覧</p>
      </header>

      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid gap-3 sm:grid-cols-[240px_1fr_auto]">
          <input placeholder="テンプレート名" value={name} onChange={(e) => setName(e.target.value)}
            className="border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all" />
          <input placeholder="本文 (TEXT)" value={text} onChange={(e) => setText(e.target.value)}
            className="border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all" />
          <button onClick={create} disabled={saving || !name || !text}
            className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "作成中..." : "作成"}</button>
        </div>
      </div>

      <div className="overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-white">
            <tr>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">名前</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">タイプ</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">本文</th>
              <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">作成日時</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t-2 border-black hover:bg-[#FFFEF5]">
                <td className="px-4 py-2 font-bold text-black">{t.name}</td>
                <td className="px-4 py-2 font-mono text-black">{t.type}</td>
                <td className="px-4 py-2 truncate max-w-[360px] text-black/60">{t.content?.text ?? ""}</td>
                <td className="px-4 py-2 font-mono text-black/60">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center font-bold uppercase tracking-wider text-black/40" colSpan={4}>テンプレートがありません</td>
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
