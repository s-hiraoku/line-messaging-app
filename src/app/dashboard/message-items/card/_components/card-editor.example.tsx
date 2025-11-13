'use client';

/**
 * CardEditor Example Usage
 *
 * Demonstrates how to use the CardEditor component in a page or form.
 * Shows initialization patterns, state management, and integration.
 */

import { useState } from 'react';
import { CardEditor } from './card-editor';
import { CardPreview } from './card-preview';
import type { Card } from './types';

/**
 * Example 1: Basic Usage with Default Card
 */
export function BasicCardEditorExample() {
  const [cards, setCards] = useState<Card[]>([]);

  const handleCardsChange = (updatedCards: Card[]) => {
    console.log('Cards updated:', updatedCards);
    setCards(updatedCards);
  };

  return (
    <div className="h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Card Message Editor - Basic Example
        </h1>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <CardEditor onChange={handleCardsChange} />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 2: Usage with Initial Cards
 */
export function PreloadedCardEditorExample() {
  const initialCards: Card[] = [
    {
      id: 'card-1',
      type: 'product',
      title: 'スペシャルセール商品',
      description: '期間限定で30%オフ!今すぐチェック!',
      price: 9800,
      imageUrl: 'https://example.com/product.jpg',
      actions: [
        {
          type: 'uri',
          label: '商品詳細',
          uri: 'https://example.com/product/123',
        },
        {
          type: 'message',
          label: '購入する',
          text: '商品を購入したい',
        },
      ],
    },
    {
      id: 'card-2',
      type: 'location',
      title: '東京本社',
      address: '東京都渋谷区道玄坂1-2-3',
      hours: '平日 9:00-18:00',
      imageUrl: 'https://example.com/office.jpg',
      actions: [
        {
          type: 'uri',
          label: '地図を見る',
          uri: 'https://maps.google.com/?q=Tokyo',
        },
      ],
    },
  ];

  const [cards, setCards] = useState<Card[]>(initialCards);

  return (
    <div className="h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Card Message Editor - With Initial Cards
        </h1>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <CardEditor
            initialCards={initialCards}
            onChange={setCards}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Full Page with Preview and Send
 */
export function FullCardEditorPageExample() {
  const [cards, setCards] = useState<Card[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);

    try {
      // Convert cards to LINE API format
      const carouselColumns = cards.map((card) => {
        // Simplified conversion - use utils.cardToCarouselColumn in real implementation
        return {
          thumbnailImageUrl: card.imageUrl,
          title: 'type' in card && 'title' in card ? card.title : undefined,
          text: 'description' in card ? card.description : ' ',
          actions: card.actions,
        };
      });

      const messageData = {
        type: 'template',
        altText: 'カードメッセージ',
        template: {
          type: 'carousel',
          columns: carouselColumns,
        },
      };

      // Send to API
      const response = await fetch('/api/line/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageData,
          recipientIds: ['U1234567890'], // Example user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      alert('メッセージを送信しました!');
    } catch (error) {
      console.error('Send error:', error);
      alert('送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            カードメッセージエディタ
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              {showPreview ? 'プレビューを閉じる' : 'プレビュー'}
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || cards.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? '送信中...' : 'メッセージを送信'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">編集</h2>
            <CardEditor onChange={setCards} />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
              {cards.length > 0 ? (
                <CardPreview cards={cards} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40">
                  <p className="text-slate-500">カードがありません</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              Debug Information
            </h3>
            <pre className="overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-300">
              {JSON.stringify(cards, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 4: Form Integration (Save to Database)
 */
export function CardEditorFormIntegrationExample() {
  const [cards, setCards] = useState<Card[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    if (cards.length === 0) {
      alert('少なくとも1つのカードを作成してください');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          type: 'carousel',
          data: cards,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      alert('テンプレートを保存しました!');
      setTemplateName('');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          テンプレートとして保存
        </h1>

        {/* Template Name Input */}
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
          <label htmlFor="template-name" className="mb-2 block text-sm font-medium text-slate-300">
            テンプレート名
          </label>
          <input
            id="template-name"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="例: 新商品キャンペーン"
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Card Editor */}
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
          <CardEditor onChange={setCards} />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !templateName.trim() || cards.length === 0}
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? '保存中...' : 'テンプレートを保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
