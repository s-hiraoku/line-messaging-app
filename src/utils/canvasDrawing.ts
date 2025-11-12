import type { TapArea, Point } from "@/types/richmenu";
import {
  AREA_COLORS,
  SELECTED_BORDER_WIDTH,
  DEFAULT_BORDER_WIDTH,
  SELECTED_BORDER_COLOR,
  DEFAULT_BORDER_COLOR,
  LABEL_COLOR,
  LABEL_FONT_SIZE,
  LABEL_OFFSET_X,
  LABEL_OFFSET_Y,
  DRAWING_PREVIEW_COLOR,
} from "@/constants/richmenu";
import { normalizeRectangle } from "./canvasCoordinates";

export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  ctx.drawImage(image, 0, 0, width, height);
}

export function drawArea(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  scale: number,
  colorIndex: number,
  isSelected: boolean
) {
  const x = area.bounds.x * scale;
  const y = area.bounds.y * scale;
  const width = area.bounds.width * scale;
  const height = area.bounds.height * scale;

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

export function drawAreaLabel(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  index: number,
  scale: number
) {
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = `bold ${LABEL_FONT_SIZE}px sans-serif`;
  ctx.fillText(
    `エリア ${index + 1}`,
    area.bounds.x * scale + LABEL_OFFSET_X * scale,
    area.bounds.y * scale + LABEL_OFFSET_Y * scale
  );
}

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
