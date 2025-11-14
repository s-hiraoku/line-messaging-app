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

export function VisualEditor({
  imageUrl,
  size,
  areas,
  onAreasChange,
}: VisualEditorProps) {
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
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageUrl);
      setImage(null);
    };
    img.src = imageUrl;

    return () => {
      setImage(null);
    };
  }, [imageUrl]);

  // Handle Escape key to delete selected area
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAreaIndex !== null) {
        handleDeleteArea(selectedAreaIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAreaIndex, handleDeleteArea]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          タップ領域 <span className="text-red-600">*</span>
        </label>
        <div className="text-xs font-mono text-black/60">
          {imageUrl
            ? "画像上をドラッグして領域を作成、クリックして選択"
            : "キャンバス上をドラッグして領域を作成できます"}
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
