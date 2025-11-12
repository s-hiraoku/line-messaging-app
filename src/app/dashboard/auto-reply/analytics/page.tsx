'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DebugPanel, toCurl } from '@/app/dashboard/_components/debug-panel';

interface Analytics {
  summary: {
    totalReplies: number;
    successRate: number;
    activeRules: number;
    uniqueUsers: number;
  };
  topRules: Array<{
    id: string;
    name: string;
    usageCount: number;
    successRate: number;
    percentage: number;
  }>;
  errorsByType: Record<string, number>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [lastEndpoint, setLastEndpoint] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const endpoint = `/api/auto-reply/analytics?${params.toString()}`;
      setLastEndpoint(endpoint);
      setLastRequest({
        dateRange: `${dateRange} days`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(endpoint);
      const data = await response.json();
      setLastResponse(data);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLastResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">データの読み込みに失敗しました</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">自動応答 分析</h1>
          <p className="text-sm text-slate-400">
            自動応答システムの使用状況とパフォーマンスを確認します。
          </p>
        </div>
        <Link
          href="/dashboard/auto-reply"
          className="px-4 py-2 border border-slate-700 bg-slate-800/40 text-slate-300 rounded-md hover:bg-slate-800 transition"
        >
          ルール一覧に戻る
        </Link>
      </header>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">期間</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-slate-700 bg-slate-900/60 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">過去7日間</option>
          <option value="30">過去30日間</option>
          <option value="90">過去90日間</option>
        </select>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
          <div className="text-sm text-slate-400 mb-1">総応答数</div>
          <div className="text-3xl font-semibold text-blue-400">
            {analytics.summary.totalReplies}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
          <div className="text-sm text-slate-400 mb-1">応答成功率</div>
          <div className="text-3xl font-semibold text-green-400">
            {analytics.summary.successRate}%
          </div>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
          <div className="text-sm text-slate-400 mb-1">アクティブルール数</div>
          <div className="text-3xl font-semibold text-purple-400">
            {analytics.summary.activeRules}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
          <div className="text-sm text-slate-400 mb-1">ユニークユーザー数</div>
          <div className="text-3xl font-semibold text-orange-400">
            {analytics.summary.uniqueUsers}
          </div>
        </article>
      </section>

      {/* Top Rules */}
      <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">最も使用されたルール</h2>
        {analytics.topRules.length === 0 ? (
          <p className="text-slate-400">データがありません</p>
        ) : (
          <div className="space-y-4">
            {analytics.topRules.map((rule, index) => (
              <div key={rule.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-slate-200">{rule.name}</span>
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-400">
                    <span>使用回数: {rule.usageCount}</span>
                    <span>成功率: {rule.successRate.toFixed(1)}%</span>
                    <span>全体の {rule.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${rule.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Error Statistics */}
      {Object.keys(analytics.errorsByType).length > 0 && (
        <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-4">エラー統計</h2>
          <div className="space-y-2">
            {Object.entries(analytics.errorsByType).map(([type, count]) => {
              const labels: Record<string, string> = {
                networkError: 'ネットワークエラー',
                invalidReplyToken: '無効なreplyToken',
                rateLimitExceeded: 'レート制限超過',
                other: 'その他',
              };
              return (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-slate-300">{labels[type] || type}</span>
                  <span className="font-semibold text-red-400">{count}件</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Debug Panel */}
      <DebugPanel
        title="自動応答分析API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL(lastEndpoint, typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: 'GET',
        })}
      />
    </div>
  );
}
