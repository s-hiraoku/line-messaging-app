'use client';

/**
 * Card Editor - Main Component
 *
 * Orchestrates the card message editor with state management and coordination
 * between tabs and individual card form components.
 *
 * State Management:
 * - cards: Card[] (managed internally)
 * - selectedCardId: string | null (currently selected card for editing)
 * - showTypeSelector: boolean (modal visibility for adding new cards)
 *
 * Key Features:
 * - Add/update/delete cards
 * - Minimum 1 card, maximum 9 cards
 * - Tab-based navigation with validation badges
 * - Dynamic form rendering based on selected card type
 * - Type-safe card operations with validation
 * - Seamless integration of all sub-components
 */

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ShoppingBag,
  MapPin,
  User,
  Image as ImageIcon,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import { CardTypeSelector } from './card-type-selector';
import { ProductForm } from './card-form-product';
import { LocationForm } from './card-form-location';
import { PersonForm } from './card-form-person';
import { CardFormImage } from './card-form-image';
import { createDefaultCard } from './utils';
import type {
  Card,
  CardType,
  ProductCard,
  LocationCard,
  PersonCard,
  ImageCard,
} from './types';

interface CardEditorProps {
  initialCards?: Card[];
  onChange: (cards: Card[]) => void;
}

/**
 * Get card type icon, label, and color
 */
function getCardTypeInfo(type: CardType) {
  switch (type) {
    case 'product':
      return { icon: ShoppingBag, label: '商品', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    case 'location':
      return { icon: MapPin, label: '場所', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
    case 'person':
      return { icon: User, label: '人物', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'image':
      return { icon: ImageIcon, label: '画像', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
  }
}

/**
 * Get card title for display
 */
function getCardTitle(card: Card): string {
  switch (card.type) {
    case 'product':
      return card.title || '商品名未設定';
    case 'location':
      return card.title || '場所名未設定';
    case 'person':
      return card.name || '名前未設定';
    case 'image':
      return card.title || '画像カード';
  }
}

/**
 * Validates a card and returns whether it has errors
 */
function hasCardErrors(card: Card): boolean {
  switch (card.type) {
    case 'product':
      return !card.title?.trim() ||
             !card.description?.trim() ||
             !card.imageUrl?.trim() ||
             !card.actions?.length;
    case 'location':
      return !card.title?.trim() ||
             !card.address?.trim() ||
             !card.imageUrl?.trim() ||
             !card.actions?.length;
    case 'person':
      return !card.name?.trim() ||
             !card.description?.trim() ||
             !card.imageUrl?.trim() ||
             !card.actions?.length;
    case 'image':
      return !card.imageUrl?.trim() || !card.actions?.length;
  }
}

/**
 * Confirmation Dialog Component
 */
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-md p-6 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-start gap-4">
          <div className="rounded-full bg-red-500/10 p-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-600/50 bg-slate-700/50 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-600/50 hover:border-slate-500 active:scale-95"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/40 active:scale-95"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CardEditor Main Component
 */
export function CardEditor({ initialCards, onChange }: CardEditorProps) {
  const [cards, setCards] = useState<Card[]>(() => {
    // Initialize with provided cards or create a default product card
    if (initialCards && initialCards.length > 0) {
      return initialCards;
    }
    return [createDefaultCard('product')];
  });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(() => {
    // Select first card by default
    if (initialCards && initialCards.length > 0) {
      return initialCards[0].id;
    }
    // If no initial cards, the default card will be created above
    return null;
  });

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // Set selected card ID after cards are initialized
  useEffect(() => {
    if (selectedCardId === null && cards.length > 0) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  // Notify parent component of changes
  useEffect(() => {
    onChange(cards);
  }, [cards, onChange]);

  /**
   * Adds a new card with the specified type
   */
  const addCard = useCallback((type: CardType) => {
    if (cards.length >= 9) {
      console.warn('Maximum 9 cards allowed');
      return;
    }

    const newCard = createDefaultCard(type);
    setCards((prevCards) => [...prevCards, newCard]);
    setSelectedCardId(newCard.id);
  }, [cards.length]);

  /**
   * Updates an existing card with partial updates
   */
  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, ...updates } as Card : card
      )
    );
  }, []);

  /**
   * Handles delete button click - shows confirmation dialog
   */
  const handleDeleteClick = useCallback((card: Card) => {
    if (cards.length <= 1) {
      return;
    }

    setDeleteConfirm({
      id: card.id,
      title: getCardTitle(card),
    });
  }, [cards.length]);

  /**
   * Confirms and executes card deletion
   */
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirm) return;

    setCards((prevCards) => {
      const updatedCards = prevCards.filter((card) => card.id !== deleteConfirm.id);

      // If the deleted card was selected, select another card
      if (selectedCardId === deleteConfirm.id) {
        // Find the index of the deleted card
        const deletedIndex = prevCards.findIndex((card) => card.id === deleteConfirm.id);
        // Select the previous card, or the first card if deleting the first one
        const newSelectedIndex = deletedIndex > 0 ? deletedIndex - 1 : 0;
        setSelectedCardId(updatedCards[newSelectedIndex]?.id || null);
      }

      return updatedCards;
    });

    setDeleteConfirm(null);
  }, [deleteConfirm, selectedCardId]);

  /**
   * Cancels card deletion
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  /**
   * Opens the card type selector modal
   */
  const handleAddCard = useCallback(() => {
    if (cards.length >= 9) {
      return;
    }
    setShowTypeSelector(true);
  }, [cards.length]);

  /**
   * Handles card type selection from the modal
   */
  const handleTypeSelect = useCallback((type: CardType) => {
    addCard(type);
    setShowTypeSelector(false);
  }, [addCard]);

  /**
   * Closes the card type selector modal
   */
  const handleCloseTypeSelector = useCallback(() => {
    setShowTypeSelector(false);
  }, []);

  /**
   * Gets the currently selected card
   */
  const selectedCard = cards.find((card) => card.id === selectedCardId);

  /**
   * Renders the appropriate form component based on card type
   */
  const renderCardForm = () => {
    if (!selectedCard) {
      return (
        <div className="flex h-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/40 p-8">
          <div className="text-center">
            <p className="text-slate-400">カードを選択して編集を開始してください</p>
          </div>
        </div>
      );
    }

    const handleCardUpdate = (updates: Partial<Card>) => {
      updateCard(selectedCard.id, updates);
    };

    switch (selectedCard.type) {
      case 'product':
        return (
          <ProductForm
            card={selectedCard as ProductCard}
            onChange={handleCardUpdate}
          />
        );

      case 'location':
        return (
          <LocationForm
            card={selectedCard as LocationCard}
            onChange={handleCardUpdate}
          />
        );

      case 'person':
        return (
          <PersonForm
            card={selectedCard as PersonCard}
            onChange={handleCardUpdate}
          />
        );

      case 'image':
        return (
          <CardFormImage
            card={selectedCard as ImageCard}
            onChange={handleCardUpdate}
          />
        );

      default:
        return (
          <div className="flex h-full items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 p-8">
            <p className="text-red-400">
              不明なカードタイプ: {(selectedCard as Card).type}
            </p>
          </div>
        );
    }
  };

  const canAddCard = cards.length < 9;
  const canDeleteCard = cards.length > 1;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Card Tabs with improved styling */}
      <Tabs
        value={selectedCardId || undefined}
        onValueChange={setSelectedCardId}
        className="flex-1 flex flex-col"
      >
        {/* Tab Navigation */}
        <div className="flex-shrink-0 border-b border-slate-700/50 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-white">カード編集</h3>
              <p className="text-xs text-slate-400 mt-1">
                {cards.length} / 9 カード
                {canAddCard && (
                  <span className="text-slate-500 ml-2">
                    あと {9 - cards.length} 枚追加可能
                  </span>
                )}
              </p>
            </div>

            {/* Add Card Button */}
            <button
              onClick={handleAddCard}
              disabled={!canAddCard}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:scale-100"
              title={canAddCard ? '新しいカードを追加' : 'カードは最大9枚までです'}
            >
              <Plus className="h-4 w-4" />
              カードを追加
            </button>
          </div>

          {/* Tabs List - Horizontal Scrollable */}
          <TabsList className="w-full h-auto p-1 justify-start overflow-x-auto overflow-y-hidden bg-slate-800/50 border border-slate-700/50">
            {cards.map((card, index) => {
              const typeInfo = getCardTypeInfo(card.type);
              const Icon = typeInfo.icon;
              const hasErrors = hasCardErrors(card);
              const cardTitle = getCardTitle(card);

              return (
                <TabsTrigger
                  key={card.id}
                  value={card.id}
                  className="relative min-w-fit h-auto py-2.5 px-4 data-[state=active]:bg-slate-700/80 hover:bg-slate-700/40 group"
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    {/* Left: Card Icon and Info */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Card Icon */}
                      <div className={`rounded p-1.5 border ${typeInfo.color} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Card Info */}
                      <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {typeInfo.label} {index + 1}
                          </span>
                          {/* Error Badge */}
                          {hasErrors && (
                            <div className="flex items-center justify-center" title="入力エラーがあります">
                              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-300 truncate max-w-[120px]">
                          {cardTitle}
                        </span>
                      </div>
                    </div>

                    {/* Right: Delete Button */}
                    {canDeleteCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(card);
                        }}
                        className="cursor-pointer p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                        title="カードを削除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Helper Messages */}
          <div className="mt-3 space-y-2">
            {!canAddCard && (
              <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-300">
                  最大9枚までカードを作成できます
                </p>
              </div>
            )}
            {!canDeleteCard && (
              <div className="flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/30 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  少なくとも1枚のカードが必要です
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content - Card Forms */}
        <div className="flex-1 overflow-y-auto mt-4">
          {cards.map((card) => (
            <TabsContent
              key={card.id}
              value={card.id}
              className="mt-0 h-full data-[state=inactive]:hidden"
            >
              <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-800/60 p-6 shadow-lg">
                {/* Dynamic Form Rendering */}
                {(() => {
                  const handleCardUpdate = (updates: Partial<Card>) => {
                    updateCard(card.id, updates);
                  };

                  switch (card.type) {
                    case 'product':
                      return (
                        <ProductForm
                          card={card as ProductCard}
                          onChange={handleCardUpdate}
                        />
                      );
                    case 'location':
                      return (
                        <LocationForm
                          card={card as LocationCard}
                          onChange={handleCardUpdate}
                        />
                      );
                    case 'person':
                      return (
                        <PersonForm
                          card={card as PersonCard}
                          onChange={handleCardUpdate}
                        />
                      );
                    case 'image':
                      return (
                        <CardFormImage
                          card={card as ImageCard}
                          onChange={handleCardUpdate}
                        />
                      );
                    default:
                      return (
                        <div className="flex h-full items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 p-8">
                          <p className="text-red-400">
                            不明なカードタイプ: {(card as Card).type}
                          </p>
                        </div>
                      );
                  }
                })()}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Card Type Selector Modal */}
      <CardTypeSelector
        isOpen={showTypeSelector}
        onClose={handleCloseTypeSelector}
        onSelect={handleTypeSelect}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="カードを削除しますか?"
        message={`「${deleteConfirm?.title}」を削除してもよろしいですか? この操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
