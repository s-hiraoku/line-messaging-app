import { useEffect } from 'react';
import type { ImageArea } from '../types';
import { constrainArea } from '../utils/image-area-validation';

interface ImageSize {
  width: number;
  height: number;
}

interface UseImageAreaKeyboardProps {
  enabled: boolean;
  areas: ImageArea[];
  selectedAreaId: string | null;
  imageSize: ImageSize;
  onSelectArea: (id: string | null) => void;
  onUpdateArea: (id: string, updates: Partial<ImageArea>) => void;
  onDeleteArea: (id: string) => void;
}

export function useImageAreaKeyboard({
  enabled,
  areas,
  selectedAreaId,
  imageSize,
  onSelectArea,
  onUpdateArea,
  onDeleteArea,
}: UseImageAreaKeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedArea = areas.find((a) => a.id === selectedAreaId);

      // Escape: Deselect
      if (e.key === 'Escape') {
        onSelectArea(null);
        return;
      }

      // Delete/Backspace: Delete selected area
      if (selectedArea && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        onDeleteArea(selectedArea.id);
        return;
      }

      // Tab: Cycle through areas
      if (e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = areas.findIndex((a) => a.id === selectedAreaId);
        const nextIndex = e.shiftKey
          ? currentIndex <= 0
            ? areas.length - 1
            : currentIndex - 1
          : currentIndex >= areas.length - 1
          ? 0
          : currentIndex + 1;

        if (areas[nextIndex]) {
          onSelectArea(areas[nextIndex].id);
        }
        return;
      }

      // Arrow keys: Move selected area
      if (selectedArea && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const newArea = { ...selectedArea };

        switch (e.key) {
          case 'ArrowUp':
            newArea.y -= step;
            break;
          case 'ArrowDown':
            newArea.y += step;
            break;
          case 'ArrowLeft':
            newArea.x -= step;
            break;
          case 'ArrowRight':
            newArea.x += step;
            break;
        }

        const constrainedArea = constrainArea(newArea, imageSize.width, imageSize.height);
        onUpdateArea(selectedArea.id, constrainedArea);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    areas,
    selectedAreaId,
    imageSize,
    onSelectArea,
    onUpdateArea,
    onDeleteArea,
  ]);
}
