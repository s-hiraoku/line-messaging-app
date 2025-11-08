"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  isFollowing: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/users", location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      const res = await fetch(url);
      const data = (await res.json()) as { items: User[] };
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">ユーザー</h1>
        <p className="text-sm text-slate-500">友だち一覧と検索</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="displayName / lineUserId / email"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button onClick={load} disabled={loading} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
          {loading ? "検索中..." : "検索"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2">表示名</th>
              <th className="px-4 py-2">LINE UserId</th>
              <th className="px-4 py-2">フォロー</th>
              <th className="px-4 py-2">作成日時</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.displayName || "-"}</td>
                <td className="px-4 py-2 font-mono text-xs">{u.lineUserId}</td>
                <td className="px-4 py-2">{u.isFollowing ? "✔" : "✕"}</td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>ユーザーが見つかりません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
