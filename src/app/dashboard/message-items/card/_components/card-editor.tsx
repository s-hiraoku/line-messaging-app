'use client';

/**
 * Card Editor - Main Component
 *
 * Orchestrates the card message editor with state management and coordination
 * between the card list and individual card form components.
 *
 * State Management:
 * - cards: Card[] (managed internally)
 * - selectedCardId: string | null (currently selected card for editing)
 * - showTypeSelector: boolean (modal visibility for adding new cards)
 *
 * Key Features:
 * - Add/update/delete/reorder cards
 * - Minimum 1 card, maximum 9 cards
 * - Dynamic form rendering based on selected card type
 * - Type-safe card operations with validation
 * - Seamless integration of all sub-components
 */

import { useState, useEffect, useCallback } from 'react';
import { CardList } from './card-list';
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
   * Deletes a card by ID
   * Prevents deletion if only one card remains
   */
  const deleteCard = useCallback((id: string) => {
    if (cards.length <= 1) {
      console.warn('Cannot delete the last card. At least one card is required.');
      return;
    }

    setCards((prevCards) => {
      const updatedCards = prevCards.filter((card) => card.id !== id);

      // If the deleted card was selected, select another card
      if (selectedCardId === id) {
        // Find the index of the deleted card
        const deletedIndex = prevCards.findIndex((card) => card.id === id);
        // Select the previous card, or the first card if deleting the first one
        const newSelectedIndex = deletedIndex > 0 ? deletedIndex - 1 : 0;
        setSelectedCardId(updatedCards[newSelectedIndex]?.id || null);
      }

      return updatedCards;
    });
  }, [cards.length, selectedCardId]);

  /**
   * Reorders cards using drag and drop
   */
  const reorderCards = useCallback((oldIndex: number, newIndex: number) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const [movedCard] = newCards.splice(oldIndex, 1);
      newCards.splice(newIndex, 0, movedCard);
      return newCards;
    });
  }, []);

  /**
   * Selects a card for editing
   */
  const selectCard = useCallback((id: string) => {
    setSelectedCardId(id);
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

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top - Card List (Horizontal) */}
      <div className="flex-shrink-0">
        <CardList
          cards={cards}
          selectedId={selectedCardId}
          onSelect={selectCard}
          onDelete={deleteCard}
          onReorder={reorderCards}
          onAdd={handleAddCard}
        />
      </div>

      {/* Bottom - Selected Card Form (Full Width) */}
      <div className="flex-1 overflow-y-auto">
        <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-800/60 p-6 shadow-lg">
          {/* Form Header with improved design */}
          {selectedCard && (
            <div className="mb-6 border-b border-slate-700/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/30">
                  {selectedCard.type === 'product' && (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {selectedCard.type === 'location' && (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {selectedCard.type === 'person' && (
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {selectedCard.type === 'image' && (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    カード編集
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {selectedCard.type === 'product' && '商品カード'}
                    {selectedCard.type === 'location' && '場所カード'}
                    {selectedCard.type === 'person' && '人物カード'}
                    {selectedCard.type === 'image' && '画像カード'}
                    の情報を編集してください
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Form Rendering */}
          {renderCardForm()}
        </div>
      </div>

      {/* Card Type Selector Modal */}
      <CardTypeSelector
        isOpen={showTypeSelector}
        onClose={handleCloseTypeSelector}
        onSelect={handleTypeSelect}
      />
    </div>
  );
}
