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
    <div className="flex-1 rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2.5 text-center text-xs font-semibold text-slate-200 transition-all hover:bg-slate-600/50 hover:border-slate-500 hover:text-white cursor-pointer active:scale-95">
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
      <div className="overflow-hidden rounded-xl border border-slate-600/70 bg-slate-800/90 shadow-xl hover:shadow-2xl transition-shadow duration-200">
        {/* Card Image with loading state simulation */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-700/50">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Preview component with user-provided URLs from various sources
            <img
              src={card.imageUrl}
              alt={card.type === 'person' ? card.name : card.type === 'product' || card.type === 'location' ? card.title : card.title || 'Card image'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-slate-500">画像なし</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        {renderCardContent()}

        {/* Action Buttons with improved styling */}
        {card.actions.length > 0 && (
          <div className="space-y-1.5 border-t border-slate-700/70 p-3 bg-slate-900/30">
            {card.actions.map((action, idx) => (
              <ActionButton key={idx} action={action} />
            ))}
          </div>
        )}

        {/* Card Indicator with badge style */}
        <div className="border-t border-slate-700/70 bg-slate-900/60 px-3 py-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-700/50 text-xs font-medium text-slate-400">
            <span className="text-slate-300">{index + 1}</span>
            <span className="text-slate-600">/</span>
            <span>{total}</span>
          </span>
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
    <div className="space-y-4">
      {/* Preview Header with better visual hierarchy */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">
            プレビュー
          </h3>
          <p className="text-xs text-slate-400">
            LINE での表示イメージ
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600/50">
          <span className="text-xs font-semibold text-slate-300">{currentIndex + 1}</span>
          <span className="text-xs text-slate-500">/</span>
          <span className="text-xs text-slate-400">{cards.length}</span>
        </div>
      </div>

      {/* LINE-style Message Container with enhanced styling */}
      <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 p-5 shadow-lg">
        {/* Mock LINE Chat Bubble */}
        <div className="flex justify-end">
          <div className="w-full max-w-[600px]">
            {/* Carousel Container with improved scrollbar */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/80 hover:scrollbar-thumb-slate-500"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#64748b #1e293b'
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

            {/* Scroll Hint with better visibility */}
            {cards.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>左右にスクロールしてカードを確認</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Info with icon */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-slate-300 leading-relaxed">
          このプレビューは LINE アプリでの表示イメージです。
          実際の表示は端末やアプリのバージョンにより異なる場合があります。
        </p>
      </div>
    </div>
  );
}
