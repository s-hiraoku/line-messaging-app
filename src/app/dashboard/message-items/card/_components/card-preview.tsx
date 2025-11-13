/**
 * Card Preview Component
 *
 * Displays a carousel-style preview of card messages with LINE UI styling.
 * Features:
 * - Horizontal scroll carousel display
 * - Type-specific rendering (product, location, person, image)
 * - Mock LINE message bubble appearance
 * - Card position indicator (X / Y)
 * - Action buttons preview (non-functional)
 */

"use client";

import { useRef, useState, useEffect } from "react";
import type { Card, CardAction } from "./types";

interface CardPreviewProps {
  cards: Card[];
}

/**
 * Renders action button labels for preview
 */
function ActionButton({ action }: { action: CardAction }) {
  return (
    <div className="flex-1 rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-center text-xs font-medium text-slate-200 transition hover:bg-slate-700">
      {action.label}
    </div>
  );
}

/**
 * Renders a single card based on its type
 */
function CardItem({ card, index, total }: { card: Card; index: number; total: number }) {
  const renderCardContent = () => {
    switch (card.type) {
      case 'product':
        return (
          <>
            <div className="p-3">
              <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
                {card.title}
              </h3>
              <p className="mb-2 text-xs text-slate-400 line-clamp-3">
                {card.description}
              </p>
              {card.price !== undefined && (
                <div className="text-sm font-bold text-green-400">
                  ¥{card.price.toLocaleString()}
                </div>
              )}
            </div>
          </>
        );

      case 'location':
        return (
          <>
            <div className="p-3">
              <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
                {card.title}
              </h3>
              <p className="mb-1 text-xs text-slate-400 line-clamp-2">
                {card.address}
              </p>
              {card.hours && (
                <p className="text-xs text-slate-500">
                  {card.hours}
                </p>
              )}
            </div>
          </>
        );

      case 'person':
        return (
          <>
            <div className="p-3">
              <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
                {card.name}
              </h3>
              <p className="mb-2 text-xs text-slate-400 line-clamp-3">
                {card.description}
              </p>
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="p-3">
              {card.title && (
                <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
                  {card.title}
                </h3>
              )}
              {card.description && (
                <p className="text-xs text-slate-400 line-clamp-3">
                  {card.description}
                </p>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-w-[260px] max-w-[260px] flex-shrink-0 snap-start">
      <div className="overflow-hidden rounded-lg border border-slate-600 bg-slate-800 shadow-lg">
        {/* Card Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-700">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Preview component with user-provided URLs from various sources
            <img
              src={card.imageUrl}
              alt={card.type === 'person' ? card.name : card.type === 'product' || card.type === 'location' ? card.title : card.title || 'Card image'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              画像なし
            </div>
          )}
        </div>

        {/* Card Content */}
        {renderCardContent()}

        {/* Action Buttons */}
        {card.actions.length > 0 && (
          <div className="space-y-1 border-t border-slate-700 p-2">
            {card.actions.map((action, idx) => (
              <ActionButton key={idx} action={action} />
            ))}
          </div>
        )}

        {/* Card Indicator */}
        <div className="border-t border-slate-700 bg-slate-900/50 px-3 py-1.5 text-center text-xs text-slate-500">
          {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}

/**
 * CardPreview Component
 *
 * Displays cards in a horizontal scrollable carousel with LINE-style UI
 */
export function CardPreview({ cards }: CardPreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = 260 + 12; // card width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (cards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30">
        <div className="text-center">
          <p className="text-sm text-slate-500">カードがありません</p>
          <p className="mt-1 text-xs text-slate-600">カードを追加してプレビューを表示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-300">
          プレビュー
        </div>
        <div className="text-xs text-slate-500">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* LINE-style Message Container */}
      <div className="rounded-lg border border-slate-700/50 bg-gradient-to-b from-slate-900/40 to-slate-800/40 p-4">
        {/* Mock LINE Chat Bubble */}
        <div className="flex justify-end">
          <div className="w-full max-w-[600px]">
            {/* Carousel Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#475569 #1e293b'
              }}
            >
              {cards.map((card, index) => (
                <CardItem
                  key={card.id}
                  card={card}
                  index={index}
                  total={cards.length}
                />
              ))}
            </div>

            {/* Scroll Hint */}
            {cards.length > 1 && (
              <div className="mt-2 text-center text-xs text-slate-600">
                左右にスクロールしてカードを確認
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3">
        <p className="text-xs text-slate-400">
          このプレビューは LINE アプリでの表示イメージです。
          実際の表示は端末やアプリのバージョンにより異なる場合があります。
        </p>
      </div>
    </div>
  );
}
