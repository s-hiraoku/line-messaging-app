"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DebugPanel, toCurl } from "../_components/debug-panel";

interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  richMenuId?: string;
  createdAt: string;
}

interface RichMenu {
  id: string;
  richMenuId: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [richMenus, setRichMenus] = useState<RichMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingMenu, setSettingMenu] = useState<string | null>(null);
  const toast = useToast();

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [lastEndpoint, setLastEndpoint] = useState<string>("");
  const [lastMethod, setLastMethod] = useState<string>("GET");

  const loadUsers = async () => {
    try {
      const endpoint = "/api/line/users";
      setLastEndpoint(endpoint);
      setLastMethod("GET");
      setLastRequest(undefined);

      const response = await fetch(endpoint);
      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      setLastResponse({ error: String(error) });
    }
  };

  const loadRichMenus = async () => {
    try {
      const response = await fetch("/api/line/richmenu");
      if (response.ok) {
        const data = await response.json();
        setRichMenus(
          data.richMenus
            .filter((menu: any) => menu.richMenuId && menu.status === "PUBLISHED")
            .map((menu: any) => ({
              id: menu.id,
              richMenuId: menu.richMenuId,
              name: menu.name,
            }))
        );
      }
    } catch (error) {
      console.error("Failed to load rich menus:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadRichMenus()]);
    setLoading(false);
  };

  const handleSetRichMenu = async (userId: string, richMenuId: string) => {
    setSettingMenu(userId);
    try {
      const endpoint = `/api/line/richmenu/${richMenuId}/users/${userId}`;
      setLastEndpoint(endpoint);
      setLastMethod("POST");
      setLastRequest(undefined);

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        await loadUsers();
        toast.success("リッチメニューを設定しました");
      } else {
        toast.error(data.error || "リッチメニューの設定に失敗しました");
      }
    } catch (error) {
      console.error("Failed to set rich menu:", error);
      setLastResponse({ error: String(error) });
      toast.error("リッチメニューの設定に失敗しました");
    } finally {
      setSettingMenu(null);
    }
  };

  const handleUnlinkRichMenu = async (userId: string, richMenuId: string) => {
    setSettingMenu(userId);
    try {
      const endpoint = `/api/line/richmenu/${richMenuId}/users/${userId}`;
      setLastEndpoint(endpoint);
      setLastMethod("DELETE");
      setLastRequest(undefined);

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        await loadUsers();
        toast.success("リッチメニューの設定を解除しました");
      } else {
        toast.error(data.error || "リッチメニューの解除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to unlink rich menu:", error);
      setLastResponse({ error: String(error) });
      toast.error("リッチメニューの解除に失敗しました");
    } finally {
      setSettingMenu(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">ユーザー管理</h1>
        <p className="text-sm text-slate-400">
          LINEユーザーの一覧とリッチメニュー設定を管理します。
        </p>
      </header>

      {loading ? (
        <LoadingSpinner text="読み込み中..." />
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-12 text-center shadow-lg backdrop-blur-sm">
          <UserIcon className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-white">ユーザーがいません</h3>
          <p className="mt-2 text-sm text-slate-400">
            LINEでボットを友だち追加したユーザーがここに表示されます。
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/40 shadow-lg backdrop-blur-sm">
          <table className="w-full">
            <thead className="border-b border-slate-700/50 bg-slate-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  リッチメニュー
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((user) => {
                const currentMenu = richMenus.find((m) => m.richMenuId === user.richMenuId);

                return (
                  <tr key={user.id} className="hover:bg-slate-900/20">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.pictureUrl ? (
                          <img
                            src={user.pictureUrl}
                            alt={user.displayName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                            <UserIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{user.displayName}</div>
                          <div className="text-xs text-slate-500">{user.lineUserId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4">
                      {currentMenu ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={currentMenu.id}
                            onChange={(e) => handleSetRichMenu(user.id, e.target.value)}
                            disabled={settingMenu === user.id}
                            className="rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {richMenus.map((menu) => (
                              <option key={menu.id} value={menu.id}>
                                {menu.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUnlinkRichMenu(user.id, currentMenu.id)}
                            disabled={settingMenu === user.id}
                            className="rounded border border-red-600/50 bg-red-600/10 px-2 py-1 text-xs text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {settingMenu === user.id ? "解除中..." : "解除"}
                          </button>
                        </div>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => handleSetRichMenu(user.id, e.target.value)}
                          disabled={settingMenu === user.id || richMenus.length === 0}
                          className="rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">メニューを選択...</option>
                          {richMenus.map((menu) => (
                            <option key={menu.id} value={menu.id}>
                              {menu.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {settingMenu === user.id && (
                        <span className="text-slate-400">設定中...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DebugPanel
        title="ユーザー管理 API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL(lastEndpoint, typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: lastMethod,
          headers: lastRequest ? { 'Content-Type': 'application/json' } : undefined,
          body: lastRequest,
        })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-profile"
      />
    </div>
  );
}
