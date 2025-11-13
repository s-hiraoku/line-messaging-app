/**
 * Card Message Editor - Persistence Hook
 *
 * Auto-saves card editor state to localStorage with debouncing
 * and provides restoration capabilities for draft recovery.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Card } from '../types';

/**
 * Saved card message data structure
 */
export interface SavedCardData {
  timestamp: number;
  altText: string;
  cards: Card[];
}

/**
 * Hook configuration options
 */
interface UseCardPersistenceOptions {
  /**
   * Debounce delay in milliseconds
   * @default 3000
   */
  debounceMs?: number;

  /**
   * Maximum age of saved data in days
   * @default 7
   */
  maxAgeDays?: number;

  /**
   * localStorage key
   * @default 'card-message-editor-draft'
   */
  storageKey?: string;
}

/**
 * Hook return value
 */
export interface UseCardPersistenceReturn {
  /**
   * Restore saved data from localStorage
   * Returns null if no valid saved data exists
   */
  restore: () => SavedCardData | null;

  /**
   * Clear saved data from localStorage
   */
  clear: () => void;

  /**
   * Whether valid saved data exists
   */
  hasSavedData: boolean;

  /**
   * Timestamp of the saved data (if exists)
   */
  savedAt: number | null;
}

const DEFAULT_OPTIONS: Required<UseCardPersistenceOptions> = {
  debounceMs: 3000,
  maxAgeDays: 7,
  storageKey: 'card-message-editor-draft',
};

/**
 * Hook for auto-saving and restoring card message editor state
 *
 * Features:
 * - Auto-save to localStorage after 3 seconds of inactivity (debounce)
 * - Automatic stale data detection (> 7 days)
 * - Save format: { timestamp, altText, cards }
 * - Load on mount
 * - Clear on successful send
 *
 * @param cards - Current card data
 * @param altText - Alternative text for the message
 * @param options - Configuration options
 * @returns Persistence methods and state
 *
 * @example
 * ```tsx
 * const { restore, clear, hasSavedData } = useCardPersistence(cards, altText);
 *
 * // Restore on mount
 * useEffect(() => {
 *   const saved = restore();
 *   if (saved) {
 *     setCards(saved.cards);
 *     setAltText(saved.altText);
 *   }
 * }, []);
 *
 * // Clear after successful send
 * const handleSend = async () => {
 *   await sendMessage();
 *   clear();
 * };
 * ```
 */
export function useCardPersistence(
  cards: Card[],
  altText: string,
  options: UseCardPersistenceOptions = {}
): UseCardPersistenceReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { debounceMs, maxAgeDays, storageKey } = opts;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get current saved data status
   */
  const getSavedDataStatus = useCallback((): { hasSavedData: boolean; savedAt: number | null } => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return { hasSavedData: false, savedAt: null };

      const parsed: unknown = JSON.parse(saved);

      if (!parsed || typeof parsed !== 'object') {
        return { hasSavedData: false, savedAt: null };
      }

      const candidate = parsed as Record<string, unknown>;

      if (
        typeof candidate.timestamp === 'number' &&
        typeof candidate.altText === 'string' &&
        Array.isArray(candidate.cards)
      ) {
        const now = Date.now();
        const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
        const isStale = now - candidate.timestamp > maxAge;

        if (isStale) {
          localStorage.removeItem(storageKey);
          return { hasSavedData: false, savedAt: null };
        }

        return { hasSavedData: true, savedAt: candidate.timestamp };
      }

      return { hasSavedData: false, savedAt: null };
    } catch {
      return { hasSavedData: false, savedAt: null };
    }
  }, [storageKey, maxAgeDays]);

  const [status, setStatus] = useState(getSavedDataStatus);

  /**
   * Check if saved data is stale
   */
  const isStale = useCallback(
    (timestamp: number): boolean => {
      const now = Date.now();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // Convert days to ms
      return now - timestamp > maxAge;
    },
    [maxAgeDays]
  );

  /**
   * Validate saved data structure
   */
  const isValidSavedData = useCallback(
    (data: unknown): data is SavedCardData => {
      if (!data || typeof data !== 'object') return false;

      const candidate = data as Record<string, unknown>;

      return (
        typeof candidate.timestamp === 'number' &&
        typeof candidate.altText === 'string' &&
        Array.isArray(candidate.cards) &&
        !isStale(candidate.timestamp)
      );
    },
    [isStale]
  );

  /**
   * Restore saved data from localStorage
   */
  const restore = useCallback((): SavedCardData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsed: unknown = JSON.parse(saved);

      if (!isValidSavedData(parsed)) {
        // Clear stale or invalid data
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to restore card data:', error);
      return null;
    }
  }, [storageKey, isValidSavedData]);

  /**
   * Clear saved data from localStorage
   */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setStatus({ hasSavedData: false, savedAt: null });
    } catch (error) {
      console.error('Failed to clear card data:', error);
    }
  }, [storageKey]);

  /**
   * Save current state to localStorage (internal)
   */
  const save = useCallback(
    (cardsToSave: Card[], altTextToSave: string) => {
      try {
        // Don't save if there's no meaningful data
        if (cardsToSave.length === 0 && !altTextToSave.trim()) {
          return;
        }

        const data: SavedCardData = {
          timestamp: Date.now(),
          altText: altTextToSave,
          cards: cardsToSave,
        };

        localStorage.setItem(storageKey, JSON.stringify(data));
        setStatus({ hasSavedData: true, savedAt: data.timestamp });
      } catch (error) {
        console.error('Failed to save card data:', error);
      }
    },
    [storageKey]
  );

  /**
   * Auto-save with debounce when cards or altText changes
   */
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      save(cards, altText);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cards, altText, debounceMs, save]);

  return {
    restore,
    clear,
    hasSavedData: status.hasSavedData,
    savedAt: status.savedAt,
  };
}
