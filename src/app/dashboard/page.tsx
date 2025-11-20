"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/lib/realtime/use-events";
import Link from "next/link";
import { MessageSquare, Users, Send, FileText } from "lucide-react";
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
import { DebugPanel, toCurl } from "./_components/debug-panel";
import { MessageTypeDistribution } from "./_components/message-type-distribution";
import { UserGrowthChart } from "./_components/user-growth-chart";
import { TopActiveUsers } from "./_components/top-active-users";
import { RichMenuUsage } from "./_components/rich-menu-usage";
import { UserSegmentation } from "./_components/user-segmentation";
import { BroadcastOverview } from "./_components/broadcast-overview";
import { WeeklyActivityChart } from "./_components/weekly-activity-chart";

type DashboardStats = {
  today: {
    inbound: number;
    outbound: number;
    total: number;
  };
  users: {
    total: number;
    following: number;
  };
  messages: {
    total: number;
  };
  templates: {
    active: number;
  };
  broadcasts: {
    draft: number;
    scheduled: number;
  };
};

type ExtendedStats = {
  messageTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  topUsers: Array<{
    id: string;
    displayName: string;
    pictureUrl: string | null;
    messageCount: number;
  }>;
  richMenuStats: Array<{
    id: string;
    name: string;
    selected: boolean;
    userCount: number;
  }>;
  userSegmentation: Array<{
    id: string;
    name: string;
    color: string;
    userCount: number;
  }>;
  broadcastStats: Array<{
    status: string;
    count: number;
  }>;
  recentBroadcasts: Array<{
    id: string;
    title: string;
    status: string;
    scheduledAt: string | null;
    createdAt: string;
  }>;
  weeklyActivity: Array<{
    date: string;
    inbound: number;
    outbound: number;
  }>;
  newUsersCount: number;
  topTemplates: Array<{
    id: string;
    name: string;
    category: string | null;
    isActive: boolean;
    usageCount: number;
  }>;
  engagement: {
    averageResponseTime: number;
    activeUserRate: number;
    messagesPerUser: number;
    activeUsers: number;
    totalUsers: number;
  };
  monthlyComparison: {
    messages: {
      current: number;
      previous: number;
      growthRate: number;
    };
    users: {
      current: number;
      previous: number;
      growthRate: number;
    };
  };
  activityFeed: {
    recentMessages: Array<{
      id: string;
      type: string;
      direction: string;
      userName: string;
      userPicture: string | null;
      timestamp: string;
    }>;
    recentUserActions: Array<{
      userId: string;
      userName: string;
      userPicture: string | null;
      action: string;
      timestamp: string;
    }>;
  };
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [extendedStats, setExtendedStats] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug用の生データ
  const [rawStats, setRawStats] = useState<unknown>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsRes, extendedStatsRes] = await Promise.all([
        fetch("/api/dashboard/stats", { cache: "no-store" }),
        fetch("/api/dashboard/extended-stats", { cache: "no-store" }),
      ]);

      if (!statsRes.ok) throw new Error("Failed to load stats");
      if (!extendedStatsRes.ok) throw new Error("Failed to load extended stats");

      const statsData = await statsRes.json();
      const extendedStatsData = await extendedStatsRes.json();

      setStats(statsData);
      setExtendedStats(extendedStatsData);
      setRawStats({ stats: statsData, extendedStats: extendedStatsData });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // リアルタイム更新
  useRealtimeEvents({
    "message:inbound": () => loadStats(),
    "message:outbound": () => loadStats(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-bold text-black/60">読み込み中...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <p className="font-bold text-red-600">{error || "データの取得に失敗しました"}</p>
        <button
          onClick={loadStats}
          className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>ダッシュボード</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          LINE Messaging API の運用状況をここから把握できます。
        </p>
      </header>

      {/* 統計カード */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 今日のメッセージ */}
        <article className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
              今日のメッセージ
            </h2>
            <MessageSquare className="h-5 w-5 text-black" />
          </div>
          <p className={`text-4xl font-black text-black ${syne.className}`}>{stats.today.total}</p>
          <div className="mt-3 flex gap-4 text-xs font-mono font-bold">
            <span className="text-[#00B900]">受信: {stats.today.inbound}</span>
            <span className="text-black/60">送信: {stats.today.outbound}</span>
          </div>
        </article>

        {/* ユーザー */}
        <Link href="/dashboard/users" className="group">
          <article className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
                フォロワー
              </h2>
              <Users className="h-5 w-5 text-black" />
            </div>
            <p className={`text-4xl font-black text-black ${syne.className}`}>{stats.users.following}</p>
            <p className="mt-3 text-xs font-mono font-bold text-black/60">
              総ユーザー: {stats.users.total}
            </p>
          </article>
        </Link>

        {/* 配信 */}
        <Link href="/dashboard/broadcasts" className="group">
          <article className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
                配信
              </h2>
              <Send className="h-5 w-5 text-black" />
            </div>
            <p className={`text-4xl font-black text-black ${syne.className}`}>
              {stats.broadcasts.draft + stats.broadcasts.scheduled}
            </p>
            <div className="mt-3 flex gap-4 text-xs font-mono font-bold text-black/60">
              <span>下書き: {stats.broadcasts.draft}</span>
              <span>予約: {stats.broadcasts.scheduled}</span>
            </div>
          </article>
        </Link>

        {/* テンプレート */}
        <Link href="/dashboard/templates" className="group">
          <article className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
                テンプレート
              </h2>
              <FileText className="h-5 w-5 text-black" />
            </div>
            <p className={`text-4xl font-black text-black ${syne.className}`}>{stats.templates.active}</p>
            <p className="mt-3 text-xs font-mono font-bold text-black/60">アクティブなテンプレート</p>
          </article>
        </Link>
      </section>

      {/* 拡張統計ウィジェット */}
      {extendedStats && (
        <>
          {/* エンゲージメント指標 */}
          <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className={`mb-6 text-lg font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
              エンゲージメント指標
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">平均応答時間</h3>
                <p className={`mt-2 text-3xl font-black text-[#00B900] ${syne.className}`}>
                  {extendedStats.engagement.averageResponseTime}
                </p>
                <p className="mt-1 text-xs font-mono text-black/60">分</p>
              </article>
              <article className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">アクティブユーザー率</h3>
                <p className={`mt-2 text-3xl font-black text-[#00B900] ${syne.className}`}>
                  {extendedStats.engagement.activeUserRate}%
                </p>
                <p className="mt-1 text-xs font-mono text-black/60">
                  {extendedStats.engagement.activeUsers} / {extendedStats.engagement.totalUsers} ユーザー
                </p>
              </article>
              <article className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">ユーザーあたりの平均メッセージ</h3>
                <p className={`mt-2 text-3xl font-black text-[#00B900] ${syne.className}`}>
                  {extendedStats.engagement.messagesPerUser}
                </p>
                <p className="mt-1 text-xs font-mono text-black/60">メッセージ / 週</p>
              </article>
            </div>
          </section>

          {/* 月次比較 */}
          <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className={`mb-6 text-lg font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
              月次成長率
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">メッセージ成長</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <p className={`text-3xl font-black text-black ${syne.className}`}>
                    {extendedStats.monthlyComparison.messages.current.toLocaleString()}
                  </p>
                  <span className={`text-sm font-bold ${
                    extendedStats.monthlyComparison.messages.growthRate >= 0 ? 'text-[#00B900]' : 'text-red-600'
                  }`}>
                    {extendedStats.monthlyComparison.messages.growthRate >= 0 ? '+' : ''}
                    {extendedStats.monthlyComparison.messages.growthRate}%
                  </span>
                </div>
                <p className="mt-2 text-xs font-mono text-black/60">
                  前月: {extendedStats.monthlyComparison.messages.previous.toLocaleString()}
                </p>
              </article>
              <article className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">新規ユーザー成長</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <p className={`text-3xl font-black text-black ${syne.className}`}>
                    {extendedStats.monthlyComparison.users.current.toLocaleString()}
                  </p>
                  <span className={`text-sm font-bold ${
                    extendedStats.monthlyComparison.users.growthRate >= 0 ? 'text-[#00B900]' : 'text-red-600'
                  }`}>
                    {extendedStats.monthlyComparison.users.growthRate >= 0 ? '+' : ''}
                    {extendedStats.monthlyComparison.users.growthRate}%
                  </span>
                </div>
                <p className="mt-2 text-xs font-mono text-black/60">
                  前月: {extendedStats.monthlyComparison.users.previous.toLocaleString()}
                </p>
              </article>
            </div>
          </section>

          {/* 人気テンプレート */}
          {extendedStats.topTemplates.length > 0 && (
            <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className={`mb-6 text-lg font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
                人気テンプレート TOP5
              </h2>
              <div className="space-y-3">
                {extendedStats.topTemplates.map((template, index) => (
                  <div key={template.id} className="flex items-center gap-3 border-2 border-black bg-[#FFFEF5] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className={`flex h-8 w-8 items-center justify-center border-2 border-black bg-[#FFE500] font-black ${syne.className}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-black ${ibmPlexSans.className}`}>{template.name}</p>
                      {template.category && (
                        <p className="text-xs font-mono text-black/60">{template.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black text-[#00B900] ${syne.className}`}>
                        {template.usageCount}
                      </p>
                      <p className="text-xs font-mono text-black/60">回使用</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* リアルタイムアクティビティフィード */}
          <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className={`mb-6 text-lg font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>
              最近のアクティビティ（過去24時間）
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* 最近のメッセージ */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">メッセージ</h3>
                <div className="space-y-2">
                  {extendedStats.activityFeed.recentMessages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="flex items-center gap-3 border-2 border-black bg-[#FFFEF5] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className={`rounded-full border-2 border-black p-1 ${
                        msg.direction === 'INBOUND' ? 'bg-[#00B900]' : 'bg-[#FFE500]'
                      }`}>
                        <MessageSquare className="h-3 w-3 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-black">{msg.userName}</p>
                        <p className="text-xs font-mono text-black/60">
                          {msg.type} • {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {extendedStats.activityFeed.recentMessages.length === 0 && (
                    <p className="py-4 text-center text-xs font-mono text-black/60">まだメッセージがありません</p>
                  )}
                </div>
              </div>

              {/* 最近のユーザーアクション */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">ユーザーアクション</h3>
                <div className="space-y-2">
                  {extendedStats.activityFeed.recentUserActions.slice(0, 5).map((action) => (
                    <div key={action.userId} className="flex items-center gap-3 border-2 border-black bg-[#FFFEF5] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className={`rounded-full border-2 border-black p-1 ${
                        action.action === 'follow' ? 'bg-[#00B900]' : action.action === 'unfollow' ? 'bg-red-400' : 'bg-[#FFE500]'
                      }`}>
                        <Users className="h-3 w-3 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-black">{action.userName}</p>
                        <p className="text-xs font-mono text-black/60">
                          {action.action === 'follow' ? 'フォロー' : action.action === 'unfollow' ? 'ブロック' : '更新'} • {new Date(action.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {extendedStats.activityFeed.recentUserActions.length === 0 && (
                    <p className="py-4 text-center text-xs font-mono text-black/60">まだアクションがありません</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 週間アクティビティと新規ユーザー */}
          <section className="grid gap-4 md:grid-cols-2">
            <WeeklyActivityChart data={extendedStats.weeklyActivity} />
            <UserGrowthChart data={extendedStats.userGrowth} />
          </section>

          {/* メッセージタイプ分布とブロードキャスト概要 */}
          <section className="grid gap-4 md:grid-cols-2">
            <MessageTypeDistribution data={extendedStats.messageTypeDistribution} />
            <BroadcastOverview
              statusData={extendedStats.broadcastStats}
              recentBroadcasts={extendedStats.recentBroadcasts}
            />
          </section>

          {/* トップアクティブユーザー、リッチメニュー、ユーザーセグメント */}
          <section className="grid gap-4 md:grid-cols-3">
            <TopActiveUsers data={extendedStats.topUsers} />
            <RichMenuUsage data={extendedStats.richMenuStats} />
            <UserSegmentation data={extendedStats.userSegmentation} />
          </section>
        </>
      )}

      {/* クイックアクション */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/messages"
          className="group border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#FFE500] p-2">
              <MessageSquare className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className={`font-bold text-black ${ibmPlexSans.className}`}>メッセージ送信</h3>
              <p className="text-xs font-mono text-black/60">個別のユーザーに送信</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/broadcasts"
          className="group border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#00B900] p-2">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-black ${ibmPlexSans.className}`}>一斉配信</h3>
              <p className="text-xs font-mono text-black/60">全フォロワーに配信</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/users"
          className="group border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#FFFEF5] p-2">
              <Users className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className={`font-bold text-black ${ibmPlexSans.className}`}>ユーザー管理</h3>
              <p className="text-xs font-mono text-black/60">フォロワーを確認</p>
            </div>
          </div>
        </Link>
      </section>

      {/* API デバッグ */}
      <section className="space-y-4">
        <h2 className={`text-lg font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>API デバッグ</h2>
        <DebugPanel
          title="/api/dashboard/stats"
          request={{}}
          curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dashboard/stats`, method: 'GET' })}
          response={rawStats}
        />
      </section>
    </div>
  );
}
