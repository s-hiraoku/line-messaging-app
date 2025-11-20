'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MatchType } from '@prisma/client';
import { KeywordInput } from '@/components/auto-reply/KeywordInput';
import { MatchTypeSelect } from '@/components/auto-reply/MatchTypeSelect';
import Link from 'next/link';
import { DebugPanel, toCurl } from '@/app/dashboard/_components/debug-panel';

export default function NewAutoReplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    name: string;
    keywords: string[];
    replyText: string;
    priority: number;
    isActive: boolean;
    matchType: MatchType;
  }>({
    name: '',
    keywords: [] as string[],
    replyText: '',
    priority: 100,
    isActive: true,
    matchType: MatchType.CONTAINS,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debug state
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

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
    setLastRequest(formData);

    try {
      const response = await fetch('/api/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLastResponse(data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create auto-reply');
      }

      router.push('/dashboard/auto-reply');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <Link
          href="/dashboard/auto-reply"
          className="text-sm font-bold text-[#00B900] hover:underline"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">新しい自動応答ルールを作成</h1>
        <p className="text-xs font-mono text-black/60">
          キーワードと応答メッセージを設定してください。
        </p>
      </div>

      {error && (
        <div className="p-4 border-2 border-black bg-red-600/10 text-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
              ルール名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              placeholder="例: 営業時間の問い合わせ"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
              キーワード <span className="text-red-600">*</span>
            </label>
            <KeywordInput
              keywords={formData.keywords}
              onChange={(keywords) => setFormData({ ...formData, keywords })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
              マッチングタイプ
            </label>
            <MatchTypeSelect
              value={formData.matchType}
              onChange={(matchType) => setFormData({ ...formData, matchType })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
              応答メッセージ <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.replyText}
              onChange={(e) =>
                setFormData({ ...formData, replyText: e.target.value })
              }
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              rows={6}
              placeholder="自動応答で送信するメッセージを入力してください"
              maxLength={5000}
              required
            />
            <p className="mt-1 text-xs font-mono text-black/60">
              {formData.replyText.length} / 5000 文字
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">優先度</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
              }
              className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              min={0}
              max={9999}
            />
            <p className="mt-1 text-xs font-mono text-black/60">
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
                className="mr-2 h-4 w-4 border-2 border-black"
              />
              <span className="text-sm font-bold uppercase tracking-wider text-black">有効にする</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="border-2 border-black bg-[#00B900] px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '作成中...' : '作成'}
          </button>
          <Link
            href="/dashboard/auto-reply"
            className="border-2 border-black bg-white px-6 py-2 text-sm font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            キャンセル
          </Link>
        </div>
      </form>

      {/* Debug Panel */}
      <DebugPanel
        title="自動応答作成API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: typeof window !== 'undefined' ? `${location.origin}/api/auto-reply` : 'http://localhost:3000/api/auto-reply',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: lastRequest,
        })}
      />
    </div>
  );
}
