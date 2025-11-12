'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AutoReply, MatchType } from '@prisma/client';
import { DebugPanel, toCurl } from '@/app/dashboard/_components/debug-panel';

export default function AutoReplyPage() {
  const router = useRouter();
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [lastEndpoint, setLastEndpoint] = useState<string>('');
  const [lastMethod, setLastMethod] = useState<string>('GET');

  useEffect(() => {
    fetchAutoReplies();
  }, [filter]);

  const fetchAutoReplies = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'active') params.set('isActive', 'true');
      if (filter === 'inactive') params.set('isActive', 'false');

      const endpoint = `/api/auto-reply?${params.toString()}`;
      setLastEndpoint(endpoint);
      setLastMethod('GET');
      setLastRequest({
        filter,
        queryParams: Object.fromEntries(params.entries())
      });

      const response = await fetch(endpoint);
      const data = await response.json();
      setLastResponse(data);
      setAutoReplies(data.autoReplies || []);
    } catch (error) {
      console.error('Failed to fetch auto-replies:', error);
      setLastResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const endpoint = `/api/auto-reply/${id}/toggle`;
      setLastEndpoint(endpoint);
      setLastMethod('PATCH');
      setLastRequest({
        action: 'toggle',
        ruleId: id
      });

      const response = await fetch(endpoint, {
        method: 'PATCH',
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        fetchAutoReplies();
      }
    } catch (error) {
      console.error('Failed to toggle auto-reply:', error);
      setLastResponse({ error: String(error) });
    }
  };

  const deleteAutoReply = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const endpoint = `/api/auto-reply/${id}`;
      setLastEndpoint(endpoint);
      setLastMethod('DELETE');
      setLastRequest({
        action: 'delete',
        ruleId: id,
        ruleName: name
      });

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        fetchAutoReplies();
      }
    } catch (error) {
      console.error('Failed to delete auto-reply:', error);
      setLastResponse({ error: String(error) });
    }
  };

  const getMatchTypeLabel = (matchType: MatchType) => {
    const labels = {
      [MatchType.CONTAINS]: '部分一致',
      [MatchType.EXACT]: '完全一致',
      [MatchType.STARTS_WITH]: '前方一致',
      [MatchType.ENDS_WITH]: '後方一致',
    };
    return labels[matchType];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">自動応答ルール</h1>
          <p className="text-sm text-slate-400">
            キーワードに基づいた自動応答を管理します。
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/auto-reply/analytics"
            className="px-4 py-2 border border-slate-700 bg-slate-800/40 text-slate-300 rounded-md hover:bg-slate-800 transition"
          >
            分析
          </Link>
          <Link
            href="/dashboard/auto-reply/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            新規作成
          </Link>
        </div>
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
          }`}
        >
          有効
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
          }`}
        >
          無効
        </button>
      </div>

      {autoReplies.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-12 text-center">
          <p className="text-slate-400">自動応答ルールがありません</p>
          <Link
            href="/dashboard/auto-reply/new"
            className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            最初のルールを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {autoReplies.map((rule) => (
            <div
              key={rule.id}
              className={`border rounded-lg p-5 transition ${
                rule.isActive
                  ? 'border-slate-700/50 bg-slate-800/40'
                  : 'border-slate-700/30 bg-slate-800/20'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        rule.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {rule.isActive ? '有効' : '無効'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full font-medium">
                      優先度: {rule.priority}
                    </span>
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full font-medium">
                      {getMatchTypeLabel(rule.matchType)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rule.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-700 text-slate-300 text-sm rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {rule.keywords.length > 5 && (
                      <span className="px-2 py-1 text-slate-500 text-sm">
                        ...他{rule.keywords.length - 5}個
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {rule.replyText}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(rule.id)}
                    className={`px-3 py-1.5 text-sm rounded font-medium transition ${
                      rule.isActive
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {rule.isActive ? '無効化' : '有効化'}
                  </button>
                  <Link
                    href={`/dashboard/auto-reply/${rule.id}/edit`}
                    className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 font-medium transition"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => deleteAutoReply(rule.id, rule.name)}
                    className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 font-medium transition"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel
        title="自動応答API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL(lastEndpoint, typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: lastMethod,
          headers: lastRequest ? { 'Content-Type': 'application/json' } : undefined,
          body: lastRequest,
        })}
      />
    </div>
  );
}
