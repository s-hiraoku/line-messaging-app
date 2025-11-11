"use client";

import { useState, useRef, useEffect } from "react";
import type { TapArea, RichMenuSizeType } from "@/types/richmenu";
import { RICHMENU_SIZES } from "@/constants/richmenu";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useAreaSelection } from "@/hooks/useAreaSelection";
import { RichMenuCanvas } from "./RichMenuCanvas";
import { AreaList } from "./AreaList";

interface VisualEditorProps {
  imageUrl: string;
  size: RichMenuSizeType;
  areas: TapArea[];
  onAreasChange: (areas: TapArea[]) => void;
}

export function VisualEditor({ imageUrl, size, areas, onAreasChange }: VisualEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const richMenuSize = RICHMENU_SIZES[size];
  const scale = useCanvasScale(containerRef, richMenuSize);

  const {
    selectedAreaIndex,
    setSelectedAreaIndex,
    isDrawing,
    drawStart,
    currentDraw,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDeleteArea,
    handleUpdateArea,
  } = useAreaSelection({
    canvasRef,
    areas,
    onAreasChange,
    scale,
  });

  // Load image
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400">画像をアップロードしてタップ領域を設定してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          タップ領域 <span className="text-red-400">*</span>
        </label>
        <div className="text-xs text-slate-500">
          画像上をドラッグして領域を作成、クリックして選択
        </div>
      </div>

      <RichMenuCanvas
        containerRef={containerRef}
        canvasRef={canvasRef}
        image={image}
        richMenuSize={richMenuSize}
        scale={scale}
        areas={areas}
        selectedAreaIndex={selectedAreaIndex}
        isDrawing={isDrawing}
        drawStart={drawStart}
        currentDraw={currentDraw}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      <AreaList
        areas={areas}
        selectedAreaIndex={selectedAreaIndex}
        onSelectArea={setSelectedAreaIndex}
        onDeleteArea={handleDeleteArea}
        onUpdateArea={handleUpdateArea}
      />
    </div>
  );
}
