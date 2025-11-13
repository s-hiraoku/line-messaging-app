'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ImageUploader } from '@/app/dashboard/_components/image-uploader';
import { ActionEditor } from './action-editor';
import type { ProductCard } from './types';

interface ProductFormProps {
  card: ProductCard;
  onChange: (updates: Partial<ProductCard>) => void;
}

/**
 * ProductForm Component
 *
 * Form component for editing product cards in the card message editor.
 * Manages product-specific fields with real-time validation and debouncing.
 *
 * Features:
 * - Title field (required, max 40 characters)
 * - Description field (required, max 60 characters)
 * - Price field (optional, number >= 0)
 * - Image upload (required, uses ImageUploader component)
 * - Actions management (required, max 3 actions)
 * - Real-time validation with 500ms debounce
 * - Character count display for text fields
 * - Clear error messages for user guidance
 */
export function ProductForm({ card, onChange }: ProductFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Validate form on mount and when card changes
  useEffect(() => {
    validateForm(card);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.title, card.description, card.price, card.imageUrl, card.actions]);

  /**
   * Validates the entire form and returns validation errors
   */
  const validateForm = (productCard: ProductCard): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!productCard.title || productCard.title.trim().length === 0) {
      newErrors.title = 'タイトルは必須です';
    } else if (productCard.title.length > 40) {
      newErrors.title = 'タイトルは40文字以内で入力してください';
    }

    // Description validation
    if (!productCard.description || productCard.description.trim().length === 0) {
      newErrors.description = '説明は必須です';
    } else if (productCard.description.length > 60) {
      newErrors.description = '説明は60文字以内で入力してください';
    }

    // Price validation (optional, but if provided must be >= 0)
    if (productCard.price !== undefined && productCard.price !== null) {
      if (typeof productCard.price !== 'number' || isNaN(productCard.price)) {
        newErrors.price = '価格は数値で入力してください';
      } else if (productCard.price < 0) {
        newErrors.price = '価格は0以上で入力してください';
      }
    }

    // Image validation
    if (!productCard.imageUrl || productCard.imageUrl.trim().length === 0) {
      newErrors.imageUrl = '画像は必須です';
    }

    // Actions validation
    if (!productCard.actions || productCard.actions.length === 0) {
      newErrors.actions = 'アクションは最低1つ必要です';
    } else if (productCard.actions.length > 3) {
      newErrors.actions = 'アクションは最大3つまで設定できます';
    }

    setErrors(newErrors);
    return newErrors;
  };

  /**
   * Handles field updates with debouncing for validation
   */
  const handleFieldChange = useCallback(
    (field: keyof ProductCard, value: string | number | undefined) => {
      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Immediate update to card data
      onChange({ [field]: value });

      // Debounced validation (500ms)
      const timer = setTimeout(() => {
        validateForm({ ...card, [field]: value });
      }, 500);

      setDebounceTimer(timer);
    },
    [card, onChange, debounceTimer]
  );

  /**
   * Handles title change
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFieldChange('title', value);
  };

  /**
   * Handles description change
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleFieldChange('description', value);
  };

  /**
   * Handles price change
   */
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty value (optional field)
    if (value === '') {
      handleFieldChange('price', undefined);
      return;
    }

    // Parse as number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleFieldChange('price', numValue);
    }
  };

  /**
   * Handles image upload completion
   */
  const handleImageUploaded = (url: string) => {
    onChange({ imageUrl: url });

    // Clear image error immediately on successful upload
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.imageUrl;
      return newErrors;
    });
  };

  /**
   * Handles actions change from ActionEditor
   */
  const handleActionsChange = (actions: ProductCard['actions']) => {
    onChange({ actions });

    // Clear actions error if at least one action exists
    if (actions.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.actions;
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-1.5">
        <label htmlFor="product-title" className="text-sm font-medium text-slate-300">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          id="product-title"
          type="text"
          value={card.title}
          onChange={handleTitleChange}
          maxLength={40}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="商品名を入力 (最大40文字)"
        />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title}</p>
        )}
        <p className="text-xs text-slate-500">{card.title.length}/40文字</p>
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label htmlFor="product-description" className="text-sm font-medium text-slate-300">
          説明 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="product-description"
          value={card.description}
          onChange={handleDescriptionChange}
          maxLength={60}
          rows={3}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="商品の説明を入力 (最大60文字)"
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description}</p>
        )}
        <p className="text-xs text-slate-500">{card.description.length}/60文字</p>
      </div>

      {/* Price Field (Optional) */}
      <div className="space-y-1.5">
        <label htmlFor="product-price" className="text-sm font-medium text-slate-300">
          価格 (オプション)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            ¥
          </span>
          <input
            id="product-price"
            type="number"
            value={card.price ?? ''}
            onChange={handlePriceChange}
            min={0}
            step={1}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        {errors.price && (
          <p className="text-xs text-red-400">{errors.price}</p>
        )}
        <p className="text-xs text-slate-500">商品の価格を入力してください</p>
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">
          画像 <span className="text-red-400">*</span>
        </label>
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          placeholder="商品画像をアップロード (JPEG/PNG, 1024x1024px以上)"
        />
        {errors.imageUrl && (
          <p className="text-xs text-red-400">{errors.imageUrl}</p>
        )}
        {card.imageUrl && (
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
            <Image
              src={card.imageUrl}
              alt="アップロード済み画像"
              width={128}
              height={128}
              className="h-32 w-32 rounded-md object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions Editor */}
      <div className="space-y-1.5">
        <ActionEditor
          actions={card.actions}
          onChange={handleActionsChange}
          maxActions={3}
        />
        {errors.actions && (
          <p className="text-xs text-red-400">{errors.actions}</p>
        )}
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-yellow-400 mb-2">
            入力内容に問題があります
          </p>
          <ul className="space-y-1 text-xs text-yellow-300">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
