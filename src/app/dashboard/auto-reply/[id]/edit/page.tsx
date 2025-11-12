'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MatchType, AutoReply } from '@prisma/client';
import { KeywordInput } from '@/components/auto-reply/KeywordInput';
import { MatchTypeSelect } from '@/components/auto-reply/MatchTypeSelect';
import Link from 'next/link';
import { DebugPanel, toCurl } from '@/app/dashboard/_components/debug-panel';

export default function EditAutoReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    keywords: [] as string[],
    replyText: '',
    priority: 100,
    isActive: true,
    matchType: MatchType.CONTAINS,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [id, setId] = useState<string>('');

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();
  const [lastMethod, setLastMethod] = useState<string>('GET');

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchAutoReply();
    }
  }, [id]);

  const fetchAutoReply = async () => {
    try {
      setLastMethod('GET');
      setLastRequest({
        action: 'fetch',
        ruleId: id
      });

      const response = await fetch(`/api/auto-reply/${id}`);
      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) {
        throw new Error('Failed to fetch auto-reply');
      }

      const rule: AutoReply = data.autoReply;
      setFormData({
        name: rule.name,
        keywords: rule.keywords,
        replyText: rule.replyText,
        priority: rule.priority,
        isActive: rule.isActive,
        matchType: rule.matchType,
      });
    } catch (err) {
      setError('自動応答ルールの読み込みに失敗しました');
      setLastResponse({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('ルール名を入力してください');
      return;
    }

    if (formData.keywords.length === 0) {
      setError('少なくとも1つのキーワードを追加してください');
      return;
    }

    if (!formData.replyText.trim()) {
      setError('応答メッセージを入力してください');
      return;
    }

    setSubmitting(true);
    setLastMethod('PUT');
    setLastRequest(formData);

    try {
      const response = await fetch(`/api/auto-reply/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update auto-reply');
      }

      router.push('/dashboard/auto-reply');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <Link
          href="/dashboard/auto-reply"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-semibold text-white">自動応答ルールを編集</h1>
        <p className="text-sm text-slate-400">
          キーワードと応答メッセージを更新してください。
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ルール名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900/60 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
              placeholder="例: 営業時間の問い合わせ"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              キーワード <span className="text-red-400">*</span>
            </label>
            <KeywordInput
              keywords={formData.keywords}
              onChange={(keywords) => setFormData({ ...formData, keywords })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              マッチングタイプ
            </label>
            <MatchTypeSelect
              value={formData.matchType}
              onChange={(matchType) => setFormData({ ...formData, matchType })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              応答メッセージ <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.replyText}
              onChange={(e) =>
                setFormData({ ...formData, replyText: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900/60 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
              rows={6}
              placeholder="自動応答で送信するメッセージを入力してください"
              maxLength={5000}
              required
            />
            <p className="mt-1 text-sm text-slate-500">
              {formData.replyText.length} / 5000 文字
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">優先度</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-slate-700 bg-slate-900/60 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
              max={9999}
            />
            <p className="mt-1 text-sm text-slate-500">
              数値が小さいほど優先度が高くなります（0-9999）
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-slate-300">有効にする</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition"
          >
            {submitting ? '更新中...' : '更新'}
          </button>
          <Link
            href="/dashboard/auto-reply"
            className="px-6 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition"
          >
            キャンセル
          </Link>
        </div>
      </form>

      {/* Debug Panel */}
      <DebugPanel
        title="自動応答編集API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: typeof window !== 'undefined' ? `${location.origin}/api/auto-reply/${id}` : `http://localhost:3000/api/auto-reply/${id}`,
          method: lastMethod,
          headers: lastRequest ? { 'Content-Type': 'application/json' } : undefined,
          body: lastRequest,
        })}
      />
    </div>
  );
}
