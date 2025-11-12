"use client";

import { RefObject, useState, useCallback } from "react";
import type { TapArea, RichMenuSize, Point } from "@/types/richmenu";
import { useCanvasDrawing } from "@/hooks/useCanvasDrawing";
import { getCanvasCoordinates, isPointInArea } from "@/utils/canvasCoordinates";

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

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

const HANDLE_SIZE = 20;

function getResizeHandle(
  point: Point,
  area: TapArea,
  scale: number
): ResizeHandle {
  const x = area.bounds.x * scale;
  const y = area.bounds.y * scale;
  const w = area.bounds.width * scale;
  const h = area.bounds.height * scale;
  const threshold = HANDLE_SIZE;

  const nearLeft = Math.abs(point.x - x) < threshold;
  const nearRight = Math.abs(point.x - (x + w)) < threshold;
  const nearTop = Math.abs(point.y - y) < threshold;
  const nearBottom = Math.abs(point.y - (y + h)) < threshold;

  if (nearLeft && nearTop) return "nw";
  if (nearRight && nearTop) return "ne";
  if (nearLeft && nearBottom) return "sw";
  if (nearRight && nearBottom) return "se";
  if (nearTop && point.x >= x && point.x <= x + w) return "n";
  if (nearBottom && point.x >= x && point.x <= x + w) return "s";
  if (nearLeft && point.y >= y && point.y <= y + h) return "w";
  if (nearRight && point.y >= y && point.y <= y + h) return "e";

  return null;
}

function getCursorStyle(handle: ResizeHandle, isOverArea: boolean): string {
  if (handle) {
    const cursorMap: Record<NonNullable<ResizeHandle>, string> = {
      nw: "nw-resize",
      ne: "ne-resize",
      sw: "sw-resize",
      se: "se-resize",
      n: "n-resize",
      s: "s-resize",
      w: "w-resize",
      e: "e-resize",
    };
    return cursorMap[handle];
  }
  if (isOverArea) {
    return "move";
  }
  return "crosshair";
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
  const [cursor, setCursor] = useState("crosshair");

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

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || isDrawing) return;

      const coords = getCanvasCoordinates(e, canvas);

      // Check if hovering over selected area
      if (selectedAreaIndex !== null && selectedAreaIndex < areas.length) {
        const area = areas[selectedAreaIndex];
        const handle = getResizeHandle(coords, area, scale);
        const isOver = isPointInArea(coords, area, scale);
        setCursor(getCursorStyle(handle, isOver));
        return;
      }

      // Check if hovering over any area
      const hoveredIndex = areas.findIndex((area) => isPointInArea(coords, area, scale));
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
    <div ref={containerRef} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={handleMouseMoveWithCursor}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ cursor }}
        className="w-full rounded border border-slate-600"
      />
    </div>
  );
}
