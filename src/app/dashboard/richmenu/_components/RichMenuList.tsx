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
          <h1 className="text-lg font-bold uppercase tracking-wider text-gray-800">リッチメニュー</h1>
          <p className="text-xs font-mono text-gray-500">
            LINE上に表示されるリッチメニューを管理します。
          </p>
        </div>
        <Link
          href="/dashboard/richmenu/new"
          className="inline-flex items-center rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
        >
          新規作成
        </Link>
      </div>

      {richMenus.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="font-mono text-gray-500">リッチメニューが作成されていません</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {richMenus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-[#e8f5e9]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800">{menu.name}</h3>
                    {menu.status === "DRAFT" ? (
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold uppercase text-gray-700 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                        下書き
                      </span>
                    ) : (
                      <span className="rounded-lg bg-[#00B900] px-2 py-1 text-xs font-bold uppercase text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                        公開済み
                      </span>
                    )}
                    {menu.selected && (
                      <span className="rounded-lg bg-[#00B900] px-2 py-1 text-xs font-bold uppercase text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                        デフォルト
                      </span>
                    )}
                    {menu.isDefault && (
                      <span className="rounded-lg bg-[#00B900] px-2 py-1 text-xs font-bold uppercase text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                        初期表示
                      </span>
                    )}
                    {menu.alias && (
                      <span className="rounded-lg bg-[#FFE500] px-2 py-1 text-xs font-bold uppercase text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                        @{menu.alias}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-mono text-gray-700">
                      <span className="font-bold">サイズ:</span> {menu.size === "full" ? "フル (2500x1686)" : "ハーフ (2500x843)"}
                      {" "}・{" "}
                      <span className="font-bold">タップエリア:</span> {menu.areas?.length || 0}個
                    </p>
                    <p className="text-sm font-mono text-gray-700">
                      <span className="font-bold">チャットバー:</span> {menu.chatBarText}
                      {menu.barDisplayed ? " (表示)" : " (非表示)"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {menu.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(menu.id, menu.name)}
                      disabled={publishing === menu.id || !menu.imageUrl}
                      className="rounded-xl bg-[#00B900] px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                      title={!menu.imageUrl ? "画像が設定されていません" : ""}
                    >
                      {publishing === menu.id ? "公開中..." : "公開"}
                    </button>
                  )}
                  {menu.status === "PUBLISHED" && !menu.selected && (
                    <button
                      onClick={() => handleSetDefault(menu.id, menu.name)}
                      disabled={settingDefault === menu.id}
                      className="rounded-xl bg-white px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] disabled:opacity-50"
                    >
                      {settingDefault === menu.id ? "設定中..." : "デフォルトに設定"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(menu.id, menu.name)}
                    disabled={deleting === menu.id}
                    className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] disabled:opacity-50"
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
