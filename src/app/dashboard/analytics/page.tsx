"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, Users, Clock, Calendar, UserPlus, UserMinus, Target, User, MapPin, Tag as TagIcon, Send, Download, FileType, Image, Video, Music, MapPinned, Sticker, FileText } from "lucide-react";
import { DebugPanel, toCurl } from "../_components/debug-panel";

type AnalyticsData = {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInbound: number;
    totalOutbound: number;
    total: number;
    responseRate: number;
    newUsers: number;
    totalUsers: number;
    followingUsers: number;
  };
  comparison: {
    totalMessages: {
      current: number;
      previous: number;
      change: number;
    };
    inbound: {
      current: number;
      previous: number;
      change: number;
    };
    outbound: {
      current: number;
      previous: number;
      change: number;
    };
    newUsers: {
      current: number;
      previous: number;
      change: number;
    };
  };
  messageTypes: Array<{
    type: string;
    count: number;
  }>;
  tags: Array<{
    tagId: string;
    tagName: string;
    userCount: number;
  }>;
  broadcasts: {
    total: number;
    scheduled: number;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  daily: Array<{
    date: string;
    inbound: number;
    outbound: number;
    total: number;
  }>;
  hourly: Array<{
    hour: number;
    inbound: number;
    outbound: number;
  }>;
  weekday: Array<{
    day: number;
    dayName: string;
    inbound: number;
    outbound: number;
  }>;
};

type LineInsights = {
  date: string;
  followers: {
    followers: number;
    targetedReaches: number;
    blocks: number;
  } | null;
  messageDelivery: Array<{
    status: string;
    success?: number;
  }> | null;
};

type LineDemographics = {
  available: boolean;
  genders?: Array<{
    gender: string;
    percentage: number;
  }>;
  ages?: Array<{
    age: string;
    percentage: number;
  }>;
  areas?: Array<{
    area: string;
    percentage: number;
  }>;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<LineInsights | null>(null);
  const [demographics, setDemographics] = useState<LineDemographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [demographicsLoading, setDemographicsLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(7);

  // Debug用の生データ
  const [rawAnalytics, setRawAnalytics] = useState<unknown>(null);
  const [rawInsights, setRawInsights] = useState<unknown>(null);
  const [rawDemographics, setRawDemographics] = useState<unknown>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?days=${period}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      const result = await res.json();
      setData(result);
      setRawAnalytics(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await fetch("/api/line/insights", { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        setInsights(result);
        setRawInsights(result);
      }
    } catch (e) {
      console.error("Failed to load LINE insights:", e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadDemographics = async () => {
    try {
      setDemographicsLoading(true);
      const res = await fetch("/api/line/demographics", { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        setDemographics(result);
        setRawDemographics(result);
      }
    } catch (e) {
      console.error("Failed to load LINE demographics:", e);
    } finally {
      setDemographicsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadInsights();
    loadDemographics();
  }, [period]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  const maxDaily = Math.max(...data.daily.map((d) => d.total), 1);
  const maxHourly = Math.max(...data.hourly.map((h) => h.inbound + h.outbound), 1);
  const maxWeekday = Math.max(...data.weekday.map((w) => w.inbound + w.outbound), 1);

  // メッセージタイプのアイコンマッピング
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "TEXT": return <FileText className="h-4 w-4" />;
      case "IMAGE": return <Image className="h-4 w-4" />;
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "AUDIO": return <Music className="h-4 w-4" />;
      case "LOCATION": return <MapPinned className="h-4 w-4" />;
      case "STICKER": return <Sticker className="h-4 w-4" />;
      default: return <FileType className="h-4 w-4" />;
    }
  };

  // メッセージタイプの日本語名
  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case "TEXT": return "テキスト";
      case "IMAGE": return "画像";
      case "VIDEO": return "動画";
      case "AUDIO": return "音声";
      case "LOCATION": return "位置情報";
      case "STICKER": return "スタンプ";
      case "IMAGEMAP": return "イメージマップ";
      case "FLEX": return "Flexメッセージ";
      case "TEMPLATE": return "テンプレート";
      default: return type;
    }
  };

  // 配信ステータスの日本語名
  const getBroadcastStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT": return "下書き";
      case "SCHEDULED": return "予約済み";
      case "SENDING": return "送信中";
      case "SENT": return "送信済み";
      default: return status;
    }
  };

  // CSVエクスポート機能
  const exportToCSV = () => {
    const rows = [
      ["日付", "受信", "送信", "合計"],
      ...data.daily.map(d => [d.date, d.inbound, d.outbound, d.total]),
    ];
    const csvContent = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-${period}days.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">分析</h1>
          <p className="text-sm text-slate-400">メッセージとユーザーの統計情報</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-500"
          >
            <Download className="h-4 w-4" />
            <span>CSV出力</span>
          </button>
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                period === d
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              {d}日間
            </button>
          ))}
        </div>
      </header>

      {/* LINE公式統計 */}
      {insights && insights.followers && (
        <section className="rounded-lg border border-blue-800/40 bg-gradient-to-br from-blue-900/30 to-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">LINE 公式統計</h2>
            <span className="ml-auto text-xs text-slate-400">
              {insights.date.slice(0, 4)}/{insights.date.slice(4, 6)}/{insights.date.slice(6, 8)}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-slate-400">ターゲットリーチ</h3>
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {insights.followers.targetedReaches.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">メッセージ到達可能数</p>
            </article>

            <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-slate-400">友だち数</h3>
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {insights.followers.followers.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">公式フォロワー数</p>
            </article>

            <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-slate-400">ブロック数</h3>
                <UserMinus className="h-4 w-4 text-red-400" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {insights.followers.blocks.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">ブロック中のユーザー</p>
            </article>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            ※ LINE公式APIから取得した統計データです。前日の数値が表示されます。
          </p>
        </section>
      )}

      {insightsLoading && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-center text-sm text-slate-400">LINE統計情報を読み込み中...</p>
        </section>
      )}

      {!insightsLoading && !insights?.followers && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-center text-sm text-slate-400">
            LINE統計情報を取得できませんでした。チャネル設定を確認してください。
          </p>
        </section>
      )}

      {/* ユーザー属性 */}
      {demographics && demographics.available && (
        <section className="rounded-lg border border-purple-800/40 bg-gradient-to-br from-purple-900/30 to-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">ユーザー属性</h2>
          </div>

          <div className="space-y-6">
            {/* 性別分布 */}
            {demographics.genders && demographics.genders.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-300">性別</h3>
                <div className="space-y-2">
                  {demographics.genders.map((item) => (
                    <div key={item.gender} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-slate-400">
                        {item.gender === "male" ? "男性" : item.gender === "female" ? "女性" : "不明"}
                      </span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded bg-gradient-to-r from-purple-500/60 to-pink-500/60 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-slate-200">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 年齢分布 */}
            {demographics.ages && demographics.ages.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-300">年齢</h3>
                <div className="space-y-2">
                  {demographics.ages.map((item) => (
                    <div key={item.age} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-slate-400">{item.age}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded bg-gradient-to-r from-purple-500/60 to-blue-500/60 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-slate-200">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 地域分布 */}
            {demographics.areas && demographics.areas.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MapPin className="h-4 w-4" />
                  <span>地域（上位10件）</span>
                </h3>
                <div className="space-y-2">
                  {demographics.areas.slice(0, 10).map((item) => (
                    <div key={item.area} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-400">{item.area}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded bg-gradient-to-r from-purple-500/60 to-emerald-500/60 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-slate-200">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            ※ LINE公式APIから取得したユーザー属性の統計データです。
          </p>
        </section>
      )}

      {demographicsLoading && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-center text-sm text-slate-400">ユーザー属性情報を読み込み中...</p>
        </section>
      )}

      {!demographicsLoading && (!demographics || !demographics.available) && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-center text-sm text-slate-400">
            ユーザー属性情報を取得できませんでした。友だち数が一定数以上必要です。
          </p>
        </section>
      )}

      {/* サマリーカード */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">総メッセージ</h2>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{data.summary.total}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex gap-3 text-slate-400">
              <span className="text-emerald-400">受信: {data.summary.totalInbound}</span>
              <span className="text-blue-400">送信: {data.summary.totalOutbound}</span>
            </div>
            {data.comparison && (
              <span className={`flex items-center gap-1 font-medium ${
                data.comparison.totalMessages.change >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {data.comparison.totalMessages.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(data.comparison.totalMessages.change)}%
              </span>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">応答率</h2>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{data.summary.responseRate}%</p>
          <p className="mt-2 text-xs text-slate-400">送信/受信の比率</p>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">新規ユーザー</h2>
            <UserPlus className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{data.summary.newUsers}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-400">期間内の新規登録</p>
            {data.comparison && (
              <span className={`flex items-center gap-1 text-xs font-medium ${
                data.comparison.newUsers.change >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {data.comparison.newUsers.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(data.comparison.newUsers.change)}%
              </span>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400">フォロワー</h2>
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{data.summary.followingUsers}</p>
          <p className="mt-2 text-xs text-slate-400">総ユーザー: {data.summary.totalUsers}</p>
        </article>
      </section>

      {/* 日別推移 */}
      <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">日別メッセージ推移</h2>
        <div className="space-y-2">
          {data.daily.map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-20 text-xs text-slate-400">{day.date.slice(5)}</span>
              <div className="flex-1">
                <div className="flex h-8 overflow-hidden rounded">
                  {day.inbound > 0 && (
                    <div
                      className="bg-emerald-500/60 transition-all"
                      style={{ width: `${(day.inbound / maxDaily) * 100}%` }}
                      title={`受信: ${day.inbound}`}
                    />
                  )}
                  {day.outbound > 0 && (
                    <div
                      className="bg-blue-500/60 transition-all"
                      style={{ width: `${(day.outbound / maxDaily) * 100}%` }}
                      title={`送信: ${day.outbound}`}
                    />
                  )}
                </div>
              </div>
              <span className="w-12 text-right text-sm font-medium text-slate-200">{day.total}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500/60" />
            <span>受信</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500/60" />
            <span>送信</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 時間帯別分布 */}
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">時間帯別分布</h2>
          </div>
          <div className="space-y-1">
            {data.hourly.map((h) => {
              const total = h.inbound + h.outbound;
              return (
                <div key={h.hour} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-slate-400">{h.hour}時</span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded bg-gradient-to-r from-emerald-500/60 to-blue-500/60 transition-all"
                      style={{ width: `${(total / maxHourly) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-300">{total}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 曜日別分布 */}
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">曜日別分布</h2>
          </div>
          <div className="space-y-2">
            {data.weekday.map((w) => {
              const total = w.inbound + w.outbound;
              return (
                <div key={w.day} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium text-slate-300">{w.dayName}</span>
                  <div className="flex-1">
                    <div className="flex h-8 overflow-hidden rounded">
                      {w.inbound > 0 && (
                        <div
                          className="bg-emerald-500/60"
                          style={{ width: `${(w.inbound / maxWeekday) * 100}%` }}
                        />
                      )}
                      {w.outbound > 0 && (
                        <div
                          className="bg-blue-500/60"
                          style={{ width: `${(w.outbound / maxWeekday) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-slate-200">{total}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* メッセージタイプ別分析 */}
      {data.messageTypes && data.messageTypes.length > 0 && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileType className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">メッセージタイプ別</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.messageTypes.map((item) => {
              const total = data.messageTypes.reduce((sum, t) => sum + t.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              return (
                <article key={item.type} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400">{getMessageTypeIcon(item.type)}</div>
                      <h3 className="text-sm font-medium text-slate-300">{getMessageTypeLabel(item.type)}</h3>
                    </div>
                    <span className="text-xs text-slate-500">{percentage}%</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.count.toLocaleString()}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* タグ別分析 */}
      {data.tags && data.tags.length > 0 && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">タグ別ユーザー数</h2>
          </div>
          <div className="space-y-2">
            {data.tags.slice(0, 10).map((tag) => {
              const maxUsers = Math.max(...data.tags.map(t => t.userCount), 1);
              const percentage = (tag.userCount / maxUsers) * 100;
              return (
                <div key={tag.tagId} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm text-slate-300">{tag.tagName}</span>
                  <div className="flex-1">
                    <div
                      className="h-7 rounded bg-gradient-to-r from-indigo-500/60 to-purple-500/60 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-slate-200">
                    {tag.userCount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          {data.tags.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">タグが登録されていません</p>
          )}
        </section>
      )}

      {/* 配信分析 */}
      {data.broadcasts && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">配信統計</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <article className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
                <h3 className="text-xs font-medium text-slate-400">総配信数</h3>
                <p className="mt-2 text-2xl font-semibold text-white">{data.broadcasts.total.toLocaleString()}</p>
              </article>
              <article className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
                <h3 className="text-xs font-medium text-slate-400">予約済み</h3>
                <p className="mt-2 text-2xl font-semibold text-white">{data.broadcasts.scheduled.toLocaleString()}</p>
              </article>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate-300">ステータス別</h3>
              <div className="space-y-2">
                {data.broadcasts.byStatus.map((item) => {
                  const percentage = data.broadcasts.total > 0
                    ? ((item.count / data.broadcasts.total) * 100).toFixed(1)
                    : "0";
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-400">{getBroadcastStatusLabel(item.status)}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded bg-gradient-to-r from-blue-500/60 to-cyan-500/60 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm font-medium text-slate-200">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              {data.broadcasts.byStatus.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">配信がありません</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* API デバッグ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">API デバッグ</h2>
        <DebugPanel
          title="/api/analytics"
          request={{ days: period }}
          curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/analytics?days=${period}`, method: 'GET' })}
          response={rawAnalytics}
        />
        <DebugPanel
          title="/api/line/insights"
          request={{}}
          curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/insights`, method: 'GET' })}
          response={rawInsights}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-insight"
        />
        <DebugPanel
          title="/api/line/demographics"
          request={{}}
          curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/demographics`, method: 'GET' })}
          response={rawDemographics}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-demographic"
        />
      </div>
    </div>
  );
}
