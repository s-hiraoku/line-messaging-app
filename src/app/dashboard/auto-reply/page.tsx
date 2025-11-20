'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AutoReply, MatchType } from '@prisma/client';
import { DebugPanel, toCurl } from '@/app/dashboard/_components/debug-panel';
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
        <p className="text-sm font-mono text-black/60">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <header className="space-y-3">
          <div className="flex items-center gap-4">
            <h1 className={`text-5xl font-black text-black ${syne.className}`}>自動応答</h1>
            <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
          </div>
          <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
            メッセージに対する自動応答ルールを管理できます。
          </p>
        </header>
        <div className="flex gap-3 mt-4">
          <Link
            href="/dashboard/auto-reply/analytics"
            className="border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            分析
          </Link>
          <Link
            href="/dashboard/auto-reply/new"
            className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            新規作成
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
            filter === 'all'
              ? 'border-2 border-black bg-[#00B900] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
            filter === 'active'
              ? 'border-2 border-black bg-[#00B900] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          有効
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
            filter === 'inactive'
              ? 'border-2 border-black bg-[#00B900] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          無効
        </button>
      </div>

      {autoReplies.length === 0 ? (
        <div className="border-2 border-black bg-[#FFFEF5] p-12 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-mono text-black/60">自動応答ルールがありません</p>
          <Link
            href="/dashboard/auto-reply/new"
            className="mt-2 inline-block text-sm font-bold text-[#00B900] hover:underline"
          >
            最初のルールを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {autoReplies.map((rule) => (
            <div
              key={rule.id}
              className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h3 className="text-lg font-bold text-black">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${
                        rule.isActive
                          ? 'bg-[#00B900] text-white'
                          : 'bg-white text-black'
                      }`}
                    >
                      {rule.isActive ? '有効' : '無効'}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold font-mono border-2 border-black bg-white text-black">
                      優先度: {rule.priority}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold uppercase border-2 border-black bg-white text-black">
                      {getMatchTypeLabel(rule.matchType)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rule.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 border-2 border-black bg-[#FFFEF5] text-black text-sm font-mono"
                      >
                        {keyword}
                      </span>
                    ))}
                    {rule.keywords.length > 5 && (
                      <span className="px-2 py-1 text-black/60 text-sm font-mono">
                        ...他{rule.keywords.length - 5}個
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-black/70 line-clamp-2">
                    {rule.replyText}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 flex-wrap">
                  <button
                    onClick={() => toggleActive(rule.id)}
                    className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-all ${
                      rule.isActive
                        ? 'border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-2 border-black bg-[#00B900] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {rule.isActive ? '無効化' : '有効化'}
                  </button>
                  <Link
                    href={`/dashboard/auto-reply/${rule.id}/edit`}
                    className="px-3 py-1.5 text-sm border-2 border-black bg-white text-black font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => deleteAutoReply(rule.id, rule.name)}
                    className="px-3 py-1.5 text-sm border-2 border-black bg-red-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
