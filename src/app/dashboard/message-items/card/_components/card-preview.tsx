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
    <div className="flex-1 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9] cursor-pointer shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
      {action.label}
    </div>
  );
}

/**
 * Renders a single card based on its type
 */
function CardItem({ card, index, total }: { card: Card; index: number; total: number }) {
  const previewImageUrl = card.templatePreviewUrl || card.templateImageUrl || card.imageUrl;
  const renderCardContent = () => {
    switch (card.type) {
      case 'product':
        return (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="mb-1 text-sm font-bold text-gray-800 line-clamp-2">
                {card.title}
              </h3>
              <p className="mb-2 text-xs font-mono text-gray-700/60 line-clamp-3">
                {card.description}
              </p>
              {card.price !== undefined && (
                <div className="text-sm font-bold text-[#00B900]">
                  ¥{card.price.toLocaleString()}
                </div>
              )}
            </div>
          </>
        );

      case 'location':
        return (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="mb-1 text-sm font-bold text-gray-800 line-clamp-2">
                {card.title}
              </h3>
              <p className="mb-1 text-xs font-mono text-gray-700/60 line-clamp-2">
                {card.address}
              </p>
              {card.hours && (
                <p className="text-xs font-mono text-gray-700/40">
                  {card.hours}
                </p>
              )}
            </div>
          </>
        );

      case 'person':
        return (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="mb-1 text-sm font-bold text-gray-800 line-clamp-2">
                {card.name}
              </h3>
              <p className="mb-2 text-xs font-mono text-gray-700/60 line-clamp-3">
                {card.description}
              </p>
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-[#FFE500] px-2 py-0.5 text-xs font-bold text-gray-800 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_4px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]"
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
            <div className="p-3 border-b border-gray-200">
              {card.title && (
                <h3 className="mb-1 text-sm font-bold text-gray-800 line-clamp-2">
                  {card.title}
                </h3>
              )}
              {card.description && (
                <p className="text-xs font-mono text-gray-700/60 line-clamp-3">
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
      <div className="overflow-hidden rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
        {/* Card Image with loading state simulation */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e8f5e9] border-b border-gray-200">
          {previewImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Preview component with user-provided URLs from various sources
            <img
              src={previewImageUrl}
              alt={card.type === 'person' ? card.name : card.type === 'product' || card.type === 'location' ? card.title : card.title || 'Card image'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-700/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-mono text-gray-700/40">画像なし</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        {renderCardContent()}

        {/* Action Buttons with improved styling */}
        {card.actions.length > 0 && (
          <div className="space-y-1.5 border-t border-gray-200 p-3 bg-[#e8f5e9]">
            {card.actions.map((action, idx) => (
              <ActionButton key={idx} action={action} />
            ))}
          </div>
        )}

        {/* Card Indicator with badge style */}
        <div className="border-t border-gray-200 bg-[#e8f5e9] px-3 py-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white text-xs font-bold text-gray-800 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_4px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]">
            <span>{index + 1}</span>
            <span>/</span>
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
      <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-[#e8f5e9] transition-all duration-300">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-700/60">カードがありません</p>
          <p className="mt-1 text-xs font-mono text-gray-700/40">カードを追加してプレビューを表示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Header with better visual hierarchy */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-800 mb-1">
            プレビュー
          </h3>
          <p className="text-xs font-mono text-gray-700/60">
            LINE での表示イメージ
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
          <span className="text-xs font-bold text-gray-800">{currentIndex + 1}</span>
          <span className="text-xs text-gray-700/40">/</span>
          <span className="text-xs text-gray-700/60">{cards.length}</span>
        </div>
      </div>

      {/* LINE-style Message Container with enhanced styling */}
      <div className="rounded-2xl bg-[#e8f5e9] p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
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
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-700/60">
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
      <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
        <svg className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-mono text-gray-700/70 leading-relaxed">
          このプレビューは LINE アプリでの表示イメージです。
          実際の表示は端末やアプリのバージョンにより異なる場合があります。
        </p>
      </div>
    </div>
  );
}
