"use client";

import { RefObject } from "react";
import type { TapArea, RichMenuSize, Point } from "@/types/richmenu";
import { useCanvasDrawing } from "@/hooks/useCanvasDrawing";

interface RichMenuCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  richMenuSize: RichMenuSize;
  scale: number;
  areas: TapArea[];
  selectedAreaIndex: number | null;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
}

export function RichMenuCanvas({
  containerRef,
  canvasRef,
  image,
  richMenuSize,
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
}: RichMenuCanvasProps) {
  useCanvasDrawing({
    canvasRef,
    image,
    richMenuSize,
    scale,
    areas,
    selectedAreaIndex,
    isDrawing,
    drawStart,
    currentDraw,
  });

  return (
    <div ref={containerRef} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className="w-full cursor-crosshair rounded border border-slate-600"
      />
    </div>
  );
}
