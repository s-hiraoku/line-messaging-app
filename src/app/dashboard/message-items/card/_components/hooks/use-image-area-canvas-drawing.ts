import { useEffect, RefObject } from 'react';
import type { ImageArea } from '../types';
import {
  drawImage,
  drawImageArea,
  drawDrawingPreview,
  drawGrid,
} from '../utils/image-area-drawing-utils';

interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface UseImageAreaCanvasDrawingProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  imageSize: ImageSize;
  scale: number;
  areas: ImageArea[];
  selectedAreaId: string | null;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  showGrid: boolean;
  gridSize: number;
}

export function useImageAreaCanvasDrawing({
  canvasRef,
  image,
  imageSize,
  scale,
  areas,
  selectedAreaId,
  isDrawing,
  drawStart,
  currentDraw,
  showGrid,
  gridSize,
}: UseImageAreaCanvasDrawingProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSize) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = imageSize.width * scale;
    canvas.height = imageSize.height * scale;

    // Draw image or placeholder
    if (image) {
      drawImage(ctx, image, canvas.width, canvas.height);
    } else {
      // Draw placeholder background
      ctx.fillStyle = '#f3f4f6'; // gray-100
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center text
      ctx.fillStyle = '#9ca3af'; // gray-400
      ctx.font = `${16 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '画像をアップロードしてください',
        canvas.width / 2,
        canvas.height / 2
      );
    }

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize * scale);
    }

    // Draw existing areas
    areas.forEach((area, index) => {
      const isSelected = area.id === selectedAreaId;
      drawImageArea(ctx, area, scale, index, isSelected);
    });

    // Draw current drawing area
    if (isDrawing && drawStart && currentDraw) {
      drawDrawingPreview(ctx, drawStart, currentDraw);
    }
  }, [
    canvasRef,
    image,
    areas,
    selectedAreaId,
    isDrawing,
    drawStart,
    currentDraw,
    scale,
    imageSize,
    showGrid,
    gridSize,
  ]);
}
