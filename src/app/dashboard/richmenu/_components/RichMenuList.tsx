"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RichMenu {
  id: string;
  name: string;
  alias?: string;
  size: string;
  chatBarText: string;
  barDisplayed: boolean;
  isDefault: boolean;
  imageUrl?: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: { type: string; [key: string]: unknown };
  }>;
  selected: boolean;
  createdAt: string;
}

export function RichMenuList() {
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
      if (!response.ok) throw new Error("Failed to load rich menus");
      const data = await response.json();
      setRichMenus(data.richMenus || []);
    } catch (error) {
      toast.error("リッチメニューの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRichMenus();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: `「${name}」を削除しますか？`,
      message: "この操作は取り消せません。",
      type: "danger",
    });

    if (!confirmed) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete rich menu");

      toast.success("リッチメニューを削除しました");
      await loadRichMenus();
    } catch (error) {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    setSettingDefault(id);
    try {
      const response = await fetch(`/api/line/richmenu/${id}/default`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to set default");

      toast.success(`「${name}」をデフォルトに設定しました`);
      await loadRichMenus();
    } catch (error) {
      toast.error("デフォルト設定に失敗しました");
    } finally {
      setSettingDefault(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">リッチメニュー</h1>
          <p className="text-sm text-slate-400">
            LINE上に表示されるリッチメニューを管理します。
          </p>
        </div>
        <Link
          href="/dashboard/richmenu/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {richMenus.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-12 text-center">
          <p className="text-slate-400">リッチメニューが作成されていません</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {richMenus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{menu.name}</h3>
                    {menu.selected && (
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                        デフォルト
                      </span>
                    )}
                    {menu.isDefault && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                        初期表示
                      </span>
                    )}
                    {menu.alias && (
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                        @{menu.alias}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-400">
                      <span className="text-slate-500">サイズ:</span> {menu.size === "full" ? "フル (2500x1686)" : "ハーフ (2500x843)"}
                      {" "}・{" "}
                      <span className="text-slate-500">タップエリア:</span> {menu.areas?.length || 0}個
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="text-slate-500">チャットバー:</span> {menu.chatBarText}
                      {menu.barDisplayed ? " (表示)" : " (非表示)"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!menu.selected && (
                    <button
                      onClick={() => handleSetDefault(menu.id, menu.name)}
                      disabled={settingDefault === menu.id}
                      className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800/60 disabled:opacity-50"
                    >
                      {settingDefault === menu.id ? "設定中..." : "デフォルトに設定"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(menu.id, menu.name)}
                    disabled={deleting === menu.id}
                    className="rounded-md border border-red-600/50 bg-red-900/20 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-900/40 disabled:opacity-50"
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
