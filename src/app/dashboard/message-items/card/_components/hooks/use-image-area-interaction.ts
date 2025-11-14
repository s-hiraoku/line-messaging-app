import { useState, useCallback, RefObject } from 'react';
import type { ImageArea } from '../types';
import type { ResizeHandle } from '../utils/image-area-canvas-utils';
import {
  getCanvasCoordinates,
  isPointInImageArea,
  getResizeHandle,
  calculateResizedArea,
  calculateMovedArea,
  calculateImageAreaRectangle,
  snapAreaToGrid,
} from '../utils/image-area-canvas-utils';
import { MIN_AREA_WIDTH, MIN_AREA_HEIGHT } from '../utils/image-area-validation';

interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface UseImageAreaInteractionProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  areas: ImageArea[];
  selectedAreaId: string | null;
  scale: number;
  imageSize: ImageSize;
  onSelectArea: (id: string | null) => void;
  onUpdateArea: (id: string, updates: Partial<ImageArea>) => void;
  onAddArea: (area: Omit<ImageArea, 'id'>) => void;
  snapEnabled: boolean;
  gridSize: number;
}

interface InteractionState {
  isDrawing: boolean;
  isMoving: boolean;
  isResizing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  resizeHandle: ResizeHandle;
  moveStart: Point | null;
  initialArea: ImageArea | null;
}

export function useImageAreaInteraction({
  canvasRef,
  areas,
  selectedAreaId,
  scale,
  imageSize,
  onSelectArea,
  onUpdateArea,
  onAddArea,
  snapEnabled,
  gridSize,
}: UseImageAreaInteractionProps) {
  const [state, setState] = useState<InteractionState>({
    isDrawing: false,
    isMoving: false,
    isResizing: false,
    drawStart: null,
    currentDraw: null,
    resizeHandle: null,
    moveStart: null,
    initialArea: null,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const point = getCanvasCoordinates(e, canvas);
      const selectedArea = areas.find((a) => a.id === selectedAreaId);

      // Check if clicking on resize handle of selected area
      if (selectedArea) {
        const handle = getResizeHandle(point, selectedArea, scale);
        if (handle) {
          setState({
            ...state,
            isResizing: true,
            resizeHandle: handle,
            moveStart: point,
            initialArea: selectedArea,
          });
          return;
        }

        // Check if clicking inside selected area (move)
        if (isPointInImageArea(point, selectedArea, scale)) {
          setState({
            ...state,
            isMoving: true,
            moveStart: point,
            initialArea: selectedArea,
          });
          return;
        }
      }

      // Check if clicking on any area (select)
      const clickedAreaIndex = areas.findIndex((area) =>
        isPointInImageArea(point, area, scale)
      );
      if (clickedAreaIndex !== -1) {
        onSelectArea(areas[clickedAreaIndex].id);
        return;
      }

      // Start drawing new area
      onSelectArea(null);
      setState({
        ...state,
        isDrawing: true,
        drawStart: point,
        currentDraw: point,
      });
    },
    [canvasRef, areas, selectedAreaId, scale, onSelectArea, state]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const point = getCanvasCoordinates(e, canvas);

      if (state.isDrawing && state.drawStart) {
        setState({
          ...state,
          currentDraw: point,
        });
      } else if (state.isResizing && state.moveStart && state.initialArea) {
        const delta = {
          x: point.x - state.moveStart.x,
          y: point.y - state.moveStart.y,
        };

        let newArea = calculateResizedArea(
          state.initialArea,
          state.resizeHandle,
          delta,
          scale,
          imageSize
        );

        if (snapEnabled) {
          newArea = snapAreaToGrid(newArea, gridSize);
        }

        onUpdateArea(state.initialArea.id, newArea);
      } else if (state.isMoving && state.moveStart && state.initialArea) {
        const delta = {
          x: point.x - state.moveStart.x,
          y: point.y - state.moveStart.y,
        };

        let newArea = calculateMovedArea(state.initialArea, delta, scale, imageSize);

        if (snapEnabled) {
          newArea = snapAreaToGrid(newArea, gridSize);
        }

        onUpdateArea(state.initialArea.id, newArea);
        setState({
          ...state,
          moveStart: point,
          initialArea: newArea,
        });
      }
    },
    [
      canvasRef,
      state,
      scale,
      imageSize,
      onUpdateArea,
      snapEnabled,
      gridSize,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const point = getCanvasCoordinates(e, canvas);

      if (state.isDrawing && state.drawStart) {
        const rect = calculateImageAreaRectangle(
          state.drawStart,
          point,
          scale,
          imageSize
        );

        // Only add area if it meets minimum size
        if (rect.width >= MIN_AREA_WIDTH && rect.height >= MIN_AREA_HEIGHT) {
          onAddArea({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            label: '',
            action: {
              type: 'uri',
              label: '',
              uri: 'https://example.com',
            },
          });
        }
      }

      setState({
        isDrawing: false,
        isMoving: false,
        isResizing: false,
        drawStart: null,
        currentDraw: null,
        resizeHandle: null,
        moveStart: null,
        initialArea: null,
      });
    },
    [canvasRef, state, scale, imageSize, onAddArea]
  );

  const handleMouseLeave = useCallback(() => {
    // Don't reset state on mouse leave during drag operations
    // This allows dragging outside canvas temporarily
  }, []);

  return {
    isDrawing: state.isDrawing,
    drawStart: state.drawStart,
    currentDraw: state.currentDraw,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
}
