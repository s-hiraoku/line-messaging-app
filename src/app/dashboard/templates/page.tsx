"use client";

import { useEffect, useState } from "react";

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

  const load = async () => {
    const res = await fetch("/api/templates");
    const data = (await res.json()) as { items: Template[] };
    setItems(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "TEXT", content: { text } }),
      });
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

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[240px_1fr_auto]">
          <input placeholder="テンプレート名" value={name} onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          <input placeholder="本文 (TEXT)" value={text} onChange={(e) => setText(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          <button onClick={create} disabled={saving || !name || !text}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "作成中..." : "作成"}</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
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
                <td className="px-4 py-2 truncate max-w-[360px]">{t.content?.text ?? ""}</td>
                <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
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
    </div>
  );
}
