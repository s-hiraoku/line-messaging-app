import type { RichMenuSize, RichMenuSizeType } from "@/types/richmenu";

export const RICHMENU_SIZES: Record<RichMenuSizeType, RichMenuSize> = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
};

export const AREA_COLORS = [
  "rgba(59, 130, 246, 0.3)", // blue
  "rgba(239, 68, 68, 0.3)", // red
  "rgba(34, 197, 94, 0.3)", // green
  "rgba(234, 179, 8, 0.3)", // yellow
  "rgba(168, 85, 247, 0.3)", // purple
  "rgba(236, 72, 153, 0.3)", // pink
];

export const MIN_AREA_SIZE = 10;
export const LABEL_FONT_SIZE = 14;
export const LABEL_OFFSET_X = 5;
export const LABEL_OFFSET_Y = 20;
export const SELECTED_BORDER_WIDTH = 3;
export const DEFAULT_BORDER_WIDTH = 2;
export const SELECTED_BORDER_COLOR = "#3b82f6";
export const DEFAULT_BORDER_COLOR = "#ffffff";
export const LABEL_COLOR = "#ffffff";
export const DRAWING_PREVIEW_COLOR = "rgba(59, 130, 246, 0.3)";
