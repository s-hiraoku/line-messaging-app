'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageCropUploader } from '@/app/dashboard/_components/image-crop-uploader';
import { ActionEditor } from './action-editor';
import { TemplateImageEditor } from './template-image-editor';
import type { PersonCard, TemplateArea } from './types';
import { Button } from '@/components/ui/Button';

interface PersonFormProps {
  card: PersonCard;
  onChange: (updates: Partial<PersonCard>) => void;
}

/**
 * PersonForm Component
 *
 * Form component for editing person card details.
 * Supports name, description, tags, image upload, and actions.
 *
 * Features:
 * - Real-time validation with character counting
 * - Tag management (add/remove) with Enter key support
 * - Image upload integration
 * - Action editor integration
 * - Dark theme UI matching app style
 */
export function PersonForm({ card, onChange }: PersonFormProps) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isTemplateMode = !!card.templateEnabled;

  // Validate card fields on mount and when card changes
  useEffect(() => {
    validateCard(card);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.name, card.description, card.tags, card.imageUrl, card.actions, card.templateId, card.templateEnabled]);

  /**
   * Validates the card and returns validation errors
   */
  const validateCard = (cardToValidate: PersonCard): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation (required, max 40 characters)
    if (!cardToValidate.name || cardToValidate.name.trim().length === 0) {
      newErrors.name = '名前は必須です';
    } else if (cardToValidate.name.length > 40) {
      newErrors.name = '名前は40文字以内で入力してください';
    }

    // Description validation (required, max 60 characters)
    if (!cardToValidate.description || cardToValidate.description.trim().length === 0) {
      newErrors.description = '説明は必須です';
    } else if (cardToValidate.description.length > 60) {
      newErrors.description = '説明は60文字以内で入力してください';
    }

    // Tags validation (optional, each max 20 characters)
    if (cardToValidate.tags && cardToValidate.tags.length > 0) {
      const invalidTags = cardToValidate.tags.filter((tag) => tag.length > 20);
      if (invalidTags.length > 0) {
        newErrors.tags = 'タグは20文字以内で入力してください';
      }
    }

    const requiresImage = !cardToValidate.templateEnabled;

    if (requiresImage) {
      if (!cardToValidate.imageUrl || cardToValidate.imageUrl.trim().length === 0) {
        newErrors.imageUrl = '画像は必須です';
      }
    }

    // Actions validation (required, max 3)
    if (!cardToValidate.actions || cardToValidate.actions.length === 0) {
      newErrors.actions = 'アクションを1つ以上追加してください';
    } else if (cardToValidate.actions.length > 3) {
      newErrors.actions = 'アクションは最大3つまでです';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles name field change
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value });
  };

  /**
   * Handles description field change
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ description: e.target.value });
  };

  /**
   * Handles tag input change
   */
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  /**
   * Handles tag input key press (Enter to add tag)
   */
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  /**
   * Adds a new tag from input
   */
  const addTag = () => {
    const trimmedTag = tagInput.trim();

    // Validate tag
    if (!trimmedTag) {
      return;
    }

    if (trimmedTag.length > 20) {
      setErrors({ ...errors, tagInput: 'タグは20文字以内で入力してください' });
      return;
    }

    // Check for duplicates
    const existingTags = card.tags || [];
    if (existingTags.includes(trimmedTag)) {
      setErrors({ ...errors, tagInput: 'このタグは既に追加されています' });
      return;
    }

    // Add tag
    onChange({ tags: [...existingTags, trimmedTag] });
    setTagInput('');
    setErrors({ ...errors, tagInput: undefined });

    // Focus back on input
    tagInputRef.current?.focus();
  };

  /**
   * Removes a tag by index
   */
  const removeTag = (index: number) => {
    const existingTags = card.tags || [];
    const updatedTags = existingTags.filter((_, i) => i !== index);
    onChange({ tags: updatedTags });
  };

  /**
   * Handles image upload
   */
  const handleImageUploaded = (url: string) => {
    onChange({ imageUrl: url });
  };

  /**
   * Handles actions change
   */
  const handleActionsChange = (actions: PersonCard['actions']) => {
    onChange({ actions });
  };

  const handleTemplateAreasChange = useCallback((areas: TemplateArea[]) => {
    onChange({ templateAreas: areas });
  }, [onChange]);

  const handleTemplatePreviewChange = useCallback((previewUrl: string | null) => {
    onChange({ templatePreviewUrl: previewUrl ?? null });
  }, [onChange]);

  const handleTemplateImageUrlChange = useCallback((imageUrl: string | null) => {
    if (card.templateEnabled) {
      onChange({ templateImageUrl: imageUrl ?? null });
    }
  }, [card.templateEnabled, onChange]);

  const handleTemplateChange = useCallback((templateId: string | null) => {
    onChange({ templateEnabled: true, templateId, ...(templateId ? { imageUrl: '', templateImageUrl: null } : {}) });
    if (templateId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    }
  }, [onChange, setErrors]);

  const handleTemplateModeToggle = (mode: 'image' | 'template') => {
    if (mode === 'template') {
      onChange({ templateEnabled: true, imageUrl: '', templatePreviewUrl: null, templateImageUrl: null });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } else {
      onChange({ templateEnabled: false, templateId: undefined, templateAreas: undefined, templatePreviewUrl: undefined, templateImageUrl: undefined });
    }
  };

  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          名前 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={card.name}
          onChange={handleNameChange}
          maxLength={40}
          className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
          placeholder="例: 山田 太郎"
        />
        {errors.name && (
          <p className="text-xs font-bold text-red-600">{errors.name}</p>
        )}
        <p className="text-xs font-mono text-black/60">{card.name.length}/40文字</p>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          説明 <span className="text-red-600">*</span>
        </label>
        <textarea
          value={card.description}
          onChange={handleDescriptionChange}
          maxLength={60}
          rows={3}
          className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
          placeholder="例: プロジェクトマネージャー / 東京オフィス"
        />
        {errors.description && (
          <p className="text-xs font-bold text-red-600">{errors.description}</p>
        )}
        <p className="text-xs font-mono text-black/60">{card.description.length}/60文字</p>
      </div>

      {/* Tags Field */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          タグ <span className="font-mono text-black/60">(オプション)</span>
        </label>

        {/* Tag chips display */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {card.tags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 border-2 border-black bg-[#00B900]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="border-2 border-black bg-white p-0.5 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label={`タグ "${tag}" を削除`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tag input */}
        <div className="flex gap-2">
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            maxLength={20}
            className="flex-1 border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="タグを入力してEnterキーで追加"
          />
          <button
            type="button"
            onClick={addTag}
            className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            追加
          </button>
        </div>

        {errors.tagInput && (
          <p className="text-xs font-bold text-red-600">{errors.tagInput}</p>
        )}

        {errors.tags && (
          <p className="text-xs font-bold text-red-600">{errors.tags}</p>
        )}

        {tagInput && (
          <p className="text-xs font-mono text-black/60">{tagInput.length}/20文字</p>
        )}

        <p className="text-xs font-mono text-black/60">
          Enterキーまたは「追加」ボタンでタグを追加できます。各タグは最大20文字です。
        </p>
      </div>

      {/* 画像モード */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-black">画像モード</label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={!isTemplateMode ? 'secondary' : 'outline'}
            className="border-2 border-black"
            onClick={() => handleTemplateModeToggle('image')}
          >
            単一画像
          </Button>
          <Button
            type="button"
            variant={isTemplateMode ? 'secondary' : 'outline'}
            className="border-2 border-black"
            onClick={() => handleTemplateModeToggle('template')}
          >
            テンプレート
          </Button>
        </div>
      </div>

      {!isTemplateMode && (
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-black">
            画像 <span className="text-red-600">*</span>
          </label>
          <ImageCropUploader
            onImageUploaded={handleImageUploaded}
            defaultAspectRatio="SQUARE"
            placeholder="プロフィール画像をアップロード"
          />
          <p className="text-xs text-black/60">テンプレートを選択すると単一画像は不要になります。</p>
          {errors.imageUrl && (
            <p className="text-xs font-bold text-red-600">{errors.imageUrl}</p>
          )}
          {card.imageUrl && (
            <div className="border-2 border-black bg-[#FFFEF5] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold uppercase tracking-wider text-black mb-2">現在の画像:</p>
              <Image
                src={card.imageUrl}
                alt="プレビュー"
                width={128}
                height={128}
                className="h-32 w-32 border-2 border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

      {/* Actions Field */}
      <div className="space-y-2">
        <ActionEditor
          actions={card.actions}
          onChange={handleActionsChange}
          maxActions={3}
        />
        {errors.actions && (
          <p className="text-xs font-bold text-red-600">{errors.actions}</p>
        )}
      </div>
    </div>
  );
}
