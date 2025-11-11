"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/lib/realtime/use-events";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, Users, Send, FileText } from "lucide-react";
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
  recentMessages: Array<{
    id: string;
    direction: "INBOUND" | "OUTBOUND";
    content: { text?: string };
    createdAt: string;
    user: {
      id: string;
      displayName: string;
      lineUserId: string;
    };
  }>;
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
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error || "データの取得に失敗しました"}</p>
        <button
          onClick={loadStats}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-white">ダッシュボード</h1>
        <p className="text-sm text-slate-400">
          LINE Messaging API の運用状況をここから把握できます。
        </p>
      </header>

      {/* 統計カード */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 今日のメッセージ */}
        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">今日のメッセージ</h2>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.today.total}</p>
          <div className="mt-2 flex gap-3 text-xs text-slate-400">
            <span className="text-emerald-400">受信: {stats.today.inbound}</span>
            <span className="text-blue-400">送信: {stats.today.outbound}</span>
          </div>
        </article>

        {/* ユーザー */}
        <Link href="/dashboard/users" className="group">
          <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400">フォロワー</h2>
              <Users className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.users.following}</p>
            <p className="mt-2 text-xs text-slate-400">
              総ユーザー: {stats.users.total}
            </p>
          </article>
        </Link>

        {/* 配信 */}
        <Link href="/dashboard/broadcasts" className="group">
          <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400">配信</h2>
              <Send className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {stats.broadcasts.draft + stats.broadcasts.scheduled}
            </p>
            <div className="mt-2 flex gap-3 text-xs text-slate-400">
              <span>下書き: {stats.broadcasts.draft}</span>
              <span>予約: {stats.broadcasts.scheduled}</span>
            </div>
          </article>
        </Link>

        {/* テンプレート */}
        <Link href="/dashboard/templates" className="group">
          <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400">テンプレート</h2>
              <FileText className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.templates.active}</p>
            <p className="mt-2 text-xs text-slate-400">アクティブなテンプレート</p>
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

      {/* 最近のアクティビティ */}
      <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">最近のメッセージ</h2>
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            すべて見る
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.recentMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">メッセージがありません</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {stats.recentMessages.map((msg) => (
              <li key={msg.id} className="flex items-start gap-4 py-3">
                <div
                  className={`mt-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    msg.direction === "INBOUND"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {msg.direction === "INBOUND" ? "受信" : "送信"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">
                    {msg.content.text || "(非テキスト)"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {msg.user.displayName || msg.user.lineUserId.slice(0, 8) + "..."} ・{" "}
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* クイックアクション */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/messages"
          className="group rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">メッセージ送信</h3>
              <p className="text-xs text-slate-400">個別のユーザーに送信</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/broadcasts"
          className="group rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Send className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">一斉配信</h3>
              <p className="text-xs text-slate-400">全フォロワーに配信</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/users"
          className="group rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm transition hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">ユーザー管理</h3>
              <p className="text-xs text-slate-400">フォロワーを確認</p>
            </div>
          </div>
        </Link>
      </section>

      {/* API デバッグ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">API デバッグ</h2>
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
