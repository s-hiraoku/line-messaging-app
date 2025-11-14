"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ImageCropUploader } from "@/app/dashboard/_components/image-crop-uploader";
import { ActionEditor } from "./action-editor";
import { ImageAreaEditor } from "./image-area-editor";
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
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          画像 <span className="text-red-600">*</span>
        </label>
        <ImageCropUploader
          onImageUploaded={handleImageUpload}
          defaultAspectRatio="FREE"
          placeholder="画像カード用の画像をアップロード"
        />
        {errors.imageUrl && (
          <p className="text-xs font-bold text-red-600">{errors.imageUrl}</p>
        )}
      </div>

      {/* Larger Image Preview */}
      {card.imageUrl && (
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-black">
            プレビュー
          </label>
          <div className="relative aspect-[16/9] overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          タイトル (オプション)
        </label>
        <input
          type="text"
          value={card.title || ""}
          onChange={handleTitleChange}
          maxLength={40}
          className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="画像のタイトルを入力 (最大40文字)"
        />
        {errors.title && (
          <p className="text-xs font-bold text-red-600">{errors.title}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-black/60">
            {(card.title || "").length}/40文字
          </p>
          {card.title && (
            <button
              type="button"
              onClick={() => onChange({ title: undefined })}
              className="text-xs font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Description Input (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          説明 (オプション)
        </label>
        <textarea
          value={card.description || ""}
          onChange={handleDescriptionChange}
          maxLength={60}
          rows={3}
          className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="画像の説明を入力 (最大60文字)"
        />
        {errors.description && (
          <p className="text-xs font-bold text-red-600">{errors.description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-black/60">
            {(card.description || "").length}/60文字
          </p>
          {card.description && (
            <button
              type="button"
              onClick={() => onChange({ description: undefined })}
              className="text-xs font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Image Area Editor */}
      <ImageAreaEditor
        imageUrl={card.imageUrl}
        onAreasChange={useCallback((areas: ImageCard['imageAreas']) => onChange({ imageAreas: areas }), [onChange])}
      />

      {/* Actions Section (Required) */}
      <ActionEditor
        actions={card.actions}
        onChange={(actions) => onChange({ actions })}
        maxActions={3}
      />
      {errors.actions && (
        <p className="text-xs font-bold text-red-600">{errors.actions}</p>
      )}
    </div>
  );
}
