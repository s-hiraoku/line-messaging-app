import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { TemplateArea } from '@/lib/template-image-splitter/types';

type TemplateSelectionState = Record<string, string | null>;
type TemplateAreasState = Record<string, TemplateArea[]>;

/**
 * Stores selected template variant per card in localStorage
 */
export const selectedTemplateAtom = atomWithStorage<TemplateSelectionState>(
  'template-image-selected-template',
  {}
);

/**
 * Stores template areas per card in localStorage
 */
export const templateAreasAtom = atomWithStorage<TemplateAreasState>(
  'template-image-areas',
  {}
);

/**
 * Derived atom helper for reading/writing selected template by card ID
 */
export const createSelectedTemplateForCardAtom = (cardId: string) =>
  atom(
    (get) => get(selectedTemplateAtom)[cardId] ?? null,
    (get, set, value: string | null) => {
      set(selectedTemplateAtom, {
        ...get(selectedTemplateAtom),
        [cardId]: value,
      });
    }
  );

/**
 * Derived atom helper for reading/writing template areas by card ID
 */
export const createTemplateAreasForCardAtom = (cardId: string) =>
  atom(
    (get) => get(templateAreasAtom)[cardId] ?? [],
    (get, set, value: TemplateArea[]) => {
      set(templateAreasAtom, {
        ...get(templateAreasAtom),
        [cardId]: value,
      });
    }
  );

/**
 * Clears persisted template state for a specific card
 */
export const clearTemplateStateAtom = atom(
  null,
  (get, set, cardId: string) => {
    const nextSelected = { ...get(selectedTemplateAtom) };
    delete nextSelected[cardId];
    set(selectedTemplateAtom, nextSelected);

    const nextAreas = { ...get(templateAreasAtom) };
    delete nextAreas[cardId];
    set(templateAreasAtom, nextAreas);
  }
);
