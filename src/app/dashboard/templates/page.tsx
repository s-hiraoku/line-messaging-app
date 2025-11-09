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
        <h1 className="text-2xl font-semibold">テンプレート</h1>
        <p className="text-sm text-slate-500">テキストテンプレートの作成と一覧</p>
      </header>

      <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm text-slate-100">
        <div className="grid gap-3 sm:grid-cols-[240px_1fr_auto]">
          <input placeholder="テンプレート名" value={name} onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input placeholder="本文 (TEXT)" value={text} onChange={(e) => setText(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <button onClick={create} disabled={saving || !name || !text}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90">{saving ? "作成中..." : "作成"}</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/60 text-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-4 py-2">名前</th>
              <th className="px-4 py-2">タイプ</th>
              <th className="px-4 py-2">本文</th>
              <th className="px-4 py-2">作成日時</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2 truncate max-w-[360px] text-slate-300">{t.content?.text ?? ""}</td>
                <td className="px-4 py-2 text-slate-300">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>テンプレートがありません</td>
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
