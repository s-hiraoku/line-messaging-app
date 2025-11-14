import { useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  cardImageAreasAtom,
  selectedAreaIdAtom,
  imageAreaEditorEnabledAtom,
} from '@/state/message/card-image-areas-atom';
import type { ImageArea, CardAction } from '../types';
import { MAX_IMAGE_AREAS } from '../utils/image-area-validation';

/**
 * Main hook for managing image areas in the card editor
 */
export function useImageAreaEditor() {
  const [areas, setAreas] = useAtom(cardImageAreasAtom);
  const [selectedAreaId, setSelectedAreaId] = useAtom(selectedAreaIdAtom);
  const [enabled, setEnabled] = useAtom(imageAreaEditorEnabledAtom);

  /**
   * Add a new image area
   */
  const addArea = useCallback(
    (area: Omit<ImageArea, 'id'>) => {
      if (areas.length >= MAX_IMAGE_AREAS) {
        return;
      }

      const newArea: ImageArea = {
        ...area,
        id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setAreas([...areas, newArea]);
      setSelectedAreaId(newArea.id);
    },
    [areas, setAreas, setSelectedAreaId]
  );

  /**
   * Update an existing image area
   */
  const updateArea = useCallback(
    (id: string, updates: Partial<ImageArea>) => {
      setAreas(
        areas.map((area) => (area.id === id ? { ...area, ...updates } : area))
      );
    },
    [areas, setAreas]
  );

  /**
   * Delete an image area
   */
  const deleteArea = useCallback(
    (id: string) => {
      setAreas(areas.filter((area) => area.id !== id));
      if (selectedAreaId === id) {
        setSelectedAreaId(null);
      }
    },
    [areas, selectedAreaId, setAreas, setSelectedAreaId]
  );

  /**
   * Reorder areas
   */
  const reorderAreas = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newAreas = [...areas];
      const [removed] = newAreas.splice(fromIndex, 1);
      newAreas.splice(toIndex, 0, removed);
      setAreas(newAreas);
    },
    [areas, setAreas]
  );

  /**
   * Move area up in the list
   */
  const moveAreaUp = useCallback(
    (id: string) => {
      const index = areas.findIndex((area) => area.id === id);
      if (index > 0) {
        reorderAreas(index, index - 1);
      }
    },
    [areas, reorderAreas]
  );

  /**
   * Move area down in the list
   */
  const moveAreaDown = useCallback(
    (id: string) => {
      const index = areas.findIndex((area) => area.id === id);
      if (index < areas.length - 1) {
        reorderAreas(index, index + 1);
      }
    },
    [areas, reorderAreas]
  );

  /**
   * Update area label
   */
  const updateAreaLabel = useCallback(
    (id: string, label: string) => {
      updateArea(id, { label });
    },
    [updateArea]
  );

  /**
   * Update area action
   */
  const updateAreaAction = useCallback(
    (id: string, action: CardAction) => {
      updateArea(id, { action });
    },
    [updateArea]
  );

  /**
   * Clear all areas
   */
  const clearAreas = useCallback(() => {
    setAreas([]);
    setSelectedAreaId(null);
  }, [setAreas, setSelectedAreaId]);

  /**
   * Toggle editor enabled state
   */
  const toggleEnabled = useCallback(() => {
    setEnabled(!enabled);
    if (enabled) {
      // When disabling, optionally clear areas
      // clearAreas();
    }
  }, [enabled, setEnabled]);

  /**
   * Get selected area
   */
  const selectedArea = areas.find((area) => area.id === selectedAreaId) || null;

  return {
    // State
    areas,
    selectedAreaId,
    selectedArea,
    enabled,
    canAddMore: areas.length < MAX_IMAGE_AREAS,

    // Actions
    addArea,
    updateArea,
    deleteArea,
    reorderAreas,
    moveAreaUp,
    moveAreaDown,
    updateAreaLabel,
    updateAreaAction,
    clearAreas,
    setSelectedAreaId,
    toggleEnabled,
    setEnabled,
  };
}
