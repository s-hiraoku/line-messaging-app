/**
 * CardList Component Usage Example
 *
 * This file demonstrates how to use the CardList component
 * in the card message editor.
 */

'use client';

import { useState } from 'react';
import { CardList } from './card-list';
import { createDefaultCard } from './utils';
import type { Card } from './types';

export function CardListExample() {
  const [cards, setCards] = useState<Card[]>([
    createDefaultCard('product'),
    createDefaultCard('location'),
    createDefaultCard('person'),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(cards[0]?.id || null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    console.log('Selected card:', id);
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    // If deleted card was selected, select the first remaining card
    if (selectedId === id && cards.length > 1) {
      const remainingCards = cards.filter((card) => card.id !== id);
      setSelectedId(remainingCards[0].id);
    }
    console.log('Deleted card:', id);
  };

  const handleReorder = (oldIndex: number, newIndex: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const [removed] = newCards.splice(oldIndex, 1);
      newCards.splice(newIndex, 0, removed);
      return newCards;
    });
    console.log('Reordered:', { oldIndex, newIndex });
  };

  const handleAdd = () => {
    // In a real implementation, you would show a dialog to select card type
    const newCard = createDefaultCard('product');
    setCards((prev) => [...prev, newCard]);
    setSelectedId(newCard.id);
    console.log('Added new card:', newCard.id);
  };

  return (
    <div className="max-w-md space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
      <h2 className="text-lg font-semibold text-white">CardList Example</h2>

      <CardList
        cards={cards}
        selectedId={selectedId}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onAdd={handleAdd}
      />

      {/* Selected Card Info */}
      {selectedId && (
        <div className="rounded border border-slate-700 bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-300">Selected Card</h3>
          <pre className="overflow-auto text-xs text-slate-400">
            {JSON.stringify(
              cards.find((card) => card.id === selectedId),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
