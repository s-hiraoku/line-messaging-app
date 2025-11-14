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
