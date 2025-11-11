"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

interface RichMenu {
  id: string;
  name: string;
  size: string;
  chatBarText: string;
  imageUrl?: string;
  selected: boolean;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export function RichMenuList() {
  const [richMenus, setRichMenus] = useState<RichMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [lastEndpoint, setLastEndpoint] = useState<string>("");
  const [lastMethod, setLastMethod] = useState<string>("GET");

  const formatSize = (size: string) => {
    const sizeMap: Record<string, string> = {
      "2500x1686": "大・フル (2500×1686px)",
      "2500x843": "大・ハーフ (2500×843px)",
      "1200x810": "中・フル (1200×810px)",
      "1200x405": "中・ハーフ (1200×405px)",
      "800x540": "小・フル (800×540px)",
      "800x270": "小・ハーフ (800×270px)",
      // Legacy support
      "full": "フル (2500×1686px)",
      "half": "ハーフ (2500×843px)",
    };
    return sizeMap[size] || size;
  };

  const loadRichMenus = async () => {
    setLoading(true);
    try {
      const endpoint = "/api/line/richmenu";
      setLastEndpoint(endpoint);
      setLastMethod("GET");
      setLastRequest(undefined);

      const response = await fetch(endpoint);
      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) throw new Error("Failed to load rich menus");
      setRichMenus(data.richMenus || []);
    } catch (error) {
      setLastResponse({ error: String(error) });
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
      const endpoint = `/api/line/richmenu/${id}`;
      setLastEndpoint(endpoint);
      setLastMethod("DELETE");
      setLastRequest(undefined);

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) throw new Error("Failed to delete rich menu");

      toast.success("リッチメニューを削除しました");
      await loadRichMenus();
    } catch (error) {
      setLastResponse({ error: String(error) });
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    setSettingDefault(id);
    try {
      const endpoint = `/api/line/richmenu/${id}/default`;
      setLastEndpoint(endpoint);
      setLastMethod("POST");
      setLastRequest(undefined);

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) throw new Error("Failed to set default");

      toast.success(`「${name}」をデフォルトに設定しました`);
      await loadRichMenus();
    } catch (error) {
      setLastResponse({ error: String(error) });
      toast.error("デフォルト設定に失敗しました");
    } finally {
      setSettingDefault(null);
    }
  };

  const handlePublish = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: `「${name}」を公開しますか？`,
      message: "LINE APIに登録され、ユーザーに設定できるようになります。",
      type: "info",
    });

    if (!confirmed) return;

    setPublishing(id);
    try {
      const endpoint = `/api/line/richmenu/${id}/publish`;
      setLastEndpoint(endpoint);
      setLastMethod("POST");
      setLastRequest(undefined);

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      toast.success(`「${name}」を公開しました`);
      await loadRichMenus();
    } catch (error) {
      setLastResponse({ error: String(error) });
      toast.error(error instanceof Error ? error.message : "公開に失敗しました");
    } finally {
      setPublishing(null);
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
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{menu.name}</h3>
                    {menu.status === "DRAFT" ? (
                      <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-300">
                        下書き
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                        公開済み
                      </span>
                    )}
                    {menu.selected && (
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                        デフォルト
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    サイズ: {formatSize(menu.size)} ・ チャットバー: {menu.chatBarText}
                  </p>
                </div>
                <div className="flex gap-2">
                  {menu.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(menu.id, menu.name)}
                      disabled={publishing === menu.id || !menu.imageUrl}
                      className="rounded-md border border-green-600/50 bg-green-900/20 px-3 py-1.5 text-sm text-green-300 transition hover:bg-green-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                      title={!menu.imageUrl ? "画像が設定されていません" : ""}
                    >
                      {publishing === menu.id ? "公開中..." : "公開"}
                    </button>
                  )}
                  {menu.status === "PUBLISHED" && !menu.selected && (
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

      <DebugPanel
        title="リッチメニュー API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL(lastEndpoint, typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: lastMethod,
          headers: lastRequest ? { 'Content-Type': 'application/json' } : undefined,
          body: lastRequest,
        })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#rich-menu"
      />
    </div>
  );
}
