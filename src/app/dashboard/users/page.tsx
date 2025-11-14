"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DebugPanel, toCurl } from "../_components/debug-panel";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>ユーザー管理</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          LINEフォロワーの一覧と詳細情報を確認できます。
        </p>
      </header>

      {loading ? (
        <LoadingSpinner text="読み込み中..." />
      ) : users.length === 0 ? (
        <div className="border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <UserIcon className="mx-auto h-12 w-12 text-black/40" />
          <h3 className="mt-4 text-lg font-bold uppercase tracking-wider text-black">ユーザーがいません</h3>
          <p className="mt-2 text-sm text-black/60">
            LINEでボットを友だち追加したユーザーがここに表示されます。
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full">
            <thead className="border-b-2 border-black bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">
                  リッチメニュー
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-black">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {users.map((user) => {
                const currentMenu = richMenus.find((m) => m.richMenuId === user.richMenuId);

                return (
                  <tr key={user.id} className="hover:bg-[#FFFEF5]">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.pictureUrl ? (
                          <img
                            src={user.pictureUrl}
                            alt={user.displayName}
                            className="h-10 w-10 border-2 border-black"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white">
                            <UserIcon className="h-5 w-5 text-black/40" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-black">{user.displayName}</div>
                          <div className="font-mono text-xs text-black/60">{user.lineUserId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-black/60">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4">
                      {currentMenu ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={currentMenu.id}
                            onChange={(e) => handleSetRichMenu(user.id, e.target.value)}
                            disabled={settingMenu === user.id}
                            className="border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="border-2 border-black bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {settingMenu === user.id ? "解除中..." : "解除"}
                          </button>
                        </div>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => handleSetRichMenu(user.id, e.target.value)}
                          disabled={settingMenu === user.id || richMenus.length === 0}
                          className="border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
                        <span className="font-bold text-black/60">設定中...</span>
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
