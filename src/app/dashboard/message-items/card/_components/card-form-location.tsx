"use client";

import { useState, useEffect } from "react";
import type { LocationCard } from "./types";
import { ImageCropUploader } from "@/app/dashboard/_components/image-crop-uploader";
import { ActionEditor } from "./action-editor";

interface LocationFormProps {
  card: LocationCard;
  onChange: (updates: Partial<LocationCard>) => void;
}

/**
 * LocationForm Component
 *
 * Form for editing location card properties.
 * Manages title, address, hours (optional), image, and actions.
 *
 * Features:
 * - Real-time validation with character limits
 * - Character count display for each field
 * - Required field indicators
 * - Error messages for validation failures
 * - Integrated ImageUploader and ActionEditor components
 */
export function LocationForm({ card, onChange }: LocationFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate form on mount and when card changes
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.title, card.address, card.hours, card.imageUrl, card.actions]);

  /**
   * Validates all form fields and returns error object
   */
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Title validation (required, max 40 chars)
    if (!card.title || card.title.trim().length === 0) {
      newErrors.title = "タイトルは必須です";
    } else if (card.title.length > 40) {
      newErrors.title = "タイトルは40文字以内で入力してください";
    }

    // Address validation (required, max 60 chars)
    if (!card.address || card.address.trim().length === 0) {
      newErrors.address = "住所は必須です";
    } else if (card.address.length > 60) {
      newErrors.address = "住所は60文字以内で入力してください";
    }

    // Hours validation (optional, max 60 chars)
    if (card.hours && card.hours.length > 60) {
      newErrors.hours = "営業時間は60文字以内で入力してください";
    }

    // Image validation (required)
    if (!card.imageUrl || card.imageUrl.trim().length === 0) {
      newErrors.imageUrl = "画像は必須です";
    }

    // Actions validation (required, max 3)
    if (!card.actions || card.actions.length === 0) {
      newErrors.actions = "最低1つのアクションが必要です";
    } else if (card.actions.length > 3) {
      newErrors.actions = "アクションは最大3つまでです";
    }

    setErrors(newErrors);
    return newErrors;
  };

  /**
   * Handles field blur event to mark field as touched
   */
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  /**
   * Updates title with validation
   */
  const handleTitleChange = (value: string) => {
    onChange({ title: value });
  };

  /**
   * Updates address with validation
   */
  const handleAddressChange = (value: string) => {
    onChange({ address: value });
  };

  /**
   * Updates hours with validation
   */
  const handleHoursChange = (value: string) => {
    onChange({ hours: value || undefined });
  };

  /**
   * Updates image URL
   */
  const handleImageUploaded = (url: string) => {
    onChange({ imageUrl: url });
    setTouched({ ...touched, imageUrl: true });
  };

  /**
   * Updates actions
   */
  const handleActionsChange = (actions: LocationCard["actions"]) => {
    onChange({ actions });
    setTouched({ ...touched, actions: true });
  };

  /**
   * Helper to determine if error should be shown
   */
  const shouldShowError = (field: string): boolean => {
    return touched[field] === true && errors[field] !== undefined;
  };

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <label htmlFor="location-title" className="text-sm font-medium text-slate-300">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          id="location-title"
          type="text"
          value={card.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => handleBlur("title")}
          maxLength={40}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="場所の名前を入力 (例: 東京タワー)"
        />
        {shouldShowError("title") && (
          <p className="text-xs text-red-400">{errors.title}</p>
        )}
        <div className="flex justify-between text-xs">
          <p className="text-slate-500">{card.title.length}/40文字</p>
          {card.title.length >= 35 && card.title.length < 40 && (
            <p className="text-yellow-400">文字数制限に近づいています</p>
          )}
          {card.title.length === 40 && (
            <p className="text-red-400">文字数制限に達しました</p>
          )}
        </div>
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <label htmlFor="location-address" className="text-sm font-medium text-slate-300">
          住所 <span className="text-red-400">*</span>
        </label>
        <input
          id="location-address"
          type="text"
          value={card.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onBlur={() => handleBlur("address")}
          maxLength={60}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="住所を入力 (例: 東京都港区芝公園4-2-8)"
        />
        {shouldShowError("address") && (
          <p className="text-xs text-red-400">{errors.address}</p>
        )}
        <div className="flex justify-between text-xs">
          <p className="text-slate-500">{card.address.length}/60文字</p>
          {card.address.length >= 55 && card.address.length < 60 && (
            <p className="text-yellow-400">文字数制限に近づいています</p>
          )}
          {card.address.length === 60 && (
            <p className="text-red-400">文字数制限に達しました</p>
          )}
        </div>
      </div>

      {/* Hours Field (Optional) */}
      <div className="space-y-2">
        <label htmlFor="location-hours" className="text-sm font-medium text-slate-300">営業時間</label>
        <input
          id="location-hours"
          type="text"
          value={card.hours || ""}
          onChange={(e) => handleHoursChange(e.target.value)}
          onBlur={() => handleBlur("hours")}
          maxLength={60}
          className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="営業時間を入力 (例: 9:00-21:00)"
        />
        {shouldShowError("hours") && (
          <p className="text-xs text-red-400">{errors.hours}</p>
        )}
        <div className="flex justify-between text-xs">
          <p className="text-slate-500">{(card.hours || "").length}/60文字</p>
          {card.hours && card.hours.length >= 55 && card.hours.length < 60 && (
            <p className="text-yellow-400">文字数制限に近づいています</p>
          )}
          {card.hours && card.hours.length === 60 && (
            <p className="text-red-400">文字数制限に達しました</p>
          )}
        </div>
      </div>

      {/* Image Upload Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          画像 <span className="text-red-400">*</span>
        </label>
        <ImageCropUploader
          onImageUploaded={handleImageUploaded}
          defaultAspectRatio="LANDSCAPE"
          placeholder="場所の画像をアップロード (JPEG/PNG、10MB以下、1024x1024px以上)"
        />
        {shouldShowError("imageUrl") && (
          <p className="text-xs text-red-400">{errors.imageUrl}</p>
        )}
        {card.imageUrl && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400 mb-2">現在の画像:</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- Preview component with user-provided URLs from various sources */}
              <img
                src={card.imageUrl}
                alt={card.title || "Location image"}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 break-all">{card.imageUrl}</p>
          </div>
        )}
      </div>

      {/* Actions Field */}
      <div className="space-y-2">
        <ActionEditor
          actions={card.actions}
          onChange={handleActionsChange}
          maxActions={3}
        />
        {shouldShowError("actions") && (
          <p className="text-xs text-red-400">{errors.actions}</p>
        )}
      </div>

      {/* Form Summary */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">入力状況</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">タイトル</span>
            <span
              className={
                card.title && card.title.trim().length > 0
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {card.title && card.title.trim().length > 0 ? "✓" : "ー"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">住所</span>
            <span
              className={
                card.address && card.address.trim().length > 0
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {card.address && card.address.trim().length > 0 ? "✓" : "ー"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">営業時間 (オプション)</span>
            <span
              className={
                card.hours && card.hours.trim().length > 0
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {card.hours && card.hours.trim().length > 0 ? "✓" : "ー"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">画像</span>
            <span
              className={
                card.imageUrl && card.imageUrl.trim().length > 0
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {card.imageUrl && card.imageUrl.trim().length > 0 ? "✓" : "ー"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">アクション</span>
            <span
              className={
                card.actions.length > 0 ? "text-emerald-400" : "text-slate-500"
              }
            >
              {card.actions.length > 0
                ? `✓ (${card.actions.length}/3)`
                : "ー"}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <h4 className="text-sm font-medium text-red-400 mb-2">
            入力エラー ({Object.keys(errors).length}件)
          </h4>
          <ul className="space-y-1 text-xs text-red-300">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
