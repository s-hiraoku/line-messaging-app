"use client";

import { useState, useRef, useEffect } from "react";
import { ImagemapCanvas } from "./imagemap-canvas";
import { ImagemapAreaList } from "./imagemap-area-list";
import { useImagemapScale } from "./hooks/use-imagemap-scale";
import { useImagemapAreaSelection } from "./hooks/use-imagemap-area-selection";

/**
 * Imagemap area interface
 * Coordinates are in 1040x1040 base (LINE API standard)
 */
export interface ImagemapArea {
  x: number;
  y: number;
  width: number;
  height: number;
  action: {
    type: "uri" | "message";
    linkUri?: string;
    text?: string;
  };
}

/**
 * Fixed size for imagemap messages (LINE API requirement)
 */
const IMAGEMAP_SIZE = { width: 1040, height: 1040 };

interface RichMessageEditorProps {
  imageUrl: string;
  areas: ImagemapArea[];
  onAreasChange: (areas: ImagemapArea[]) => void;
}

export function RichMessageEditor({
  imageUrl,
  areas,
  onAreasChange,
}: RichMessageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const scale = useImagemapScale(containerRef);

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
  } = useImagemapAreaSelection({
    canvasRef,
    areas,
    onAreasChange,
    scale,
    imageSize: IMAGEMAP_SIZE,
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
            : "画像をアップロードしてください"}
        </div>
      </div>

      <ImagemapCanvas
        containerRef={containerRef}
        canvasRef={canvasRef}
        image={image}
        imageSize={IMAGEMAP_SIZE}
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

      <ImagemapAreaList
        areas={areas}
        selectedAreaIndex={selectedAreaIndex}
        onSelectArea={setSelectedAreaIndex}
        onDeleteArea={handleDeleteArea}
        onUpdateArea={handleUpdateArea}
      />
    </div>
  );
}
