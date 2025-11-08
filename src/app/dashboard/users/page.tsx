"use client";

import { useEffect, useMemo, useState } from "react";
import { DebugPanel, toCurl } from "../_components/debug-panel";

type User = {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  isFollowing: boolean;
  createdAt: string;
  lastMessageAt: string | null;
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [showRawIds, setShowRawIds] = useState(false);
  const [lastUrl, setLastUrl] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [bfSaving, setBfSaving] = useState(false);
  const [bfLimit, setBfLimit] = useState(1000);
  const [bfPages, setBfPages] = useState(1);
  const [bfSyncProfile, setBfSyncProfile] = useState(false);
  const [bfRequest, setBfRequest] = useState<unknown>();
  const [bfResponse, setBfResponse] = useState<unknown>();

  const load = async (initial = false) => {
    setLoading(true);
    try {
      const url = new URL("/api/users", location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      if (!initial && cursor) url.searchParams.set("cursor", cursor);
      url.searchParams.set("take", "50");
      setLastUrl(url.toString());
      const res = await fetch(url);
      const data = (await res.json()) as { items: User[]; nextCursor?: string | null };
      setLastResponse(data);
      setItems((prev) => (initial ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = useMemo(() => Boolean(cursor), [cursor]);

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
          onKeyDown={(e) => e.key === "Enter" && load(true)}
          placeholder="displayName / lineUserId / email"
          className="w-64 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <button onClick={() => load(true)} disabled={loading} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-slate-300">{loading ? "検索中..." : "検索"}</button>
        <label className="ml-2 inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showRawIds} onChange={(e) => setShowRawIds(e.target.checked)} className="cursor-pointer" />
          lineUserId を生表示
        </label>
      </div>

      <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 text-slate-100">
        <h2 className="mb-2 text-sm font-semibold text-slate-300">フォロワー取り込み（バックフィル）</h2>
        <div className="grid gap-3 sm:grid-cols-[140px_140px_1fr_auto] items-end">
          <label className="text-xs">
            <span className="mb-1 block text-slate-400">最大件数/ページ</span>
            <input type="number" min={1} max={1000} value={bfLimit} onChange={(e) => setBfLimit(Number(e.target.value) || 1000)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </label>
          <label className="text-xs">
            <span className="mb-1 block text-slate-400">ページ数</span>
            <input type="number" min={1} max={50} value={bfPages} onChange={(e) => setBfPages(Number(e.target.value) || 1)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={bfSyncProfile} onChange={(e) => setBfSyncProfile(e.target.checked)} className="cursor-pointer" /> プロフィールも取得
          </label>
          <button
            onClick={async () => {
              setBfSaving(true);
              const payload = { limitPerPage: bfLimit, maxPages: bfPages, syncProfile: bfSyncProfile };
              setBfRequest(payload);
              try {
                const res = await fetch('/api/line/followers/backfill', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const data = await res.json().catch(() => ({}));
                setBfResponse(data);
                if (!res.ok) throw new Error('バックフィルに失敗しました');
                await load(true);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
              } finally { setBfSaving(false); }
            }}
            disabled={bfSaving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90"
          >{bfSaving ? '実行中...' : '取り込む'}</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/60 text-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-4 py-2">表示名</th>
              <th className="px-4 py-2">LINE UserId</th>
              <th className="px-4 py-2">フォロー</th>
              <th className="px-4 py-2">作成日時</th>
              <th className="px-4 py-2">最終メッセージ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.displayName || "-"}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  {showRawIds ? (
                    u.lineUserId
                  ) : (
                    <span>{u.lineUserId.slice(0, 6)}***{u.lineUserId.slice(-4)}</span>
                  )}
                </td>
                <td className="px-4 py-2">{u.isFollowing ? "✔" : "✕"}</td>
                <td className="px-4 py-2 text-slate-300">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-slate-300">{u.lastMessageAt ? new Date(u.lastMessageAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>ユーザーが見つかりません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <button onClick={() => load(false)} disabled={!hasMore || loading}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-slate-300">
          {loading ? "読み込み中..." : hasMore ? "さらに読み込む" : "すべて取得済み"}
        </button>
      </div>

      <DebugPanel
        title="ユーザー一覧 API デバッグ"
        request={{ url: lastUrl }}
        response={lastResponse}
        curl={lastUrl ? toCurl({ url: lastUrl }) : null}
      />

      <div className="mt-4">
        <DebugPanel
          title="バックフィル API デバッグ"
          request={bfRequest}
          response={bfResponse}
          curl={toCurl({ url: new URL('/api/line/followers/backfill', location.origin).toString(), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bfRequest })}
        />
      </div>
    </div>
  );
}
