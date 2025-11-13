/**
 * Card Message Editor - Persistence Hook Example
 *
 * Demonstrates how to use the useCardPersistence hook for auto-saving
 * and restoring card message editor state.
 */

'use client';

import { useState, useEffect } from 'react';
import { useCardPersistence } from './use-card-persistence';
import type { Card } from '../types';

/**
 * Example card message editor with persistence
 */
export function CardEditorWithPersistence() {
  const [cards, setCards] = useState<Card[]>([]);
  const [altText, setAltText] = useState('カードメッセージ');
  const [isRestored, setIsRestored] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Initialize persistence hook
  const { restore, clear, hasSavedData, savedAt } = useCardPersistence(
    cards,
    altText
  );

  /**
   * Restore saved data on mount
   * Note: This example demonstrates the restoration pattern.
   * The setState calls are intentional for data restoration.
   */
  useEffect(() => {
    if (!isRestored && hasSavedData) {
      const saved = restore();
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Example: Restoring data on mount
        setCards(saved.cards);
        setAltText(saved.altText);
        setIsRestored(true);
        setShowNotification(true);

        // Hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
  }, [isRestored, hasSavedData, restore]);

  /**
   * Handle send message
   */
  const handleSend = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear saved data after successful send
      clear();

      alert('メッセージを送信しました');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('送信に失敗しました');
    }
  };

  /**
   * Add a sample card
   */
  const addSampleCard = () => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      type: 'product',
      title: `商品 ${cards.length + 1}`,
      description: 'サンプル商品の説明',
      imageUrl: 'https://via.placeholder.com/300x200',
      price: 1000,
      actions: [
        {
          type: 'uri',
          label: '詳細を見る',
          uri: 'https://example.com',
        },
      ],
    };

    setCards([...cards, newCard]);
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Restoration Notification */}
      {showNotification && savedAt && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-300">
                下書きを復元しました
              </h3>
              <p className="mt-1 text-xs text-blue-400">
                保存時刻: {formatTimestamp(savedAt)}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-blue-400 hover:text-blue-300"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">
          カードメッセージエディタ
        </h2>

        {/* Alt Text Input */}
        <div className="mb-4">
          <label
            htmlFor="altText"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            代替テキスト
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            placeholder="カードメッセージ"
          />
        </div>

        {/* Card List */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              カード ({cards.length})
            </label>
            <button
              onClick={addSampleCard}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              カードを追加
            </button>
          </div>
          <div className="space-y-2">
            {cards.length === 0 ? (
              <p className="text-sm text-slate-500">
                カードがありません。「カードを追加」ボタンでカードを追加してください。
              </p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded border border-slate-600 bg-slate-900 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {card.type === 'person' ? card.name : card.type === 'product' || card.type === 'location' ? card.title : card.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {card.type === 'product' && card.description}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCards(cards.filter((c) => c.id !== card.id))
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
          <button
            onClick={handleSend}
            disabled={cards.length === 0}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            送信
          </button>
          <button
            onClick={() => {
              setCards([]);
              setAltText('カードメッセージ');
              clear();
            }}
            className="rounded border border-slate-600 px-4 py-2 text-white hover:bg-slate-700"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">
          自動保存ステータス
        </h3>
        <div className="space-y-1 text-xs text-slate-400">
          <p>
            保存データ:{' '}
            <span className={hasSavedData ? 'text-green-400' : 'text-slate-500'}>
              {hasSavedData ? '有り' : '無し'}
            </span>
          </p>
          {savedAt && (
            <p>
              最終保存: <span className="text-slate-300">{formatTimestamp(savedAt)}</span>
            </p>
          )}
          <p className="mt-2 text-slate-500">
            編集内容は3秒後に自動保存されます
          </p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">使い方</h3>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>1. 「カードを追加」ボタンでカードを追加</li>
          <li>2. 編集内容は3秒後に自動保存されます</li>
          <li>3. ページをリロードすると下書きが復元されます</li>
          <li>4. 送信すると保存データがクリアされます</li>
          <li>5. 保存データは7日間有効です</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example: Custom configuration
 */
export function CardEditorWithCustomPersistence() {
  const [cards, setCards] = useState<Card[]>([]);
  const [altText, setAltText] = useState('');

  // Custom configuration
  const { restore, clear, hasSavedData } = useCardPersistence(cards, altText, {
    debounceMs: 5000, // 5 seconds debounce
    maxAgeDays: 30, // Keep for 30 days
    storageKey: 'my-custom-card-editor-draft', // Custom key
  });

  useEffect(() => {
    const saved = restore();
    if (saved) {
      setCards(saved.cards);
      setAltText(saved.altText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Custom Configuration Example</h2>
      <p className="text-sm text-slate-400">
        Debounce: 5s, Max Age: 30 days, Custom Key
      </p>
      <p className="mt-2 text-sm">
        Has saved data: {hasSavedData ? 'Yes' : 'No'}
      </p>
      <button onClick={clear} className="mt-2 rounded bg-red-600 px-3 py-1 text-white">
        Clear
      </button>
    </div>
  );
}
