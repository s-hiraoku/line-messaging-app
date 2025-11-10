"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface RichMenu {
  id: string;
  name: string;
  size: string;
  chatBarText: string;
  imageUrl?: string;
  selected: boolean;
  createdAt: string;
}

export default function RichMenuPage() {
  const [richMenus, setRichMenus] = useState<RichMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadRichMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/line/richmenu");
      if (response.ok) {
        const data = await response.json();
        setRichMenus(data.richMenus || []);
      } else {
        setError("リッチメニューの読み込みに失敗しました");
      }
    } catch (err) {
      console.error("Failed to load rich menus:", err);
      setError("リッチメニューの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("このリッチメニューを削除しますか？")) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadRichMenus();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete rich menu:", error);
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    loadRichMenus();
  }, [loadRichMenus]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">リッチメニュー管理</h1>
          <p className="text-sm text-slate-400">
            LINEチャット画面下部に表示されるメニューを管理します。
          </p>
        </div>
        <Link
          href="/dashboard/richmenu/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規作成
        </Link>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">読み込み中...</div>
        </div>
      ) : richMenus.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-12 text-center shadow-lg backdrop-blur-sm">
          <svg
            className="mx-auto h-12 w-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">リッチメニューがありません</h3>
          <p className="mt-2 text-sm text-slate-400">
            新規作成ボタンからリッチメニューを作成してください。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {richMenus.map((menu) => (
            <div
              key={menu.id}
              className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/40 shadow-lg backdrop-blur-sm transition hover:border-slate-600"
            >
              {menu.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-white">{menu.name}</h3>
                    {menu.selected && (
                      <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                        デフォルト
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-slate-400">
                    <div>
                      サイズ: {menu.size === "full" ? "フル (2500x1686)" : "ハーフ (2500x843)"}
                    </div>
                    <div>バーテキスト: {menu.chatBarText}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(menu.id)}
                    disabled={deleting === menu.id}
                    className="flex-1 rounded border border-red-600/50 bg-red-600/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting === menu.id ? "削除中..." : "削除"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
