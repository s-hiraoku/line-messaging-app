import type { Point, TapArea } from "@/types/richmenu";

export function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function isPointInArea(point: Point, area: TapArea, scale: number): boolean {
  const x = area.bounds.x * scale;
  const y = area.bounds.y * scale;
  const w = area.bounds.width * scale;
  const h = area.bounds.height * scale;
  return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
}

export function calculateRectangle(start: Point, end: Point, scale: number) {
  const x = Math.min(start.x, end.x) / scale;
  const y = Math.min(start.y, end.y) / scale;
  const width = Math.abs(end.x - start.x) / scale;
  const height = Math.abs(end.y - start.y) / scale;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function normalizeRectangle(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}
