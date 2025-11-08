"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, Users, Clock, Calendar, UserPlus, UserMinus, Target, User, MapPin } from "lucide-react";
import { DebugPanel } from "../_components/debug-panel";

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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">分析</h1>
          <p className="text-sm text-slate-400">メッセージとユーザーの統計情報</p>
        </div>
        <div className="flex gap-2">
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
          <div className="mt-2 flex gap-3 text-xs text-slate-400">
            <span className="text-emerald-400">受信: {data.summary.totalInbound}</span>
            <span className="text-blue-400">送信: {data.summary.totalOutbound}</span>
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
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{data.summary.newUsers}</p>
          <p className="mt-2 text-xs text-slate-400">期間内の新規登録</p>
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

      {/* API デバッグ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">API デバッグ</h2>
        <DebugPanel title="/api/analytics" response={rawAnalytics} />
        <DebugPanel title="/api/line/insights" response={rawInsights} />
        <DebugPanel title="/api/line/demographics" response={rawDemographics} />
      </div>
    </div>
  );
}
