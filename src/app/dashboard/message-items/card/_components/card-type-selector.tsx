'use client';

/**
 * Card Type Selector Component
 *
 * Modal dialog for selecting a card type when adding a new card.
 * Uses shadcn/ui Dialog component for improved accessibility and UX.
 *
 * Features:
 * - 4 card type options with visual representation
 * - Type name and description for each option
 * - Click to select card type
 * - Keyboard navigation and accessibility (provided by shadcn Dialog)
 */

import { ShoppingBag, MapPin, User, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  /**
   * Handle card type selection
   */
  const handleSelect = (type: CardType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-wider text-gray-800">
            カードタイプを選択
          </DialogTitle>
          <DialogDescription className="text-sm font-mono text-gray-700/60">
            作成するカードのタイプを選んでください
          </DialogDescription>
        </DialogHeader>

        {/* Card Type Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 py-4">
          {CARD_TYPES.map((cardType) => {
            const Icon = cardType.icon;
            return (
              <button
                key={cardType.type}
                onClick={() => handleSelect(cardType.type)}
                className="cursor-pointer group relative flex items-start gap-4 rounded-xl bg-white p-4 text-left transition-all duration-300 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:bg-[#e8f5e9] focus:outline-none focus:ring-2 focus:ring-[#00B900]"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8f5e9] transition-all duration-300 group-hover:scale-110 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
                  <Icon className="h-6 w-6 text-gray-800" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800">
                    {cardType.name}
                  </h3>
                  <p className="mt-1 text-sm font-mono text-gray-700/60 leading-relaxed">
                    {cardType.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-lg bg-white p-1 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_4px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]">
                    <svg
                      className="h-4 w-4 text-gray-800"
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
        <Alert className="rounded-xl bg-yellow-200 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
          <AlertDescription className="text-xs font-mono text-gray-800">
            カードタイプは後から変更できません。用途に合わせて適切なタイプを選択してください。
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
