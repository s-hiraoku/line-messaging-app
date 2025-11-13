'use client';

/**
 * Card Type Selector - Example Usage
 *
 * Demonstrates how to use the CardTypeSelector component
 * in different scenarios.
 */

import { useState } from 'react';
import { CardTypeSelector } from './card-type-selector';
import type { CardType } from './types';

/**
 * Basic Example
 */
export function BasicExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CardType | null>(null);

  const handleSelect = (type: CardType) => {
    setSelectedType(type);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        カードタイプを選択
      </button>

      {selectedType && (
        <div className="rounded-md bg-slate-800 p-4">
          <p className="text-white">選択されたタイプ: {selectedType}</p>
        </div>
      )}

      <CardTypeSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}

/**
 * Integration Example with Card Creation Flow
 */
export function CardCreationFlowExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<Array<{ id: string; type: CardType }>>([]);

  const handleAddCard = () => {
    setIsOpen(true);
  };

  const handleTypeSelect = (type: CardType) => {
    const newCard = {
      id: `card-${Date.now()}`,
      type,
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          カード一覧 ({cards.length} / 9)
        </h3>
        <button
          onClick={handleAddCard}
          disabled={cards.length >= 9}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          カードを追加
        </button>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-md border border-slate-700 bg-slate-800 p-4">
            <p className="text-white">
              ID: {card.id} - タイプ: {card.type}
            </p>
          </div>
        ))}
      </div>

      <CardTypeSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleTypeSelect}
      />
    </div>
  );
}

/**
 * Example with State Management
 */
export function StateManagementExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Array<{ type: CardType; timestamp: number }>>([]);

  const handleSelect = (type: CardType) => {
    setHistory((prev) => [
      ...prev,
      {
        type,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          カードタイプを選択
        </button>
        <button
          onClick={handleClearHistory}
          className="rounded-md bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
        >
          履歴をクリア
        </button>
      </div>

      {history.length > 0 && (
        <div className="rounded-md border border-slate-700 bg-slate-800 p-4">
          <h4 className="mb-2 font-semibold text-white">選択履歴</h4>
          <ul className="space-y-1">
            {history.map((item, index) => (
              <li key={index} className="text-sm text-slate-300">
                {new Date(item.timestamp).toLocaleTimeString()} - {item.type}
              </li>
            ))}
          </ul>
        </div>
      )}

      <CardTypeSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}

/**
 * Demo Page Component
 */
export default function CardTypeSelectorExamples() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-white">CardTypeSelector Examples</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Basic Usage</h2>
        <BasicExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Card Creation Flow</h2>
        <CardCreationFlowExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">With State Management</h2>
        <StateManagementExample />
      </section>
    </div>
  );
}
