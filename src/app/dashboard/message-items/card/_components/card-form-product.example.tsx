'use client';

import { useState } from 'react';
import { ProductForm } from './card-form-product';
import type { ProductCard } from './types';

/**
 * Example usage of ProductForm component
 *
 * This example demonstrates how to use the ProductForm component
 * to create and edit product cards for LINE messaging.
 */
export function ProductFormExample() {
  const [card, setCard] = useState<ProductCard>({
    id: 'example-product-1',
    type: 'product',
    title: 'Sample Product',
    description: 'This is a sample product description',
    price: 1500,
    imageUrl: 'https://via.placeholder.com/1024',
    actions: [
      {
        type: 'uri',
        label: '購入する',
        uri: 'https://example.com/buy',
      },
    ],
  });

  const handleChange = (updates: Partial<ProductCard>) => {
    setCard((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Product Form Example
          </h2>

          <ProductForm card={card} onChange={handleChange} />
        </div>

        {/* Card State Display */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Current Card State
          </h3>
          <pre className="overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-300">
            {JSON.stringify(card, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
