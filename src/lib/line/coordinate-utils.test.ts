import { describe, it, expect } from 'vitest';
import { toApiCoordinates, toDisplayCoordinates, type Area } from './coordinate-utils';

describe('toApiCoordinates', () => {
  describe('basic conversion', () => {
    it('converts display coordinates to API coordinates at 520px display size', () => {
      const displayCoords: Area = { x: 100, y: 100, width: 200, height: 200 };
      const result = toApiCoordinates(displayCoords, 520);

      // 520px display = 1040px API (2x scale)
      expect(result).toEqual({
        x: 200,
        y: 200,
        width: 400,
        height: 400,
      });
    });

    it('converts display coordinates to API coordinates at 1040px display size', () => {
      const displayCoords: Area = { x: 100, y: 100, width: 200, height: 200 };
      const result = toApiCoordinates(displayCoords, 1040);

      // 1040px display = 1040px API (1x scale)
      expect(result).toEqual({
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      });
    });

    it('converts display coordinates to API coordinates at 260px display size', () => {
      const displayCoords: Area = { x: 50, y: 50, width: 100, height: 100 };
      const result = toApiCoordinates(displayCoords, 260);

      // 260px display = 1040px API (4x scale)
      expect(result).toEqual({
        x: 200,
        y: 200,
        width: 400,
        height: 400,
      });
    });
  });

  describe('edge cases', () => {
    it('handles zero coordinates', () => {
      const displayCoords: Area = { x: 0, y: 0, width: 0, height: 0 };
      const result = toApiCoordinates(displayCoords, 520);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });

    it('handles minimum size area', () => {
      const displayCoords: Area = { x: 1, y: 1, width: 1, height: 1 };
      const result = toApiCoordinates(displayCoords, 520);

      expect(result).toEqual({
        x: 2,
        y: 2,
        width: 2,
        height: 2,
      });
    });

    it('handles full size area', () => {
      const displayCoords: Area = { x: 0, y: 0, width: 520, height: 520 };
      const result = toApiCoordinates(displayCoords, 520);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 1040,
        height: 1040,
      });
    });

    it('handles maximum API coordinates', () => {
      const displayCoords: Area = { x: 0, y: 0, width: 1040, height: 1040 };
      const result = toApiCoordinates(displayCoords, 1040);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 1040,
        height: 1040,
      });
    });
  });

  describe('rounding accuracy', () => {
    it('rounds fractional results to nearest integer', () => {
      const displayCoords: Area = { x: 33, y: 33, width: 67, height: 67 };
      const result = toApiCoordinates(displayCoords, 300);

      // 300px display → 1040px API (3.466... scale)
      // 33 * 3.466... = 114.4 → 114
      // 67 * 3.466... = 232.2 → 232
      expect(result.x).toBe(114);
      expect(result.y).toBe(114);
      expect(result.width).toBe(232);
      expect(result.height).toBe(232);
    });

    it('rounds up when fraction is 0.5 or greater', () => {
      const displayCoords: Area = { x: 3, y: 3, width: 3, height: 3 };
      const result = toApiCoordinates(displayCoords, 520);

      // 3 * 2 = 6 (exact)
      expect(result.x).toBe(6);
      expect(result.y).toBe(6);
      expect(result.width).toBe(6);
      expect(result.height).toBe(6);
    });
  });
});

describe('toDisplayCoordinates', () => {
  describe('basic conversion', () => {
    it('converts API coordinates to display coordinates at 520px display size', () => {
      const apiCoords: Area = { x: 200, y: 200, width: 400, height: 400 };
      const result = toDisplayCoordinates(apiCoords, 520);

      // 1040px API → 520px display (0.5x scale)
      expect(result).toEqual({
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      });
    });

    it('converts API coordinates to display coordinates at 1040px display size', () => {
      const apiCoords: Area = { x: 100, y: 100, width: 200, height: 200 };
      const result = toDisplayCoordinates(apiCoords, 1040);

      // 1040px API → 1040px display (1x scale)
      expect(result).toEqual({
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      });
    });

    it('converts API coordinates to display coordinates at 260px display size', () => {
      const apiCoords: Area = { x: 200, y: 200, width: 400, height: 400 };
      const result = toDisplayCoordinates(apiCoords, 260);

      // 1040px API → 260px display (0.25x scale)
      expect(result).toEqual({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      });
    });
  });

  describe('edge cases', () => {
    it('handles zero coordinates', () => {
      const apiCoords: Area = { x: 0, y: 0, width: 0, height: 0 };
      const result = toDisplayCoordinates(apiCoords, 520);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });

    it('handles minimum size area', () => {
      const apiCoords: Area = { x: 2, y: 2, width: 2, height: 2 };
      const result = toDisplayCoordinates(apiCoords, 520);

      expect(result).toEqual({
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      });
    });

    it('handles full size area', () => {
      const apiCoords: Area = { x: 0, y: 0, width: 1040, height: 1040 };
      const result = toDisplayCoordinates(apiCoords, 520);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 520,
        height: 520,
      });
    });

    it('handles maximum display size', () => {
      const apiCoords: Area = { x: 0, y: 0, width: 1040, height: 1040 };
      const result = toDisplayCoordinates(apiCoords, 1040);

      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 1040,
        height: 1040,
      });
    });
  });

  describe('rounding accuracy', () => {
    it('rounds fractional results to nearest integer', () => {
      const apiCoords: Area = { x: 114, y: 114, width: 232, height: 232 };
      const result = toDisplayCoordinates(apiCoords, 300);

      // 1040px API → 300px display (0.288... scale)
      // 114 * 0.288... = 32.88 → 33
      // 232 * 0.288... = 66.92 → 67
      expect(result.x).toBe(33);
      expect(result.y).toBe(33);
      expect(result.width).toBe(67);
      expect(result.height).toBe(67);
    });

    it('rounds up when fraction is 0.5 or greater', () => {
      const apiCoords: Area = { x: 6, y: 6, width: 6, height: 6 };
      const result = toDisplayCoordinates(apiCoords, 520);

      // 6 * 0.5 = 3 (exact)
      expect(result.x).toBe(3);
      expect(result.y).toBe(3);
      expect(result.width).toBe(3);
      expect(result.height).toBe(3);
    });
  });
});

describe('coordinate conversion reversibility', () => {
  it('converts display → API → display with minimal precision loss at 520px', () => {
    const original: Area = { x: 100, y: 100, width: 200, height: 200 };
    const apiCoords = toApiCoordinates(original, 520);
    const result = toDisplayCoordinates(apiCoords, 520);

    expect(result).toEqual(original);
  });

  it('converts API → display → API with minimal precision loss at 520px', () => {
    const original: Area = { x: 200, y: 200, width: 400, height: 400 };
    const displayCoords = toDisplayCoordinates(original, 520);
    const result = toApiCoordinates(displayCoords, 520);

    expect(result).toEqual(original);
  });

  it('converts display → API → display with minimal precision loss at 1040px', () => {
    const original: Area = { x: 100, y: 100, width: 200, height: 200 };
    const apiCoords = toApiCoordinates(original, 1040);
    const result = toDisplayCoordinates(apiCoords, 1040);

    expect(result).toEqual(original);
  });

  it('handles precision loss gracefully with odd display sizes', () => {
    const original: Area = { x: 33, y: 33, width: 67, height: 67 };
    const apiCoords = toApiCoordinates(original, 300);
    const result = toDisplayCoordinates(apiCoords, 300);

    // Due to rounding, we may have ±1 pixel difference
    expect(Math.abs(result.x - original.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.y - original.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.width - original.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.height - original.height)).toBeLessThanOrEqual(1);
  });
});

describe('various display sizes', () => {
  const testCases = [
    { displaySize: 260, scale: 4 },
    { displaySize: 520, scale: 2 },
    { displaySize: 780, scale: 1040 / 780 },
    { displaySize: 1040, scale: 1 },
  ];

  testCases.forEach(({ displaySize, scale }) => {
    it(`correctly converts at ${displaySize}px display size`, () => {
      const displayCoords: Area = { x: 100, y: 100, width: 200, height: 200 };
      const apiCoords = toApiCoordinates(displayCoords, displaySize);

      expect(apiCoords.x).toBe(Math.round(100 * scale));
      expect(apiCoords.y).toBe(Math.round(100 * scale));
      expect(apiCoords.width).toBe(Math.round(200 * scale));
      expect(apiCoords.height).toBe(Math.round(200 * scale));
    });
  });
});
