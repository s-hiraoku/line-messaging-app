"use client";

import { RefObject, useState, useCallback } from "react";
import type { ImagemapArea } from "./editor";
import { useImagemapCanvasDrawing } from "./hooks/use-imagemap-canvas-drawing";
import {
  getCanvasCoordinates,
  isPointInImagemapArea,
  getResizeHandle,
  getCursorStyle,
} from "./utils/imagemap-canvas-utils";

interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface ImagemapCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  imageSize: ImageSize;
  scale: number;
  areas: ImagemapArea[];
  selectedAreaIndex: number | null;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
}

export function ImagemapCanvas({
  containerRef,
  canvasRef,
  image,
  imageSize,
  scale,
  areas,
  selectedAreaIndex,
  isDrawing,
  drawStart,
  currentDraw,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: ImagemapCanvasProps) {
  const [cursor, setCursor] = useState("crosshair");

  useImagemapCanvasDrawing({
    canvasRef,
    image,
    imageSize,
    scale,
    areas,
    selectedAreaIndex,
    isDrawing,
    drawStart,
    currentDraw,
  });

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || isDrawing) return;

      const coords = getCanvasCoordinates(e, canvas);

      // Check if hovering over selected area
      if (selectedAreaIndex !== null && selectedAreaIndex < areas.length) {
        const area = areas[selectedAreaIndex];
        const handle = getResizeHandle(coords, area, scale);
        const isOver = isPointInImagemapArea(coords, area, scale);
        setCursor(getCursorStyle(handle, isOver));
        return;
      }

      // Check if hovering over any area
      const hoveredIndex = areas.findIndex((area) =>
        isPointInImagemapArea(coords, area, scale)
      );
      setCursor(hoveredIndex !== -1 ? "pointer" : "crosshair");
    },
    [canvasRef, isDrawing, selectedAreaIndex, areas, scale]
  );

  const handleMouseMoveWithCursor = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleHover(e);
      onMouseMove(e);
    },
    [handleHover, onMouseMove]
  );

  return (
    <div
      ref={containerRef}
      className="rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={handleMouseMoveWithCursor}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ cursor }}
        className="w-full rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]"
      />
    </div>
  );
}
