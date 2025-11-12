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
    if (!canvas || !richMenuSize) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = richMenuSize.width * scale;
    canvas.height = richMenuSize.height * scale;

    // Draw image or placeholder
    if (image) {
      drawImage(ctx, image, canvas.width, canvas.height);
    } else {
      // Draw placeholder background
      ctx.fillStyle = "#1e293b"; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      ctx.strokeStyle = "#334155"; // slate-700
      ctx.lineWidth = 1;
      const gridSize = 50 * scale;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw center text
      ctx.fillStyle = "#64748b"; // slate-500
      ctx.font = `${16 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "画像をアップロードしてください",
        canvas.width / 2,
        canvas.height / 2
      );
    }

    // Draw existing areas
    areas.forEach((area, index) => {
      const isSelected = index === selectedAreaIndex;
      drawArea(ctx, area, scale, index, isSelected);
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
