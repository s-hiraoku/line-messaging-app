"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageUploader } from "@/app/dashboard/_components/image-uploader";
import { ActionEditor } from "./action-editor";
import type { ImageCard } from "./types";

interface CardFormImageProps {
  card: ImageCard;
  onChange: (updates: Partial<ImageCard>) => void;
}

/**
 * CardFormImage Component
 *
 * Form for editing image-type cards with optional title and description.
 * Primary focus is on the image with a larger preview display.
 *
 * Features:
 * - Image upload with ImageUploader component
 * - Optional title (max 40 characters)
 * - Optional description (max 60 characters)
 * - Required actions (max 3, managed by ActionEditor)
 * - Real-time validation
 * - Character count display
 * - Larger image preview than other card forms
 */
export function CardFormImage({ card, onChange }: CardFormImageProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form on mount and when card changes
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);

  /**
   * Validates the entire form and returns whether it's valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Image URL validation (required)
    if (!card.imageUrl || card.imageUrl.trim().length === 0) {
      newErrors.imageUrl = "画像は必須です";
    }

    // Title validation (optional, max 40 characters)
    if (card.title && card.title.length > 40) {
      newErrors.title = "タイトルは40文字以内で入力してください";
    }

    // Description validation (optional, max 60 characters)
    if (card.description && card.description.length > 60) {
      newErrors.description = "説明は60文字以内で入力してください";
    }

    // Actions validation (required, at least 1 action)
    if (!card.actions || card.actions.length === 0) {
      newErrors.actions = "アクションは1つ以上設定してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles image upload completion
   */
  const handleImageUpload = (url: string) => {
    onChange({ imageUrl: url });
  };

  /**
   * Handles title change
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({ title: value || undefined });
  };

  /**
   * Handles description change
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange({ description: value || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section - Primary Focus */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          画像 <span className="text-red-400">*</span>
        </label>
        <ImageUploader
          onImageUploaded={handleImageUpload}
          placeholder="画像カード用の画像をアップロード"
        />
        {errors.imageUrl && (
          <p className="text-xs text-red-400">{errors.imageUrl}</p>
        )}
      </div>

      {/* Larger Image Preview */}
      {card.imageUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            プレビュー
          </label>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
            <Image
              src={card.imageUrl}
              alt="Card preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      )}

      {/* Title Input (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          タイトル (オプション)
        </label>
        <input
          type="text"
          value={card.title || ""}
          onChange={handleTitleChange}
          maxLength={40}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="画像のタイトルを入力 (最大40文字)"
        />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {(card.title || "").length}/40文字
          </p>
          {card.title && (
            <button
              type="button"
              onClick={() => onChange({ title: undefined })}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Description Input (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          説明 (オプション)
        </label>
        <textarea
          value={card.description || ""}
          onChange={handleDescriptionChange}
          maxLength={60}
          rows={3}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="画像の説明を入力 (最大60文字)"
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {(card.description || "").length}/60文字
          </p>
          {card.description && (
            <button
              type="button"
              onClick={() => onChange({ description: undefined })}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Actions Section (Required) */}
      <ActionEditor
        actions={card.actions}
        onChange={(actions) => onChange({ actions })}
        maxActions={3}
      />
      {errors.actions && (
        <p className="text-xs text-red-400">{errors.actions}</p>
      )}
    </div>
  );
}
