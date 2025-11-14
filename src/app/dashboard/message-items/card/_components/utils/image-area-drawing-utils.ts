import type { ImageArea } from '../types';

interface Point {
  x: number;
  y: number;
}

/**
 * Colors for image areas
 */
const AREA_COLORS = [
  'rgba(59, 130, 246, 0.3)',  // blue
  'rgba(16, 185, 129, 0.3)',  // green
  'rgba(245, 158, 11, 0.3)',  // amber
  'rgba(239, 68, 68, 0.3)',   // red
  'rgba(168, 85, 247, 0.3)',  // purple
  'rgba(236, 72, 153, 0.3)',  // pink
];

const SELECTED_BORDER_COLOR = '#000000';
const DEFAULT_BORDER_COLOR = '#666666';
const SELECTED_BORDER_WIDTH = 3;
const DEFAULT_BORDER_WIDTH = 2;
const DRAWING_PREVIEW_COLOR = 'rgba(59, 130, 246, 0.2)';

/**
 * Draw image on canvas
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  ctx.drawImage(image, 0, 0, width, height);
}

/**
 * Draw an image area with selection state
 */
export function drawImageArea(
  ctx: CanvasRenderingContext2D,
  area: ImageArea,
  scale: number,
  colorIndex: number,
  isSelected: boolean
) {
  const x = area.x * scale;
  const y = area.y * scale;
  const width = area.width * scale;
  const height = area.height * scale;

  // Fill area with color
  ctx.fillStyle = AREA_COLORS[colorIndex % AREA_COLORS.length];
  ctx.fillRect(x, y, width, height);

  // Draw border
  ctx.strokeStyle = isSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
  ctx.lineWidth = isSelected ? SELECTED_BORDER_WIDTH : DEFAULT_BORDER_WIDTH;
  ctx.strokeRect(x, y, width, height);

  // Draw label
  if (area.label) {
    const fontSize = Math.max(12, 14 * scale);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text background
    const textMetrics = ctx.measureText(area.label);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    const padding = 4 * scale;
    const textX = x + width / 2;
    const textY = y + height / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      textX - textWidth / 2 - padding,
      textY - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.fillText(area.label, textX, textY);
  }

  // Draw resize handles if selected
  if (isSelected) {
    const handleSize = 8;
    const halfHandle = handleSize / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = SELECTED_BORDER_COLOR;
    ctx.lineWidth = 2;

    const handles = [
      { x: x - halfHandle, y: y - halfHandle }, // nw
      { x: x + width - halfHandle, y: y - halfHandle }, // ne
      { x: x - halfHandle, y: y + height - halfHandle }, // sw
      { x: x + width - halfHandle, y: y + height - halfHandle }, // se
      { x: x + width / 2 - halfHandle, y: y - halfHandle }, // n
      { x: x + width / 2 - halfHandle, y: y + height - halfHandle }, // s
      { x: x - halfHandle, y: y + height / 2 - halfHandle }, // w
      { x: x + width - halfHandle, y: y + height / 2 - halfHandle }, // e
    ];

    handles.forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }
}

/**
 * Draw preview rectangle during drawing
 */
export function drawDrawingPreview(
  ctx: CanvasRenderingContext2D,
  drawStart: Point,
  currentDraw: Point
) {
  const rect = normalizeRectangle(drawStart, currentDraw);

  ctx.fillStyle = DRAWING_PREVIEW_COLOR;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeStyle = SELECTED_BORDER_COLOR;
  ctx.lineWidth = DEFAULT_BORDER_WIDTH;
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Draw grid overlay
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Normalize rectangle coordinates (handle negative width/height)
 */
export function normalizeRectangle(
  start: Point,
  end: Point
): { x: number; y: number; width: number; height: number } {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return { x, y, width, height };
}
