"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  const loadRichMenus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/line/richmenu");
      if (response.ok) {
        const data = await response.json();
        setRichMenus(data.richMenus || []);
      }
    } catch (error) {
      console.error("Failed to load rich menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "リッチメニューを削除",
      message: "このリッチメニューを削除してもよろしいですか？この操作は取り消せません。",
      confirmText: "削除",
      type: "danger",
    });

    if (!confirmed) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadRichMenus();
        toast.success("リッチメニューを削除しました");
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete rich menu:", error);
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}/default`, {
        method: "POST",
      });

      if (response.ok) {
        await loadRichMenus();
        toast.success("デフォルトメニューに設定しました");
      } else {
        const data = await response.json();
        toast.error(data.error || "デフォルト設定に失敗しました");
      }
    } catch (error) {
      console.error("Failed to set default rich menu:", error);
      toast.error("デフォルト設定に失敗しました");
    } finally {
      setSettingDefault(null);
    }
  };

  const handleCancelDefault = async (id: string) => {
    setSettingDefault(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}/default`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadRichMenus();
        toast.success("デフォルト設定を解除しました");
      } else {
        const data = await response.json();
        toast.error(data.error || "デフォルト解除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to cancel default rich menu:", error);
      toast.error("デフォルト解除に失敗しました");
    } finally {
      setSettingDefault(null);
    }
  };

  useEffect(() => {
    loadRichMenus();
  }, []);

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

      {loading ? (
        <LoadingSpinner text="読み込み中..." />
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {menu.selected ? (
                      <button
                        onClick={() => handleCancelDefault(menu.id)}
                        disabled={settingDefault === menu.id}
                        className="flex-1 rounded border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {settingDefault === menu.id ? "解除中..." : "デフォルト解除"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(menu.id)}
                        disabled={settingDefault === menu.id}
                        className="flex-1 rounded border border-blue-600/50 bg-blue-600/10 px-3 py-2 text-sm text-blue-400 transition hover:bg-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {settingDefault === menu.id ? "設定中..." : "デフォルト設定"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(menu.id)}
                      disabled={deleting === menu.id}
                      className="rounded border border-red-600/50 bg-red-600/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting === menu.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
