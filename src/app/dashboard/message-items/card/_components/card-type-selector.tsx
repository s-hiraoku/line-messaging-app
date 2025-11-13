'use client';

/**
 * Card Type Selector Component
 *
 * Modal dialog for selecting a card type when adding a new card.
 * Features:
 * - 4 card type options with visual representation
 * - Type name and description for each option
 * - Click to select card type
 * - Close button and overlay click to dismiss
 * - Keyboard navigation (Escape key)
 */

import { useEffect } from 'react';
import { X, ShoppingBag, MapPin, User, Image as ImageIcon } from 'lucide-react';
import type { CardType } from './types';

interface CardTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: CardType) => void;
}

/**
 * Card type configuration with metadata
 */
const CARD_TYPES = [
  {
    type: 'product' as const,
    icon: ShoppingBag,
    name: '商品',
    description: 'ECサイトの商品や販売アイテムの紹介に最適',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    hoverBg: 'hover:bg-blue-500/20',
  },
  {
    type: 'location' as const,
    icon: MapPin,
    name: '場所',
    description: '店舗やイベント会場などの場所情報の共有に',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    hoverBg: 'hover:bg-green-500/20',
  },
  {
    type: 'person' as const,
    icon: User,
    name: '人物',
    description: 'スタッフ紹介やプロフィール表示に',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50',
    hoverBg: 'hover:bg-purple-500/20',
  },
  {
    type: 'image' as const,
    icon: ImageIcon,
    name: '画像',
    description: 'シンプルな画像とキャプションの表示に',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    hoverBg: 'hover:bg-yellow-500/20',
  },
] as const;

/**
 * Card Type Selector Component
 */
export function CardTypeSelector({ isOpen, onClose, onSelect }: CardTypeSelectorProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Handle card type selection
   */
  const handleSelect = (type: CardType) => {
    onSelect(type);
    onClose();
  };

  /**
   * Handle overlay click to close
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">カードタイプを選択</h2>
            <p className="mt-1 text-sm text-slate-400">作成するカードのタイプを選んでください</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Card Type Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CARD_TYPES.map((cardType) => {
            const Icon = cardType.icon;
            return (
              <button
                key={cardType.type}
                onClick={() => handleSelect(cardType.type)}
                className={`
                  group relative flex items-start gap-4 rounded-lg border p-4 text-left transition
                  ${cardType.borderColor} ${cardType.bgColor} ${cardType.hoverBg}
                  hover:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg
                    bg-slate-800/60 transition group-hover:scale-110
                  `}
                >
                  <Icon className={`h-6 w-6 ${cardType.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${cardType.color}`}>{cardType.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{cardType.description}</p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute right-4 top-4 opacity-0 transition group-hover:opacity-100">
                  <div className="rounded-full bg-white/10 p-1">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Help Text */}
        <div className="mt-6 rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
          <p className="text-xs text-slate-400">
            カードタイプは後から変更できません。用途に合わせて適切なタイプを選択してください。
          </p>
        </div>
      </div>
    </div>
  );
}
