'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageAreaCanvas } from './image-area-canvas';
import { ImageAreaList } from './image-area-list';
import { ImageAreaForm } from './image-area-form';
import { useImageAreaEditor } from './hooks/use-image-area-editor';
import { useImageAreaKeyboard } from './hooks/use-image-area-keyboard';
import { checkAreaOverlaps, MAX_IMAGE_AREAS } from './utils/image-area-validation';

interface ImageAreaEditorProps {
  imageUrl: string | null;
  onAreasChange?: (areas: ReturnType<typeof useImageAreaEditor>['areas']) => void;
}

export function ImageAreaEditor({ imageUrl, onAreasChange }: ImageAreaEditorProps) {
  const editor = useImageAreaEditor();
  const [imageSize, setImageSize] = useState({ width: 1024, height: 1024 });
  const [warnings, setWarnings] = useState<string[]>([]);

  // Load image to get dimensions
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Check for area overlaps
  useEffect(() => {
    if (editor.areas.length > 0) {
      const overlaps = checkAreaOverlaps(editor.areas);
      setWarnings(overlaps);
    } else {
      setWarnings([]);
    }
  }, [editor.areas]);

  // Enable keyboard controls when editor is active
  useImageAreaKeyboard({
    enabled: editor.enabled,
    areas: editor.areas,
    selectedAreaId: editor.selectedAreaId,
    imageSize,
    onSelectArea: editor.setSelectedAreaId,
    onUpdateArea: editor.updateArea,
    onDeleteArea: editor.deleteArea,
  });

  // Notify parent of changes
  useEffect(() => {
    if (onAreasChange) {
      onAreasChange(editor.areas);
    }
  }, [editor.areas, onAreasChange]);

  const handleToggleEnabled = () => {
    if (editor.enabled && editor.areas.length > 0) {
      // Show confirmation when disabling with existing areas
      if (
        !window.confirm(
          '画像エリア機能を無効にすると、設定した領域がすべて削除されます。よろしいですか?'
        )
      ) {
        return;
      }
      editor.clearAreas();
    }
    editor.toggleEnabled();
  };

  const handleAddArea = () => {
    if (!editor.canAddMore) return;

    // Add area in center of image
    const centerX = Math.round(imageSize.width / 2 - 100);
    const centerY = Math.round(imageSize.height / 2 - 100);

    editor.addArea({
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      width: 200,
      height: 200,
      label: `領域 ${editor.areas.length + 1}`,
      action: {
        type: 'uri',
        label: 'リンク',
        uri: 'https://example.com',
      },
    });
  };

  if (!imageUrl) {
    return (
      <Alert className="border-2 border-black bg-[#FFFEF5] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm font-mono text-black/60">
          画像をアップロードすると、画像エリア機能を使用できます
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1">
          <Label className="text-sm font-bold uppercase tracking-wider text-black">
            画像エリア機能
          </Label>
          <p className="text-xs font-mono text-black/60">
            画像内に複数のタップ可能な領域を設定
          </p>
        </div>
        <Switch checked={editor.enabled} onCheckedChange={handleToggleEnabled} />
      </div>

      {/* Editor UI */}
      {editor.enabled && (
        <>
          {/* Add Area Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold uppercase tracking-wider text-black">
                画像エリア編集
              </Label>
              <Badge variant="outline" className="border-2 border-black text-xs">
                {editor.areas.length}/{MAX_IMAGE_AREAS}
              </Badge>
            </div>
            <Button
              type="button"
              onClick={handleAddArea}
              disabled={!editor.canAddMore}
              size="sm"
              className="inline-flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-3.5 w-3.5" />
              エリアを追加
            </Button>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="border-2 border-black bg-[#FFE500] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wider text-black">
                  警告
                </p>
                <ul className="text-xs font-mono text-black space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Desktop: 3 Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <ImageAreaCanvas
                imageUrl={imageUrl}
                areas={editor.areas}
                selectedAreaId={editor.selectedAreaId}
                onSelectArea={editor.setSelectedAreaId}
                onUpdateArea={editor.updateArea}
                onAddArea={editor.addArea}
              />
            </div>

            {/* Right Column: List + Form */}
            <div className="space-y-4">
              {/* List */}
              <ImageAreaList
                areas={editor.areas}
                selectedAreaId={editor.selectedAreaId}
                onSelectArea={editor.setSelectedAreaId}
                onMoveUp={editor.moveAreaUp}
                onMoveDown={editor.moveAreaDown}
                onDelete={editor.deleteArea}
              />

              <Separator className="bg-black h-[2px]" />

              {/* Form */}
              <ImageAreaForm
                area={editor.selectedArea}
                imageWidth={imageSize.width}
                imageHeight={imageSize.height}
                onUpdate={editor.updateArea}
              />
            </div>
          </div>

          {/* Mobile/Tablet: Vertical Layout */}
          <div className="space-y-4 lg:hidden">
            {/* Canvas */}
            <ImageAreaCanvas
              imageUrl={imageUrl}
              areas={editor.areas}
              selectedAreaId={editor.selectedAreaId}
              onSelectArea={editor.setSelectedAreaId}
              onUpdateArea={editor.updateArea}
              onAddArea={editor.addArea}
            />

            <Separator className="bg-black h-[2px]" />

            {/* List */}
            <ImageAreaList
              areas={editor.areas}
              selectedAreaId={editor.selectedAreaId}
              onSelectArea={editor.setSelectedAreaId}
              onMoveUp={editor.moveAreaUp}
              onMoveDown={editor.moveAreaDown}
              onDelete={editor.deleteArea}
            />

            <Separator className="bg-black h-[2px]" />

            {/* Form */}
            <ImageAreaForm
              area={editor.selectedArea}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              onUpdate={editor.updateArea}
            />
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-bold uppercase tracking-wider text-black mb-2">
              キーボードショートカット
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-black/60">
              <div>• Tab: 領域間を移動</div>
              <div>• 矢印キー: 1px移動</div>
              <div>• Shift + 矢印: 10px移動</div>
              <div>• Delete: 領域削除</div>
              <div>• Esc: 選択解除</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
