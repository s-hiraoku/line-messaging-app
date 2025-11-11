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
}

export function drawAreaLabel(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  index: number,
  scale: number
) {
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = `bold ${LABEL_FONT_SIZE * scale}px sans-serif`;
  ctx.fillText(
    `Area ${index + 1}`,
    area.bounds.x * scale + LABEL_OFFSET_X,
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
