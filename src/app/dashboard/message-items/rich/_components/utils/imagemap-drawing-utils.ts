import type { ImagemapArea } from "../editor";
import {
  AREA_COLORS,
  SELECTED_BORDER_WIDTH,
  DEFAULT_BORDER_WIDTH,
  SELECTED_BORDER_COLOR,
  DEFAULT_BORDER_COLOR,
  DRAWING_PREVIEW_COLOR,
} from "@/constants/richmenu";
import { normalizeRectangle } from "./imagemap-canvas-utils";

interface Point {
  x: number;
  y: number;
}

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
 * Draw an imagemap area with selection state
 */
export function drawImagemapArea(
  ctx: CanvasRenderingContext2D,
  area: ImagemapArea,
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

  // Draw resize handles if selected
  if (isSelected) {
    const handleSize = 8;
    const halfHandle = handleSize / 2;
    ctx.fillStyle = "#ffffff";
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
