"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
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
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [friendAddUrl, setFriendAddUrl] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<{ basicId?: string; friendUrl?: string } | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Debug state - 各API呼び出しごとに分離
  const [debugUsers, setDebugUsers] = useState<{ request?: unknown; response?: unknown }>({});
  const [debugChannel, setDebugChannel] = useState<{ request?: unknown; response?: unknown }>({});
  const [debugRichMenus, setDebugRichMenus] = useState<{ request?: unknown; response?: unknown }>({});
  const [debugRichMenuSet, setDebugRichMenuSet] = useState<{ request?: unknown; response?: unknown }>({});
  const [debugUserDelete, setDebugUserDelete] = useState<{ request?: unknown; response?: unknown }>({});

  const loadUsers = async () => {
    try {
      const endpoint = "/api/line/users";
      setDebugUsers({ request: {} });

      const response = await fetch(endpoint);
      const data = await response.json();
      setDebugUsers({ request: {}, response: data });

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      setDebugUsers({ request: {}, response: { error: String(error) } });
    }
  };

  const loadRichMenus = async () => {
    try {
      setDebugRichMenus({ request: {} });

      const response = await fetch("/api/line/richmenu");
      const data = await response.json();
      setDebugRichMenus({ request: {}, response: data });

      if (response.ok) {
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
      setDebugRichMenus({ request: {}, response: { error: String(error) } });
    }
  };

  const loadChannelInfo = async () => {
    try {
      const endpoint = "/api/settings/channel";
      setDebugChannel({ request: {} });

      const response = await fetch(endpoint);
      const data = await response.json();
      setDebugChannel({ request: {}, response: data });

      console.log("Channel API response:", data);

      if (response.ok) {
        // friendAddUrl を計算 (/api/dev/info と同じロジック)
        const basicId = data.basicId || "";
        const friendUrl = data.friendUrl || "";
        const basicIdNoAt = basicId.startsWith("@") ? basicId.slice(1) : basicId;
        const computedFriendAddUrl = friendUrl
          ? friendUrl
          : basicIdNoAt
            ? `https://line.me/R/ti/p/%40${encodeURIComponent(basicIdNoAt)}`
            : "";

        console.log("basicId:", basicId);
        console.log("friendUrl:", friendUrl);
        console.log("computedFriendAddUrl:", computedFriendAddUrl);

        setChannelData({ basicId, friendUrl });
        setFriendAddUrl(computedFriendAddUrl || null);
      } else {
        console.error("Failed to load channel info, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to load channel info:", error);
      setDebugChannel({ request: {}, response: { error: String(error) } });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadRichMenus(), loadChannelInfo()]);
    setLoading(false);
  };

  const handleSetRichMenu = async (userId: string, richMenuId: string) => {
    setSettingMenu(userId);
    try {
      const endpoint = `/api/line/richmenu/${richMenuId}/users/${userId}`;
      setDebugRichMenuSet({ request: { userId, richMenuId } });

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();
      setDebugRichMenuSet({ request: { userId, richMenuId }, response: data });

      if (response.ok) {
        await loadUsers();
        toast.success("リッチメニューを設定しました");
      } else {
        toast.error(data.error || "リッチメニューの設定に失敗しました");
      }
    } catch (error) {
      console.error("Failed to set rich menu:", error);
      setDebugRichMenuSet({ request: { userId, richMenuId }, response: { error: String(error) } });
      toast.error("リッチメニューの設定に失敗しました");
    } finally {
      setSettingMenu(null);
    }
  };

  const handleUnlinkRichMenu = async (userId: string, richMenuId: string) => {
    setSettingMenu(userId);
    try {
      const endpoint = `/api/line/richmenu/${richMenuId}/users/${userId}`;
      setDebugRichMenuSet({ request: { userId, richMenuId, action: "unlink" } });

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await response.json();
      setDebugRichMenuSet({ request: { userId, richMenuId, action: "unlink" }, response: data });

      if (response.ok) {
        await loadUsers();
        toast.success("リッチメニューの設定を解除しました");
      } else {
        toast.error(data.error || "リッチメニューの解除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to unlink rich menu:", error);
      setDebugRichMenuSet({ request: { userId, richMenuId, action: "unlink" }, response: { error: String(error) } });
      toast.error("リッチメニューの解除に失敗しました");
    } finally {
      setSettingMenu(null);
    }
  };

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;

    const confirmed = await confirm({
      title: `${selectedUserIds.size}件のユーザーを削除しますか？`,
      message: "この操作は取り消せません。削除されたユーザーは一覧から非表示になります。",
      confirmText: "削除",
      cancelText: "キャンセル",
      type: "danger",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const userIdsArray = Array.from(selectedUserIds);
      const endpoint = "/api/users";
      const requestBody = { userIds: userIdsArray };

      setDebugUserDelete({ request: requestBody });

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setDebugUserDelete({ request: requestBody, response: data });

      if (response.ok) {
        toast.success(`${data.deletedCount}件のユーザーを削除しました`);
        setSelectedUserIds(new Set());
        await loadUsers();
      } else {
        toast.error(data.error || "ユーザーの削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete users:", error);
      setDebugUserDelete({ request: { userIds: Array.from(selectedUserIds) }, response: { error: String(error) } });
      toast.error("ユーザーの削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-5xl font-black text-black ${syne.className}`}>ユーザー管理</h1>
            <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
          </div>
          {selectedUserIds.size > 0 && (
            <button
              onClick={handleDeleteUsers}
              disabled={deleting}
              className="flex items-center gap-2 border-2 border-black bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "削除中..." : `選択したユーザーを削除 (${selectedUserIds.size})`}
            </button>
          )}
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          LINEフォロワーの一覧と詳細情報を確認できます。
        </p>
      </header>

      {/* デバッグ情報 */}
      <section className="border-2 border-black bg-yellow-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="mb-3 text-xs font-bold uppercase">デバッグ情報 - QR 表示条件</h3>
        <div className="space-y-3">
          <div>
            <h4 className="mb-1 text-xs font-bold">状態:</h4>
            <ul className="space-y-1 text-xs font-mono">
              <li>loading: {String(loading)}</li>
              <li>!loading: {String(!loading)}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-bold">チャネルデータ (API):</h4>
            <ul className="space-y-1 text-xs font-mono">
              <li>basicId: {channelData?.basicId || "(empty)"}</li>
              <li>friendUrl: {channelData?.friendUrl || "(empty)"}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-bold">計算結果:</h4>
            <ul className="space-y-1 text-xs font-mono">
              <li>friendAddUrl: {friendAddUrl || "(null)"}</li>
              <li className="mt-2 font-bold">
                QR表示: {String(!loading && !!friendAddUrl)}
                {!loading && !friendAddUrl && " ← basicId または friendUrl を設定してください"}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 友だち追加 QR */}
      {!loading && (friendAddUrl ? (
        <section className="border-2 border-black bg-[#FFFEF5] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>友だち追加 QR</h2>
          <div className="flex items-start gap-6">
            <img
              alt="Add friend QR"
              className="h-40 w-40 border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(friendAddUrl)}`}
            />
            <div className="flex-1 space-y-3">
              <p className="text-xs font-mono text-black/60">QR をスキャン、または下のリンクから友だち追加できます。</p>
              <a className="block text-xs font-bold text-[#00B900] underline hover:text-[#00B900]/80" href={friendAddUrl} target="_blank" rel="noreferrer">{friendAddUrl}</a>
              <div>
                <button
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(friendAddUrl); } catch {}
                  }}
                >リンクをコピー</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-2 border-black bg-[#FFFEF5] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>友だち追加 QR</h2>
          <p className="text-xs font-mono text-black/60">設定でベーシックIDまたは友だち追加URLを入力するとQRを表示できます。</p>
        </section>
      ))}

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
                <th className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.size === users.length}
                    onChange={handleToggleAll}
                    className="h-5 w-5 cursor-pointer border-2 border-black accent-[#00B900]"
                  />
                </th>
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
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                        className="h-5 w-5 cursor-pointer border-2 border-black accent-[#00B900]"
                      />
                    </td>
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

      {/* API デバッグセクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>API デバッグ情報</h2>
          <button
            className="border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            onClick={loadData}
          >
            全て再読込
          </button>
        </div>

        <DebugPanel
          title="GET /api/line/users"
          request={debugUsers.request}
          response={debugUsers.response}
          curl={toCurl({
            url: `${typeof window !== 'undefined' ? location.origin : 'http://localhost:3000'}/api/line/users`,
            method: 'GET',
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-follower-ids"
        />

        <DebugPanel
          title="GET /api/settings/channel"
          request={debugChannel.request}
          response={debugChannel.response}
          curl={toCurl({
            url: `${typeof window !== 'undefined' ? location.origin : 'http://localhost:3000'}/api/settings/channel`,
            method: 'GET',
          })}
        />

        <DebugPanel
          title="GET /api/line/richmenu"
          request={debugRichMenus.request}
          response={debugRichMenus.response}
          curl={toCurl({
            url: `${typeof window !== 'undefined' ? location.origin : 'http://localhost:3000'}/api/line/richmenu`,
            method: 'GET',
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-rich-menu-list"
        />

        {debugRichMenuSet.request && (
          <DebugPanel
            title="POST/DELETE /api/line/richmenu/{richMenuId}/users/{userId}"
            request={debugRichMenuSet.request}
            response={debugRichMenuSet.response}
            curl={toCurl({
              url: `${typeof window !== 'undefined' ? location.origin : 'http://localhost:3000'}/api/line/richmenu/{richMenuId}/users/{userId}`,
              method: (debugRichMenuSet.request as any)?.action === 'unlink' ? 'DELETE' : 'POST',
            })}
            docsUrl="https://developers.line.biz/ja/reference/messaging-api/#link-rich-menu-to-user"
          />
        )}

        {debugUserDelete.request && (
          <DebugPanel
            title="DELETE /api/users"
            request={debugUserDelete.request}
            response={debugUserDelete.response}
            curl={toCurl({
              url: `${typeof window !== 'undefined' ? location.origin : 'http://localhost:3000'}/api/users`,
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: debugUserDelete.request,
            })}
          />
        )}
      </section>
    </div>
  );
}
