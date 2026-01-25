'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import {
  clearTemplateStateAtom,
  createSelectedTemplateForCardAtom,
  createTemplateAreasForCardAtom,
} from '@/state/message/template-image-areas-atom';
import type { TemplateArea, TemplateVariant } from '@/lib/template-image-splitter/types';
import { TemplateSelector } from './template-selector';
import { TemplateAreaUploader } from './template-area-uploader';
import { TemplatePreview } from './template-preview';
import { TEMPLATE_CATALOG, getTemplateVariantById } from './utils/template-definitions';
import { composeTemplatePreviewDataUrl } from './utils/template-preview-utils';

interface TemplateImageEditorProps {
  cardId: string;
  onAreasChange: (areas: TemplateArea[]) => void;
  onTemplateChange?: (templateId: string | null) => void;
  onPreviewChange?: (previewUrl: string | null) => void;
  onComposedImageChange?: (imageUrl: string | null) => void;
  initialTemplateId?: string | null;
  initialAreas?: TemplateArea[];
}

type EditorPhase = 'select' | 'upload' | 'preview';

function buildAreasFromTemplate(template?: TemplateVariant): TemplateArea[] {
  if (!template) return [];
  return template.areas.map((area) => ({
    id: area.id,
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    imageUrl: undefined,
  }));
}

async function uploadPreviewToCloudinary(cardId: string, dataUrl: string): Promise<string> {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: mime });
  const formData = new FormData();
  formData.set('file', blob, `template-${cardId}-${Date.now()}.png`);

  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data?.secure_url) {
    throw new Error(data?.error || 'テンプレート画像のアップロードに失敗しました');
  }

  return data.secure_url as string;
}

export function TemplateImageEditor({
  cardId,
  onAreasChange,
  onTemplateChange,
  onPreviewChange,
  onComposedImageChange,
  initialAreas,
  initialTemplateId,
}: TemplateImageEditorProps) {
  const selectedTemplateAtom = useMemo(() => createSelectedTemplateForCardAtom(cardId), [cardId]);
  const templateAreasAtom = useMemo(() => createTemplateAreasForCardAtom(cardId), [cardId]);
  const [selectedTemplateId, setSelectedTemplateId] = useAtom(selectedTemplateAtom);
  const [areas, setAreas] = useAtom(templateAreasAtom);
  const [, clearTemplateState] = useAtom(clearTemplateStateAtom);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploadingComposed, setIsUploadingComposed] = useState(false);

  const [hydratedCardId, setHydratedCardId] = useState<string | null>(null);

  // Hydrate from initial props when opening a card (or when server data arrives)
  useEffect(() => {
    const initialAreasLength = initialAreas?.length ?? 0;
    const shouldHydrate =
      hydratedCardId !== cardId ||
      (!selectedTemplateId && initialTemplateId) ||
      (areas.length === 0 && initialAreasLength > 0);

    if (!shouldHydrate) {
      return;
    }

    setSelectedTemplateId(initialTemplateId ?? null);
    setAreas(initialAreasLength ? initialAreas! : []);
    setActiveAreaId(null);
    setHydratedCardId(cardId);
  }, [
    cardId,
    hydratedCardId,
    initialAreas,
    initialTemplateId,
    areas.length,
    selectedTemplateId,
    setAreas,
    setSelectedTemplateId,
  ]);

  const selectedTemplate = useMemo(
    () => getTemplateVariantById(selectedTemplateId ?? undefined),
    [selectedTemplateId]
  );

  // When template is selected but no area data exists, seed defaults
  useEffect(() => {
    if (selectedTemplate && areas.length === 0) {
      setAreas(buildAreasFromTemplate(selectedTemplate));
    }
  }, [areas.length, selectedTemplate, setAreas]);

  const completedCount = useMemo(() => areas.filter((area) => !!area.imageUrl).length, [areas]);
  const totalCount = selectedTemplate?.areaCount ?? 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const phase: EditorPhase = !selectedTemplate ? 'select' : isComplete ? 'preview' : 'upload';
  const allAreasConfigured = useMemo(() => {
    if (!selectedTemplate) return false;
    return selectedTemplate.areas.every((definition) =>
      areas.some((area) => area.id === definition.id && !!area.imageUrl)
    );
  }, [areas, selectedTemplate]);

  useEffect(() => {
    onTemplateChange?.(selectedTemplateId ?? null);
  }, [onTemplateChange, selectedTemplateId]);

  useEffect(() => {
    onAreasChange(areas);
  }, [areas, onAreasChange]);

  useEffect(() => {
    if (!selectedTemplate) {
      setActiveAreaId(null);
      return;
    }

    if (!activeAreaId || !selectedTemplate.areas.some((area) => area.id === activeAreaId)) {
      setActiveAreaId(selectedTemplate.areas[0]?.id ?? null);
    }
  }, [activeAreaId, selectedTemplate]);

  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      const template = getTemplateVariantById(templateId);
      if (!template) return;

      const hasExistingImages = areas.some((area) => !!area.imageUrl);
      if (hasExistingImages && typeof window !== 'undefined') {
        const confirmed = window.confirm('テンプレートを変更すると現在の画像設定はリセットされます。続行しますか？');
        if (!confirmed) {
          return;
        }
      }

      setSelectedTemplateId(templateId);
      setAreas(buildAreasFromTemplate(template));
      setActiveAreaId(template.areas[0]?.id ?? null);
      setPreviewUrl(null);
    },
    [areas, setAreas, setSelectedTemplateId]
  );

  const handleAreaImageUpload = useCallback(
    (areaId: string, imageUrl: string) => {
      if (!selectedTemplate) return;
      const nextAreas = areas.map((area) => (area.id === areaId ? { ...area, imageUrl } : area));
      setAreas(nextAreas);

      const currentIndex = selectedTemplate.areas.findIndex((definition) => definition.id === areaId);
      const nextDefinition = selectedTemplate.areas[currentIndex + 1];
      if (nextDefinition) {
        setActiveAreaId(nextDefinition.id);
      }
    },
    [areas, selectedTemplate, setAreas]
  );

  const handleImageRemove = useCallback(
    (areaId: string) => {
      const nextAreas = areas.map((area) => (area.id === areaId ? { ...area, imageUrl: undefined } : area));
      setAreas(nextAreas);
      setActiveAreaId(areaId);
    },
    [areas, setAreas]
  );

  const handleTemplateReset = useCallback(() => {
    clearTemplateState(cardId);
    setSelectedTemplateId(null);
    setAreas([]);
    setActiveAreaId(null);
    setPreviewUrl(null);
  }, [cardId, clearTemplateState, setAreas, setSelectedTemplateId]);

  const handleTemplateChangeRequest = useCallback(() => {
    const hasExistingImages = areas.some((area) => !!area.imageUrl);
    if (hasExistingImages && typeof window !== 'undefined') {
      const confirmed = window.confirm('現在のテンプレート設定を破棄して別のテンプレートを選択しますか？');
      if (!confirmed) {
        return;
      }
    }
    clearTemplateState(cardId);
    setSelectedTemplateId(null);
    setAreas([]);
    setActiveAreaId(null);
    setPreviewUrl(null);
  }, [areas, cardId, clearTemplateState, setAreas, setSelectedTemplateId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedTemplate || !allAreasConfigured) {
      setPreviewUrl(null);
      setIsPreviewing(false);
      return () => {
        cancelled = true;
      };
    }

    setIsPreviewing(true);
    composeTemplatePreviewDataUrl(selectedTemplate, areas)
      .then((url) => {
        if (!cancelled) {
          setPreviewUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreviewing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTemplate, areas, allAreasConfigured]);

  useEffect(() => {
    onPreviewChange?.(previewUrl);
  }, [previewUrl, onPreviewChange]);

  useEffect(() => {
    let cancelled = false;
    if (!previewUrl || !selectedTemplate) {
      onComposedImageChange?.(null);
      setIsUploadingComposed(false);
      return () => {
        cancelled = true;
      };
    }

    setIsUploadingComposed(true);
    uploadPreviewToCloudinary(cardId, previewUrl)
      .then((url) => {
        if (!cancelled) {
          onComposedImageChange?.(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          onComposedImageChange?.(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsUploadingComposed(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardId, previewUrl, selectedTemplate, onComposedImageChange]);

  const activeTemplate = selectedTemplate;
  const progressLabel = selectedTemplate ? `${completedCount}/${totalCount} エリア完了` : 'テンプレート未選択';

  return (
    <div className="space-y-6 rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-gray-800">テンプレート画像エディタ</p>
          <p className="text-xs text-gray-600">1〜3分割のプリセットから選択して各エリアに画像を設定します</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            ステップ: {phase === 'select' ? 'テンプレート選択' : phase === 'upload' ? '画像設定' : 'プレビュー'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {progressLabel}
          </Badge>
          <Button type="button" variant="ghost" className="rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5" onClick={handleTemplateReset}>
            リセット
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-300" />

      {phase === 'select' && (
        <TemplateSelector
          catalog={TEMPLATE_CATALOG}
          selectedTemplateId={selectedTemplateId ?? null}
          onSelect={handleTemplateSelect}
        />
      )}

      {phase !== 'select' && activeTemplate && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{activeTemplate.name}</p>
              <p className="text-xs text-gray-600">{activeTemplate.description}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
              onClick={handleTemplateChangeRequest}
            >
              別のテンプレートに変更
            </Button>
          </div>

          {phase === 'upload' && activeAreaId && (
            <TemplateAreaUploader
              template={activeTemplate}
              areas={areas}
              activeAreaId={activeAreaId}
              onActiveAreaChange={setActiveAreaId}
              onImageUploaded={handleAreaImageUpload}
              onImageRemoved={handleImageRemove}
            />
          )}

          {phase === 'upload' && !isComplete && (
            <Alert className="rounded-xl bg-[#e8f5e9] text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
              <AlertDescription className="text-sm">
                すべてのエリアに画像を設定すると完成プレビューが生成されます。
              </AlertDescription>
            </Alert>
          )}

          {phase === 'preview' && (
            <div className="space-y-4">
              <TemplatePreview
                template={activeTemplate}
                areas={areas}
                previewUrl={previewUrl}
                isComposing={isPreviewing || isUploadingComposed}
              />
              <Alert className="rounded-xl bg-[#e8f5e9] text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
                <AlertDescription className="text-sm">
                  プレビューを確認し、問題がなければそのまま送信できます。変更したい場合は任意のエリア画像を差し替えてください。
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}

      {phase === 'select' && (
        <Alert className="rounded-xl bg-[#e8f5e9] text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
          <AlertDescription className="text-sm">
            まずはテンプレートを選択してください。1〜3分割のプリセットが用意されています。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
