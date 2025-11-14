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
      <DialogContent className="max-w-2xl bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-wider text-black">
            カードタイプを選択
          </DialogTitle>
          <DialogDescription className="text-sm font-mono text-black/60">
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
                className="cursor-pointer group relative flex items-start gap-4 border-2 border-black bg-white p-4 text-left transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black bg-[#FFFEF5] transition group-hover:scale-110">
                  <Icon className="h-6 w-6 text-black" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">
                    {cardType.name}
                  </h3>
                  <p className="mt-1 text-sm font-mono text-black/60 leading-relaxed">
                    {cardType.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="border-2 border-black bg-white p-1">
                    <svg
                      className="h-4 w-4 text-black"
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
        <Alert className="border-2 border-black bg-yellow-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AlertDescription className="text-xs font-mono text-black">
            カードタイプは後から変更できません。用途に合わせて適切なタイプを選択してください。
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
