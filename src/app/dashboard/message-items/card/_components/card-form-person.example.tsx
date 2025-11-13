'use client';

import { useState } from 'react';
import { PersonForm } from './card-form-person';
import type { PersonCard } from './types';

/**
 * Example component demonstrating PersonForm usage
 */
export default function PersonFormExample() {
  const [card, setCard] = useState<PersonCard>({
    id: '1',
    type: 'person',
    name: '山田 太郎',
    description: 'プロジェクトマネージャー / 東京オフィス',
    tags: ['エンジニア', 'リーダー'],
    imageUrl: 'https://via.placeholder.com/800x800/4A5568/FFFFFF?text=Profile',
    actions: [
      {
        type: 'uri',
        label: 'プロフィール',
        uri: 'https://example.com/profile',
      },
    ],
  });

  const handleChange = (updates: Partial<PersonCard>) => {
    setCard((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">
          PersonForm Example
        </h1>

        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-6">
          <PersonForm card={card} onChange={handleChange} />
        </div>

        {/* Current state display */}
        <div className="mt-8 rounded-lg border border-slate-700/50 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Current Card State
          </h2>
          <pre className="text-xs text-slate-300 overflow-auto">
            {JSON.stringify(card, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
