import type { ImageArea } from '../types';

interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  width: number;
  height: number;
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

const HANDLE_SIZE = 20;

/**
 * Get canvas coordinates from mouse event
 */
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

/**
 * Check if a point is inside an image area
 */
export function isPointInImageArea(
  point: Point,
  area: ImageArea,
  scale: number
): boolean {
  const x = area.x * scale;
  const y = area.y * scale;
  const w = area.width * scale;
  const h = area.height * scale;
  return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
}

/**
 * Calculate rectangle from two points with boundary constraints
 */
export function calculateImageAreaRectangle(
  start: Point,
  end: Point,
  scale: number,
  imageSize: ImageSize
) {
  const x = Math.min(start.x, end.x) / scale;
  const y = Math.min(start.y, end.y) / scale;
  const width = Math.abs(end.x - start.x) / scale;
  const height = Math.abs(end.y - start.y) / scale;

  // Constrain to image boundaries
  const constrainedX = Math.max(0, Math.min(imageSize.width - width, x));
  const constrainedY = Math.max(0, Math.min(imageSize.height - height, y));

  return {
    x: Math.round(constrainedX),
    y: Math.round(constrainedY),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Get the resize handle at a point relative to an area
 */
export function getResizeHandle(
  point: Point,
  area: ImageArea,
  scale: number
): ResizeHandle {
  const x = area.x * scale;
  const y = area.y * scale;
  const w = area.width * scale;
  const h = area.height * scale;
  const threshold = HANDLE_SIZE;

  const nearLeft = Math.abs(point.x - x) < threshold;
  const nearRight = Math.abs(point.x - (x + w)) < threshold;
  const nearTop = Math.abs(point.y - y) < threshold;
  const nearBottom = Math.abs(point.y - (y + h)) < threshold;

  if (nearLeft && nearTop) return 'nw';
  if (nearRight && nearTop) return 'ne';
  if (nearLeft && nearBottom) return 'sw';
  if (nearRight && nearBottom) return 'se';
  if (nearTop && point.x >= x && point.x <= x + w) return 'n';
  if (nearBottom && point.x >= x && point.x <= x + w) return 's';
  if (nearLeft && point.y >= y && point.y <= y + h) return 'w';
  if (nearRight && point.y >= y && point.y <= y + h) return 'e';

  return null;
}

/**
 * Get cursor style based on resize handle or hover state
 */
export function getCursorStyle(
  handle: ResizeHandle,
  isOverArea: boolean
): string {
  if (handle) {
    const cursorMap: Record<NonNullable<ResizeHandle>, string> = {
      nw: 'nw-resize',
      ne: 'ne-resize',
      sw: 'sw-resize',
      se: 'se-resize',
      n: 'n-resize',
      s: 's-resize',
      w: 'w-resize',
      e: 'e-resize',
    };
    return cursorMap[handle];
  }
  if (isOverArea) {
    return 'move';
  }
  return 'crosshair';
}

/**
 * Calculate new area bounds during resize
 */
export function calculateResizedArea(
  area: ImageArea,
  handle: ResizeHandle,
  delta: Point,
  scale: number,
  imageSize: ImageSize
): ImageArea {
  if (!handle) return area;

  const result = { ...area };
  const dx = delta.x / scale;
  const dy = delta.y / scale;

  switch (handle) {
    case 'nw':
      result.x += dx;
      result.y += dy;
      result.width -= dx;
      result.height -= dy;
      break;
    case 'ne':
      result.y += dy;
      result.width += dx;
      result.height -= dy;
      break;
    case 'sw':
      result.x += dx;
      result.width -= dx;
      result.height += dy;
      break;
    case 'se':
      result.width += dx;
      result.height += dy;
      break;
    case 'n':
      result.y += dy;
      result.height -= dy;
      break;
    case 's':
      result.height += dy;
      break;
    case 'w':
      result.x += dx;
      result.width -= dx;
      break;
    case 'e':
      result.width += dx;
      break;
  }

  // Constrain to image boundaries
  result.x = Math.max(0, Math.min(imageSize.width - result.width, result.x));
  result.y = Math.max(0, Math.min(imageSize.height - result.height, result.y));
  result.width = Math.max(50, Math.min(imageSize.width - result.x, result.width));
  result.height = Math.max(50, Math.min(imageSize.height - result.y, result.height));

  return result;
}

/**
 * Calculate new area position during move
 */
export function calculateMovedArea(
  area: ImageArea,
  delta: Point,
  scale: number,
  imageSize: ImageSize
): ImageArea {
  const result = { ...area };
  const dx = delta.x / scale;
  const dy = delta.y / scale;

  result.x += dx;
  result.y += dy;

  // Constrain to image boundaries
  result.x = Math.max(0, Math.min(imageSize.width - result.width, result.x));
  result.y = Math.max(0, Math.min(imageSize.height - result.height, result.y));

  return result;
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap area to grid
 */
export function snapAreaToGrid(area: ImageArea, gridSize: number): ImageArea {
  return {
    ...area,
    x: snapToGrid(area.x, gridSize),
    y: snapToGrid(area.y, gridSize),
    width: snapToGrid(area.width, gridSize),
    height: snapToGrid(area.height, gridSize),
  };
}
