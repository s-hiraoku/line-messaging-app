import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ImageArea } from '@/app/dashboard/message-items/card/_components/types';

/**
 * Atom for storing image areas for the current card being edited
 * Persisted to localStorage with automatic debounced saving
 */
export const cardImageAreasAtom = atomWithStorage<ImageArea[]>(
  'card-image-areas',
  []
);

/**
 * Atom for the currently selected image area ID
 */
export const selectedAreaIdAtom = atom<string | null>(null);

/**
 * Atom for tracking if image area editor is enabled
 */
export const imageAreaEditorEnabledAtom = atom<boolean>(false);
