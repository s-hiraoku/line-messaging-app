"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ImageCropUploader } from "@/app/dashboard/_components/image-crop-uploader";
import { ActionEditor } from "./action-editor";
import { TemplateImageEditor } from "./template-image-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/Button";
import type { ProductCard, TemplateArea } from "./types";

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
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const isTemplateMode = !!card.templateEnabled;

  // Validate form on mount and when card changes
  useEffect(() => {
    validateForm(card);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    card.title,
    card.description,
    card.price,
    card.imageUrl,
    card.actions,
    card.templateId,
    card.templateEnabled,
  ]);

  /**
   * Validates the entire form and returns validation errors
   */
  const validateForm = (productCard: ProductCard): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!productCard.title || productCard.title.trim().length === 0) {
      newErrors.title = "タイトルは必須です";
    } else if (productCard.title.length > 40) {
      newErrors.title = "タイトルは40文字以内で入力してください";
    }

    // Description validation
    if (
      !productCard.description ||
      productCard.description.trim().length === 0
    ) {
      newErrors.description = "説明は必須です";
    } else if (productCard.description.length > 60) {
      newErrors.description = "説明は60文字以内で入力してください";
    }

    // Price validation (optional, but if provided must be >= 0)
    if (productCard.price !== undefined && productCard.price !== null) {
      if (typeof productCard.price !== "number" || isNaN(productCard.price)) {
        newErrors.price = "価格は数値で入力してください";
      } else if (productCard.price < 0) {
        newErrors.price = "価格は0以上で入力してください";
      }
    }

    const requiresImage = !isTemplateMode;

    // Image validation
    if (requiresImage) {
      if (!productCard.imageUrl || productCard.imageUrl.trim().length === 0) {
        newErrors.imageUrl = "画像は必須です";
      }
    }

    // Actions validation
    if (!productCard.actions || productCard.actions.length === 0) {
      newErrors.actions = "アクションは最低1つ必要です";
    } else if (productCard.actions.length > 3) {
      newErrors.actions = "アクションは最大3つまで設定できます";
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
    handleFieldChange("title", value);
  };

  /**
   * Handles description change
   */
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    handleFieldChange("description", value);
  };

  /**
   * Handles price change
   */
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty value (optional field)
    if (value === "") {
      handleFieldChange("price", undefined);
      return;
    }

    // Parse as number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleFieldChange("price", numValue);
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
  const handleActionsChange = (actions: ProductCard["actions"]) => {
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

  const handleTemplateAreasChange = useCallback(
    (areas: TemplateArea[]) => {
      onChange({ templateAreas: areas });
    },
    [onChange]
  );

  const handleTemplatePreviewChange = useCallback(
    (previewUrl: string | null) => {
      onChange({ templatePreviewUrl: previewUrl ?? null });
    },
    [onChange]
  );

  const handleTemplateImageUrlChange = useCallback(
    (imageUrl: string | null) => {
      if (card.templateEnabled) {
        onChange({ templateImageUrl: imageUrl ?? null });
      }
    },
    [card.templateEnabled, onChange]
  );

  const handleTemplateChange = useCallback(
    (templateId: string | null) => {
      onChange({
        templateEnabled: true,
        templateId,
        ...(templateId ? { imageUrl: "", templateImageUrl: null } : {}),
      });
      if (templateId) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.imageUrl;
          return next;
        });
      }
    },
    [onChange, setErrors]
  );

  const handleTemplateModeToggle = (mode: "image" | "template") => {
    if (mode === "template") {
      onChange({
        templateEnabled: true,
        imageUrl: "",
        templatePreviewUrl: null,
        templateImageUrl: null,
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } else {
      onChange({
        templateEnabled: false,
        templateId: undefined,
        templateAreas: undefined,
        templatePreviewUrl: undefined,
        templateImageUrl: undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label
          htmlFor="product-title"
          className="text-sm font-bold uppercase tracking-wider text-gray-800"
        >
          タイトル <span className="text-red-600">*</span>
        </Label>
        <Input
          id="product-title"
          type="text"
          value={card.title}
          onChange={handleTitleChange}
          maxLength={40}
          className={`bg-white rounded-xl ${
            errors.title ? "ring-2 ring-red-400" : ""
          } font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300`}
          placeholder="商品名を入力 (最大40文字)"
        />
        <div className="flex items-center justify-between">
          {errors.title ? (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.title}
            </p>
          ) : (
            <p className="text-xs font-mono text-gray-600">
              商品のタイトルを入力してください
            </p>
          )}
          <Badge
            variant={card.title.length >= 35 ? "outline" : "secondary"}
            className="text-xs rounded-lg shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]"
          >
            {card.title.length}/40
          </Badge>
        </div>
      </div>

      <Separator className="bg-gray-200 h-[1px]" />

      {/* Description Field */}
      <div className="space-y-2">
        <Label
          htmlFor="product-description"
          className="text-sm font-bold uppercase tracking-wider text-gray-800"
        >
          説明 <span className="text-red-600">*</span>
        </Label>
        <Textarea
          id="product-description"
          value={card.description}
          onChange={handleDescriptionChange}
          maxLength={60}
          rows={3}
          className={`bg-white rounded-xl ${
            errors.description ? "ring-2 ring-red-400" : ""
          } font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all duration-300`}
          placeholder="商品の説明を入力 (最大60文字)"
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.description}
            </p>
          ) : (
            <p className="text-xs font-mono text-gray-600">
              商品の説明を入力してください
            </p>
          )}
          <Badge
            variant={card.description.length >= 55 ? "outline" : "secondary"}
            className="text-xs rounded-lg shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]"
          >
            {card.description.length}/60
          </Badge>
        </div>
      </div>

      <Separator className="bg-gray-200 h-[1px]" />

      {/* Price Field (Optional) */}
      <div className="space-y-2">
        <Label
          htmlFor="product-price"
          className="text-sm font-bold uppercase tracking-wider text-gray-800"
        >
          価格{" "}
          <Badge
            variant="secondary"
            className="text-xs ml-2 rounded-lg bg-[#e8f5e9] shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),inset_0_1px_3px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.06)]"
          >
            オプション
          </Badge>
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-800">
            ¥
          </span>
          <Input
            id="product-price"
            type="number"
            value={card.price ?? ""}
            onChange={handlePriceChange}
            min={0}
            step={1}
            className={`bg-white rounded-xl ${
              errors.price ? "ring-2 ring-red-400" : ""
            } pl-9 font-mono text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300`}
            placeholder="0"
          />
        </div>
        {errors.price ? (
          <p className="flex items-center gap-1.5 text-xs font-bold text-red-600">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errors.price}
          </p>
        ) : (
          <p className="text-xs font-mono text-gray-600">
            商品の価格を入力してください（任意）
          </p>
        )}
      </div>

      <Separator className="bg-gray-200 h-[1px]" />

      {/* Image Mode Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-bold uppercase tracking-wider text-gray-800">
          画像モード
        </Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={!isTemplateMode ? "secondary" : "outline"}
            className="rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => handleTemplateModeToggle("image")}
          >
            単一画像
          </Button>
          <Button
            type="button"
            variant={isTemplateMode ? "secondary" : "outline"}
            className="rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => handleTemplateModeToggle("template")}
          >
            テンプレート
          </Button>
        </div>
      </div>

      {!isTemplateMode && (
        <div className="space-y-2">
          <Label className="text-sm font-bold uppercase tracking-wider text-gray-800">
            画像 <span className="text-red-600">*</span>
          </Label>
          <ImageCropUploader
            onImageUploaded={handleImageUploaded}
            defaultAspectRatio="SQUARE"
            placeholder="商品画像をアップロード (JPEG/PNG, 1024x1024px以上)"
          />
          <p className="text-xs text-gray-600">
            テンプレートを選択するとこの画像は不要になります。
          </p>
          {errors.imageUrl && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.imageUrl}
            </p>
          )}
          {card.imageUrl && (
            <div className="rounded-2xl bg-[#e8f5e9] p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
              <p className="text-xs text-gray-700">プレビュー:</p>
              <Image
                src={card.imageUrl}
                alt="アップロード済み画像"
                width={128}
                height={128}
                className="h-32 w-32 rounded-xl object-cover shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]"
              />
            </div>
          )}
        </div>
      )}

      {isTemplateMode && (
        <TemplateImageEditor
          cardId={card.id}
          initialTemplateId={card.templateId}
          initialAreas={card.templateAreas}
          onTemplateChange={handleTemplateChange}
          onAreasChange={handleTemplateAreasChange}
          onPreviewChange={handleTemplatePreviewChange}
          onComposedImageChange={handleTemplateImageUrlChange}
        />
      )}

      <Separator className="bg-gray-200 h-[1px]" />

      {/* Actions Editor */}
      <div className="space-y-2">
        <ActionEditor
          actions={card.actions}
          onChange={handleActionsChange}
          maxActions={3}
        />
        {errors.actions && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-red-600">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errors.actions}
          </p>
        )}
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert
          variant="destructive"
          className="rounded-2xl bg-amber-50 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
        >
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-800">
                入力内容に問題があります ({Object.keys(errors).length}件)
              </p>
            </div>
            <ul className="space-y-2 text-xs font-mono text-gray-700 pl-7">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
