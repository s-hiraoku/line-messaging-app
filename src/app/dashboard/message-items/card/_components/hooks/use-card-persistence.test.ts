/**
 * Card Message Editor - Persistence Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCardPersistence } from './use-card-persistence';
import type { Card } from '../types';

describe('useCardPersistence', () => {
  const STORAGE_KEY = 'card-message-editor-draft';
  const mockCards: Card[] = [
    {
      id: '1',
      type: 'product',
      title: 'Test Product',
      description: 'Test Description',
      imageUrl: 'https://example.com/image.jpg',
      price: 1000,
      actions: [
        {
          type: 'uri',
          label: 'View',
          uri: 'https://example.com',
        },
      ],
    },
  ];
  const mockAltText = 'Test alt text';

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Auto-save functionality', () => {
    it('should auto-save after debounce delay (3 seconds)', () => {
      const { result } = renderHook(() =>
        useCardPersistence(mockCards, mockAltText)
      );

      // Initially no saved data
      expect(result.current.hasSavedData).toBe(false);

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should be saved now
      expect(result.current.hasSavedData).toBe(true);

      // Check localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.cards).toEqual(mockCards);
      expect(parsed.altText).toBe(mockAltText);
      expect(parsed.timestamp).toBeTypeOf('number');
    });

    it('should not save if cards are empty and altText is empty', () => {
      renderHook(() => useCardPersistence([], ''));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeNull();
    });

    it('should debounce multiple updates', () => {
      const { rerender } = renderHook(
        ({ cards, altText }) => useCardPersistence(cards, altText),
        {
          initialProps: { cards: mockCards, altText: mockAltText },
        }
      );

      // Wait for initial save to complete
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Update multiple times within debounce window
      rerender({ cards: mockCards, altText: 'Update 1' });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      rerender({ cards: mockCards, altText: 'Update 2' });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      rerender({ cards: mockCards, altText: 'Final Update' });
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should only save the final update
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(parsed.altText).toBe('Final Update');
    });

    it('should use custom debounce time', () => {
      const { result } = renderHook(() =>
        useCardPersistence(mockCards, mockAltText, { debounceMs: 5000 })
      );

      // Advance only 3 seconds (default)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should not be saved yet
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Advance to 5 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should be saved now
      expect(result.current.hasSavedData).toBe(true);
    });
  });

  describe('Restore functionality', () => {
    it('should restore valid saved data', () => {
      // Pre-save data
      const savedData = {
        timestamp: Date.now(),
        altText: mockAltText,
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useCardPersistence([], ''));

      const restored = result.current.restore();
      expect(restored).toEqual(savedData);
      expect(result.current.hasSavedData).toBe(true);
      expect(result.current.savedAt).toBe(savedData.timestamp);
    });

    it('should return null if no saved data exists', () => {
      const { result } = renderHook(() => useCardPersistence([], ''));

      const restored = result.current.restore();
      expect(restored).toBeNull();
      expect(result.current.hasSavedData).toBe(false);
    });

    it('should detect and remove stale data (> 7 days)', () => {
      const staleTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago
      const staleData = {
        timestamp: staleTimestamp,
        altText: mockAltText,
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(staleData));

      const { result } = renderHook(() => useCardPersistence([], ''));

      const restored = result.current.restore();
      expect(restored).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should use custom maxAgeDays', () => {
      const timestamp = Date.now() - 6 * 24 * 60 * 60 * 1000; // 6 days ago
      const savedData = {
        timestamp,
        altText: mockAltText,
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      // With 5 days max age, should be stale
      const { result } = renderHook(() =>
        useCardPersistence([], '', { maxAgeDays: 5 })
      );

      const restored = result.current.restore();
      expect(restored).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json{');

      const { result } = renderHook(() => useCardPersistence([], ''));

      const restored = result.current.restore();
      expect(restored).toBeNull();
    });

    it('should handle invalid data structure', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ invalid: 'structure' })
      );

      const { result } = renderHook(() => useCardPersistence([], ''));

      const restored = result.current.restore();
      expect(restored).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Clear functionality', () => {
    it('should clear saved data', () => {
      const savedData = {
        timestamp: Date.now(),
        altText: mockAltText,
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useCardPersistence([], ''));

      expect(result.current.hasSavedData).toBe(true);

      act(() => {
        result.current.clear();
      });

      expect(result.current.hasSavedData).toBe(false);
      expect(result.current.savedAt).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle clearing when no data exists', () => {
      const { result } = renderHook(() => useCardPersistence([], ''));

      expect(() => {
        act(() => {
          result.current.clear();
        });
      }).not.toThrow();
    });
  });

  describe('Custom storage key', () => {
    it('should use custom storage key', () => {
      const customKey = 'my-custom-key';

      renderHook(() =>
        useCardPersistence(mockCards, mockAltText, { storageKey: customKey })
      );

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(localStorage.getItem(customKey)).toBeTruthy();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should restore data on mount and update savedAt', () => {
      const savedData = {
        timestamp: Date.now(),
        altText: mockAltText,
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useCardPersistence([], ''));

      expect(result.current.hasSavedData).toBe(true);
      expect(result.current.savedAt).toBe(savedData.timestamp);
    });

    it('should update timestamp when auto-saving', () => {
      const { result } = renderHook(() =>
        useCardPersistence(mockCards, mockAltText)
      );

      const initialTime = Date.now();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.savedAt).toBeGreaterThanOrEqual(initialTime);
    });

    it('should handle typical workflow: restore -> edit -> save -> clear', () => {
      // 1. Pre-save initial data
      const initialData = {
        timestamp: Date.now(),
        altText: 'Initial',
        cards: mockCards,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));

      // 2. Restore on mount
      const { result, rerender } = renderHook(
        ({ cards, altText }: { cards: Card[]; altText: string }) => useCardPersistence(cards, altText),
        {
          initialProps: { cards: [] as Card[], altText: '' },
        }
      );

      expect(result.current.hasSavedData).toBe(true);
      const restored = result.current.restore();
      expect(restored?.altText).toBe('Initial');

      // 3. Edit
      rerender({ cards: mockCards, altText: 'Edited' });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // 4. Verify saved
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.altText).toBe('Edited');

      // 5. Clear after successful send
      act(() => {
        result.current.clear();
      });

      expect(result.current.hasSavedData).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() => useCardPersistence(mockCards, mockAltText));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(consoleSpy).toHaveBeenCalled();

      // Cleanup
      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    it('should handle empty cards array', () => {
      renderHook(() => useCardPersistence([], mockAltText));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(parsed.cards).toEqual([]);
      expect(parsed.altText).toBe(mockAltText);
    });

    it('should handle very long altText', () => {
      const longAltText = 'a'.repeat(1000);

      renderHook(() => useCardPersistence(mockCards, longAltText));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      expect(parsed.altText).toBe(longAltText);
    });
  });
});
