'use client';

import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActionEditor } from './action-editor';
import type { ImageArea, CardAction } from './types';
import { validateImageArea, MAX_LABEL_LENGTH } from './utils/image-area-validation';

interface ImageAreaFormProps {
  area: ImageArea | null;
  imageWidth: number;
  imageHeight: number;
  onUpdate: (id: string, updates: Partial<ImageArea>) => void;
}

export function ImageAreaForm({
  area,
  imageWidth,
  imageHeight,
  onUpdate,
}: ImageAreaFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate on area change
  useEffect(() => {
    if (!area) return;

    const validationErrors = validateImageArea(area, imageWidth, imageHeight);
    const errorMap: Record<string, string> = {};
    validationErrors.forEach((err) => {
      errorMap[err.field] = err.message;
    });
    setErrors(errorMap);
  }, [area, imageWidth, imageHeight]);

  if (!area) {
    return (
      <div className="border-2 border-black bg-[#FFFEF5] p-6 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm font-mono text-black/60">
          編集する領域を選択してください
        </p>
      </div>
    );
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(area.id, { label: e.target.value });
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onUpdate(area.id, { x: value });
    }
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onUpdate(area.id, { y: value });
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onUpdate(area.id, { width: value });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onUpdate(area.id, { height: value });
    }
  };

  const handleActionChange = (actions: CardAction[]) => {
    if (actions.length > 0) {
      onUpdate(area.id, { action: actions[0] });
    }
  };

  // Memoize actions array to prevent infinite re-render loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actionsArray = useMemo(() => {
    return area ? [area.action] : [];
  }, [area ? JSON.stringify(area.action) : null]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold uppercase tracking-wider text-black">
          領域編集
        </Label>
      </div>

      {/* Label Field */}
      <div className="space-y-2">
        <Label htmlFor="area-label" className="text-xs font-bold uppercase tracking-wider text-black">
          ラベル <span className="text-red-600">*</span>
        </Label>
        <Input
          id="area-label"
          type="text"
          value={area.label}
          onChange={handleLabelChange}
          maxLength={MAX_LABEL_LENGTH}
          className={`bg-white border-2 ${
            errors.label ? 'border-red-600' : 'border-black'
          } font-mono text-black placeholder-black/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all`}
          placeholder="領域のラベル (最大20文字)"
        />
        <div className="flex items-center justify-between">
          {errors.label ? (
            <p className="text-xs font-bold text-red-600">{errors.label}</p>
          ) : (
            <p className="text-xs font-mono text-black/60">領域のラベルを入力</p>
          )}
          <Badge
            variant={area.label.length >= 18 ? 'outline' : 'secondary'}
            className="text-xs border-2 border-black"
          >
            {area.label.length}/{MAX_LABEL_LENGTH}
          </Badge>
        </div>
      </div>

      <Separator className="bg-black h-[2px]" />

      {/* Position & Size Fields */}
      <div className="space-y-4">
        <Label className="text-xs font-bold uppercase tracking-wider text-black">
          位置とサイズ
        </Label>

        <div className="grid grid-cols-2 gap-3">
          {/* X */}
          <div className="space-y-2">
            <Label htmlFor="area-x" className="text-xs font-mono text-black/60">
              X座標 (px)
            </Label>
            <Input
              id="area-x"
              type="number"
              value={area.x}
              onChange={handleXChange}
              min={0}
              max={imageWidth}
              className={`bg-white border-2 ${
                errors.x ? 'border-red-600' : 'border-black'
              } font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            />
            {errors.x && <p className="text-xs font-bold text-red-600">{errors.x}</p>}
          </div>

          {/* Y */}
          <div className="space-y-2">
            <Label htmlFor="area-y" className="text-xs font-mono text-black/60">
              Y座標 (px)
            </Label>
            <Input
              id="area-y"
              type="number"
              value={area.y}
              onChange={handleYChange}
              min={0}
              max={imageHeight}
              className={`bg-white border-2 ${
                errors.y ? 'border-red-600' : 'border-black'
              } font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            />
            {errors.y && <p className="text-xs font-bold text-red-600">{errors.y}</p>}
          </div>

          {/* Width */}
          <div className="space-y-2">
            <Label htmlFor="area-width" className="text-xs font-mono text-black/60">
              幅 (px)
            </Label>
            <Input
              id="area-width"
              type="number"
              value={area.width}
              onChange={handleWidthChange}
              min={50}
              max={imageWidth}
              className={`bg-white border-2 ${
                errors.width ? 'border-red-600' : 'border-black'
              } font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            />
            {errors.width && <p className="text-xs font-bold text-red-600">{errors.width}</p>}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="area-height" className="text-xs font-mono text-black/60">
              高さ (px)
            </Label>
            <Input
              id="area-height"
              type="number"
              value={area.height}
              onChange={handleHeightChange}
              min={50}
              max={imageHeight}
              className={`bg-white border-2 ${
                errors.height ? 'border-red-600' : 'border-black'
              } font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            />
            {errors.height && <p className="text-xs font-bold text-red-600">{errors.height}</p>}
          </div>
        </div>
      </div>

      <Separator className="bg-black h-[2px]" />

      {/* Action Editor */}
      <div className="space-y-2">
        <ActionEditor
          actions={actionsArray}
          onChange={handleActionChange}
          maxActions={1}
        />
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="border-2 border-black bg-[#FFE500] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-bold uppercase tracking-wider text-black">
                入力内容に問題があります ({Object.keys(errors).length}件)
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
