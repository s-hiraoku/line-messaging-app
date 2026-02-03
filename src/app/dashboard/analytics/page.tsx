"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, Users, Clock, Calendar, UserPlus, UserMinus, Target, User, MapPin, Tag as TagIcon, Send, Download, FileType, Image, Video, Music, MapPinned, Sticker, FileText, BarChart3, PieChartIcon, Activity } from "lucide-react";
import { DebugPanel, toCurl } from "../_components/debug-panel";
import { LineChart } from "../_components/line-chart";
import { PieChart } from "../_components/pie-chart";
import { Heatmap } from "../_components/heatmap";

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
        <p className="text-sm font-bold uppercase tracking-wider text-gray-500">読み込み中...</p>
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
      <header className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-800">分析</h1>
          <p className="text-xs font-mono text-gray-500">メッセージとユーザーの統計情報</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
          >
            <Download className="h-4 w-4" />
            <span>CSV出力</span>
          </button>
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                period === d
                  ? "bg-[#00B900] text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
                  : "bg-white text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:bg-[#e8f5e9] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
              }`}
            >
              {d}日間
            </button>
          ))}
        </div>
      </header>

      {/* LINE公式統計 */}
      {insights && insights.followers && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">LINE 公式統計</h2>
            <span className="ml-auto text-xs font-mono text-gray-500">
              {insights.date.slice(0, 4)}/{insights.date.slice(4, 6)}/{insights.date.slice(6, 8)}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">ターゲットリーチ</h3>
                <Target className="h-4 w-4 text-gray-800" />
              </div>
              <p className="mt-2 text-3xl font-bold text-[#00B900]">
                {insights.followers.targetedReaches.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-mono text-gray-500">メッセージ到達可能数</p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">友だち数</h3>
                <Users className="h-4 w-4 text-gray-800" />
              </div>
              <p className="mt-2 text-3xl font-bold text-[#00B900]">
                {insights.followers.followers.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-mono text-gray-500">公式フォロワー数</p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">ブロック数</h3>
                <UserMinus className="h-4 w-4 text-gray-800" />
              </div>
              <p className="mt-2 text-3xl font-bold text-[#00B900]">
                {insights.followers.blocks.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-mono text-gray-500">ブロック中のユーザー</p>
            </article>
          </div>
          <p className="mt-4 text-xs font-mono text-gray-500">
            ※ LINE公式APIから取得した統計データです。前日の数値が表示されます。
          </p>
        </section>
      )}

      {insightsLoading && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-center text-sm font-mono text-gray-500">LINE統計情報を読み込み中...</p>
        </section>
      )}

      {!insightsLoading && !insights?.followers && (
        <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-center text-sm font-mono text-gray-500">
            LINE統計情報を取得できませんでした。チャネル設定を確認してください。
          </p>
        </section>
      )}

      {/* ユーザー属性 */}
      {demographics && demographics.available && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">ユーザー属性</h2>
          </div>

          <div className="space-y-6">
            {/* 性別分布 */}
            {demographics.genders && demographics.genders.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">性別</h3>
                <div className="space-y-2">
                  {demographics.genders.map((item) => (
                    <div key={item.gender} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-mono text-gray-500">
                        {item.gender === "male" ? "男性" : item.gender === "female" ? "女性" : "不明"}
                      </span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded-lg bg-[#00B900] transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-gray-800">
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
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">年齢</h3>
                <div className="space-y-2">
                  {demographics.ages.map((item) => (
                    <div key={item.age} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-mono text-gray-500">{item.age}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded-lg bg-[#00B900] transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-gray-800">
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
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800">
                  <MapPin className="h-4 w-4" />
                  <span>地域（上位10件）</span>
                </h3>
                <div className="space-y-2">
                  {demographics.areas.slice(0, 10).map((item) => (
                    <div key={item.area} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-mono text-gray-500">{item.area}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded-lg bg-[#00B900] transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-gray-800">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs font-mono text-gray-500">
            ※ LINE公式APIから取得したユーザー属性の統計データです。
          </p>
        </section>
      )}

      {demographicsLoading && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-center text-sm font-mono text-gray-500">ユーザー属性情報を読み込み中...</p>
        </section>
      )}

      {!demographicsLoading && (!demographics || !demographics.available) && (
        <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-center text-sm font-mono text-gray-500">
            ユーザー属性情報を取得できませんでした。友だち数が一定数以上必要です。
          </p>
        </section>
      )}

      {/* サマリーカード */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">総メッセージ</h2>
            <MessageSquare className="h-4 w-4 text-gray-800" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#00B900]">{data.summary.total}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex gap-3 font-mono text-gray-500">
              <span>受信: {data.summary.totalInbound}</span>
              <span>送信: {data.summary.totalOutbound}</span>
            </div>
            {data.comparison && (
              <span className={`flex items-center gap-1 font-bold ${
                data.comparison.totalMessages.change >= 0 ? "text-[#00B900]" : "text-red-600"
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

        <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">応答率</h2>
            <TrendingUp className="h-4 w-4 text-gray-800" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#00B900]">
            {data.summary.totalInbound > 0 ? `${data.summary.responseRate}%` : "N/A"}
          </p>
          <p className="mt-2 text-xs font-mono text-gray-500">
            受信メッセージへの応答率（最大100%）
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">新規ユーザー</h2>
            <UserPlus className="h-4 w-4 text-gray-800" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#00B900]">{data.summary.newUsers}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs font-mono text-gray-500">期間内の新規登録</p>
            {data.comparison && (
              <span className={`flex items-center gap-1 text-xs font-bold ${
                data.comparison.newUsers.change >= 0 ? "text-[#00B900]" : "text-red-600"
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

        <article className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">フォロワー</h2>
            <Users className="h-4 w-4 text-gray-800" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#00B900]">{data.summary.followingUsers}</p>
          <p className="mt-2 text-xs font-mono text-gray-500">総ユーザー: {data.summary.totalUsers}</p>
        </article>
      </section>

      {/* 日別推移 - バーチャート */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-800">日別メッセージ推移</h2>
        <div className="space-y-2">
          {data.daily.map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-20 text-xs font-mono text-gray-500">{day.date.slice(5)}</span>
              <div className="flex-1">
                <div className="flex h-8 overflow-hidden rounded-lg">
                  {day.inbound > 0 && (
                    <div
                      className="bg-[#00B900] transition-all"
                      style={{ width: `${(day.inbound / maxDaily) * 100}%` }}
                      title={`受信: ${day.inbound}`}
                    />
                  )}
                  {day.outbound > 0 && (
                    <div
                      className="bg-[#FFE500] transition-all"
                      style={{ width: `${(day.outbound / maxDaily) * 100}%` }}
                      title={`送信: ${day.outbound}`}
                    />
                  )}
                </div>
              </div>
              <span className="w-12 text-right text-sm font-bold text-gray-800">{day.total}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#00B900]" />
            <span>受信</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#FFE500]" />
            <span>送信</span>
          </div>
        </div>
      </section>

      {/* 日別推移 - 折れ線グラフ */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-800" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">日別推移グラフ</h2>
        </div>
        <LineChart
          data={data.daily.map(d => ({
            label: d.date.slice(5),
            value: d.total
          }))}
          height={250}
          color="#00B900"
        />
      </section>

      {/* メッセージタイプ分布 - 円グラフ */}
      {data.messageTypes && data.messageTypes.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">メッセージタイプ分布</h2>
          </div>
          <div className="flex justify-center">
            <PieChart
              data={data.messageTypes.map(item => ({
                label: getMessageTypeLabel(item.type),
                value: item.count
              }))}
              size={350}
            />
          </div>
        </section>
      )}

      {/* アクティビティヒートマップ */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-800" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">アクティビティパターン</h2>
        </div>
        <Heatmap data={{ hourly: data.hourly, weekday: data.weekday }} />
      </section>

      {/* トレンド・予測分析 */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-800" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">トレンド分析</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* メッセージトレンド */}
          <article className="rounded-2xl bg-[#e8f5e9] p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">メッセージ量トレンド</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">現在の7日平均:</span>
                <span className="text-sm font-bold text-gray-800">
                  {Math.round(data.daily.reduce((sum, d) => sum + d.total, 0) / data.daily.length).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">ピーク日:</span>
                <span className="text-sm font-bold text-gray-800">
                  {data.daily.reduce((max, d) => d.total > max.total ? d : max, data.daily[0]).date.slice(5)} ({data.daily.reduce((max, d) => d.total > max.total ? d : max, data.daily[0]).total})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">最低日:</span>
                <span className="text-sm font-bold text-gray-800">
                  {data.daily.reduce((min, d) => d.total < min.total ? d : min, data.daily[0]).date.slice(5)} ({data.daily.reduce((min, d) => d.total < min.total ? d : min, data.daily[0]).total})
                </span>
              </div>
            </div>
            {(() => {
              const recent = data.daily.slice(-3).reduce((sum, d) => sum + d.total, 0) / 3;
              const earlier = data.daily.slice(0, -3).reduce((sum, d) => sum + d.total, 0) / (data.daily.length - 3);
              const trend = ((recent - earlier) / earlier) * 100;
              return (
                <div className="mt-4 flex items-center gap-2 border-t border-gray-300 pt-3">
                  {trend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-[#00B900]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ${trend >= 0 ? 'text-[#00B900]' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% (直近3日 vs それ以前)
                  </span>
                </div>
              );
            })()}
          </article>

          {/* ユーザートレンド */}
          <article className="rounded-2xl bg-[#e8f5e9] p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">ユーザー成長予測</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">現在のフォロワー:</span>
                <span className="text-sm font-bold text-gray-800">{data.summary.followingUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">期間内の新規:</span>
                <span className="text-sm font-bold text-gray-800">{data.summary.newUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-mono text-gray-500">1日あたりの成長:</span>
                <span className="text-sm font-bold text-gray-800">
                  {(data.summary.newUsers / data.period.days).toFixed(1)}
                </span>
              </div>
            </div>
            {(() => {
              const dailyGrowth = data.summary.newUsers / data.period.days;
              const predicted30Days = Math.round(data.summary.followingUsers + dailyGrowth * 30);
              return (
                <div className="mt-4 border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-xs font-mono text-gray-500">30日後の予測:</span>
                    <span className="text-lg font-bold text-[#00B900]">
                      {predicted30Days.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-gray-500">
                    (現在のペースで成長した場合)
                  </p>
                </div>
              );
            })()}
          </article>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 時間帯別分布 */}
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">時間帯別分布</h2>
          </div>
          <div className="space-y-1">
            {data.hourly.map((h) => {
              const total = h.inbound + h.outbound;
              return (
                <div key={h.hour} className="flex items-center gap-2">
                  <span className="w-10 text-xs font-mono text-gray-500">{h.hour}時</span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded-lg bg-[#00B900] transition-all"
                      style={{ width: `${(total / maxHourly) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-gray-800">{total}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 曜日別分布 */}
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">曜日別分布</h2>
          </div>
          <div className="space-y-2">
            {data.weekday.map((w) => {
              const total = w.inbound + w.outbound;
              return (
                <div key={w.day} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-bold text-gray-800">{w.dayName}</span>
                  <div className="flex-1">
                    <div className="flex h-8 overflow-hidden rounded-lg">
                      {w.inbound > 0 && (
                        <div
                          className="bg-[#00B900]"
                          style={{ width: `${(w.inbound / maxWeekday) * 100}%` }}
                        />
                      )}
                      {w.outbound > 0 && (
                        <div
                          className="bg-[#FFE500]"
                          style={{ width: `${(w.outbound / maxWeekday) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-gray-800">{total}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* メッセージタイプ別分析 */}
      {data.messageTypes && data.messageTypes.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <FileType className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">メッセージタイプ別</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.messageTypes.map((item) => {
              const total = data.messageTypes.reduce((sum, t) => sum + t.count, 0);
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              return (
                <article key={item.type} className="rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-800">{getMessageTypeIcon(item.type)}</div>
                      <h3 className="text-sm font-bold text-gray-800">{getMessageTypeLabel(item.type)}</h3>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{percentage}%</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#00B900]">{item.count.toLocaleString()}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* タグ別分析 */}
      {data.tags && data.tags.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">タグ別ユーザー数</h2>
          </div>
          <div className="space-y-2">
            {data.tags.slice(0, 10).map((tag) => {
              const maxUsers = Math.max(...data.tags.map(t => t.userCount), 1);
              const percentage = (tag.userCount / maxUsers) * 100;
              return (
                <div key={tag.tagId} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm font-bold text-gray-800">{tag.tagName}</span>
                  <div className="flex-1">
                    <div
                      className="h-7 rounded-lg bg-[#00B900] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-bold text-gray-800">
                    {tag.userCount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          {data.tags.length === 0 && (
            <p className="py-8 text-center text-sm font-mono text-gray-500">タグが登録されていません</p>
          )}
        </section>
      )}

      {/* 配信分析 */}
      {data.broadcasts && (
        <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">配信統計</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <article className="rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">総配信数</h3>
                <p className="mt-2 text-3xl font-bold text-[#00B900]">{data.broadcasts.total.toLocaleString()}</p>
              </article>
              <article className="rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">予約済み</h3>
                <p className="mt-2 text-3xl font-bold text-[#00B900]">{data.broadcasts.scheduled.toLocaleString()}</p>
              </article>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">ステータス別</h3>
              <div className="space-y-2">
                {data.broadcasts.byStatus.map((item) => {
                  const percentage = data.broadcasts.total > 0
                    ? ((item.count / data.broadcasts.total) * 100).toFixed(1)
                    : "0";
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-mono text-gray-500">{getBroadcastStatusLabel(item.status)}</span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded-lg bg-[#00B900] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm font-bold text-gray-800">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              {data.broadcasts.byStatus.length === 0 && (
                <p className="py-8 text-center text-sm font-mono text-gray-500">配信がありません</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* API デバッグ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">API デバッグ</h2>
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
