import { useEffect, RefObject } from "react";
import type { TapArea, RichMenuSize, Point } from "@/types/richmenu";
import { drawImage, drawArea, drawAreaLabel, drawDrawingPreview } from "@/utils/canvasDrawing";

interface UseCanvasDrawingProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  richMenuSize: RichMenuSize;
  scale: number;
  areas: TapArea[];
  selectedAreaIndex: number | null;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
}

export function useCanvasDrawing({
  canvasRef,
  image,
  richMenuSize,
  scale,
  areas,
  selectedAreaIndex,
  isDrawing,
  drawStart,
  currentDraw,
}: UseCanvasDrawingProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = richMenuSize.width * scale;
    canvas.height = richMenuSize.height * scale;

    // Draw image
    drawImage(ctx, image, canvas.width, canvas.height);

    // Draw existing areas
    areas.forEach((area, index) => {
      const isSelected = index === selectedAreaIndex;
      drawArea(ctx, area, scale, index, isSelected);
      drawAreaLabel(ctx, area, index, scale);
    });

    // Draw current drawing area
    if (isDrawing && drawStart && currentDraw) {
      drawDrawingPreview(ctx, drawStart, currentDraw);
    }
  }, [
    canvasRef,
    image,
    areas,
    selectedAreaIndex,
    isDrawing,
    drawStart,
    currentDraw,
    scale,
    richMenuSize,
  ]);
}
