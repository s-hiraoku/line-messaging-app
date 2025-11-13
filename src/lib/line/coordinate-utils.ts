/**
 * Coordinate conversion utilities for LINE Rich Message image editor
 *
 * LINE API requires coordinates in 1040x1040 base, but the visual editor
 * displays images at various sizes. These utilities convert between
 * display coordinates and API coordinates.
 */

/**
 * Area coordinates and dimensions
 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert display coordinates to LINE API coordinates (1040x1040 base)
 *
 * @param displayCoords - Coordinates in the display coordinate system
 * @param displaySize - Current display size (width/height in pixels)
 * @returns Coordinates in LINE API coordinate system (1040x1040 base)
 *
 * @example
 * ```typescript
 * const apiCoords = toApiCoordinates(
 *   { x: 100, y: 100, width: 200, height: 200 },
 *   520
 * );
 * // Returns: { x: 200, y: 200, width: 400, height: 400 }
 * ```
 */
export const toApiCoordinates = (displayCoords: Area, displaySize: number): Area => {
  const scale = 1040 / displaySize;
  return {
    x: Math.round(displayCoords.x * scale),
    y: Math.round(displayCoords.y * scale),
    width: Math.round(displayCoords.width * scale),
    height: Math.round(displayCoords.height * scale),
  };
};

/**
 * Convert LINE API coordinates (1040x1040 base) to display coordinates
 *
 * @param apiCoords - Coordinates in LINE API coordinate system (1040x1040 base)
 * @param displaySize - Target display size (width/height in pixels)
 * @returns Coordinates in the display coordinate system
 *
 * @example
 * ```typescript
 * const displayCoords = toDisplayCoordinates(
 *   { x: 200, y: 200, width: 400, height: 400 },
 *   520
 * );
 * // Returns: { x: 100, y: 100, width: 200, height: 200 }
 * ```
 */
export const toDisplayCoordinates = (apiCoords: Area, displaySize: number): Area => {
  const scale = displaySize / 1040;
  return {
    x: Math.round(apiCoords.x * scale),
    y: Math.round(apiCoords.y * scale),
    width: Math.round(apiCoords.width * scale),
    height: Math.round(apiCoords.height * scale),
  };
};
