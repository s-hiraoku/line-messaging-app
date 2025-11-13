import { useState, useCallback, RefObject } from "react";
import type { ImagemapArea } from "../editor";
import {
  getCanvasCoordinates,
  isPointInImagemapArea,
  calculateImagemapRectangle,
  getResizeHandle,
} from "../utils/imagemap-canvas-utils";

interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface UseImagemapAreaSelectionProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  areas: ImagemapArea[];
  onAreasChange: (areas: ImagemapArea[]) => void;
  scale: number;
  imageSize: ImageSize;
}

type DragMode = "drawing" | "moving" | "resizing";
type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

const MIN_AREA_SIZE = 50; // Minimum 50x50px as per requirements

export function useImagemapAreaSelection({
  canvasRef,
  areas,
  onAreasChange,
  scale,
  imageSize,
}: UseImagemapAreaSelectionProps) {
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(
    null
  );
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentDrag, setCurrentDrag] = useState<Point | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [originalBounds, setOriginalBounds] = useState<Omit<
    ImagemapArea,
    "action"
  > | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const coords = getCanvasCoordinates(e, canvas);

      // Check if clicking on existing area
      const clickedIndex = areas.findIndex((area) =>
        isPointInImagemapArea(coords, area, scale)
      );

      if (clickedIndex !== -1) {
        const area = areas[clickedIndex];
        const handle = getResizeHandle(coords, area, scale);

        setSelectedAreaIndex(clickedIndex);
        setDragStart(coords);
        setCurrentDrag(coords);
        setOriginalBounds({
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
        });

        if (handle) {
          // Start resizing
          setDragMode("resizing");
          setResizeHandle(handle);
        } else {
          // Start moving
          setDragMode("moving");
        }
        return;
      }

      // Start drawing new area
      setSelectedAreaIndex(null);
      setDragMode("drawing");
      setDragStart(coords);
      setCurrentDrag(coords);
    },
    [canvasRef, areas, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !dragMode || !dragStart) return;

      const coords = getCanvasCoordinates(e, canvas);
      setCurrentDrag(coords);

      if (
        dragMode === "moving" &&
        selectedAreaIndex !== null &&
        originalBounds
      ) {
        // Calculate offset
        const dx = (coords.x - dragStart.x) / scale;
        const dy = (coords.y - dragStart.y) / scale;

        // Calculate new position
        let newX = Math.round(originalBounds.x + dx);
        let newY = Math.round(originalBounds.y + dy);

        // Constrain to image boundaries
        newX = Math.max(0, Math.min(imageSize.width - originalBounds.width, newX));
        newY = Math.max(0, Math.min(imageSize.height - originalBounds.height, newY));

        const newAreas = [...areas];
        newAreas[selectedAreaIndex] = {
          ...newAreas[selectedAreaIndex],
          x: newX,
          y: newY,
        };
        onAreasChange(newAreas);
      } else if (
        dragMode === "resizing" &&
        selectedAreaIndex !== null &&
        originalBounds &&
        resizeHandle
      ) {
        // Calculate new bounds based on resize handle
        const dx = (coords.x - dragStart.x) / scale;
        const dy = (coords.y - dragStart.y) / scale;

        let newBounds = { ...originalBounds };

        switch (resizeHandle) {
          case "nw":
            newBounds.x = originalBounds.x + dx;
            newBounds.y = originalBounds.y + dy;
            newBounds.width = originalBounds.width - dx;
            newBounds.height = originalBounds.height - dy;
            break;
          case "ne":
            newBounds.y = originalBounds.y + dy;
            newBounds.width = originalBounds.width + dx;
            newBounds.height = originalBounds.height - dy;
            break;
          case "sw":
            newBounds.x = originalBounds.x + dx;
            newBounds.width = originalBounds.width - dx;
            newBounds.height = originalBounds.height + dy;
            break;
          case "se":
            newBounds.width = originalBounds.width + dx;
            newBounds.height = originalBounds.height + dy;
            break;
          case "n":
            newBounds.y = originalBounds.y + dy;
            newBounds.height = originalBounds.height - dy;
            break;
          case "s":
            newBounds.height = originalBounds.height + dy;
            break;
          case "w":
            newBounds.x = originalBounds.x + dx;
            newBounds.width = originalBounds.width - dx;
            break;
          case "e":
            newBounds.width = originalBounds.width + dx;
            break;
        }

        // Ensure minimum size
        if (newBounds.width < MIN_AREA_SIZE) {
          newBounds.width = MIN_AREA_SIZE;
          if (resizeHandle.includes("w")) {
            newBounds.x =
              originalBounds.x + originalBounds.width - MIN_AREA_SIZE;
          }
        }
        if (newBounds.height < MIN_AREA_SIZE) {
          newBounds.height = MIN_AREA_SIZE;
          if (resizeHandle.includes("n")) {
            newBounds.y =
              originalBounds.y + originalBounds.height - MIN_AREA_SIZE;
          }
        }

        // Constrain to image boundaries
        newBounds.x = Math.max(0, Math.min(imageSize.width - newBounds.width, newBounds.x));
        newBounds.y = Math.max(0, Math.min(imageSize.height - newBounds.height, newBounds.y));

        // Round values
        newBounds = {
          x: Math.round(newBounds.x),
          y: Math.round(newBounds.y),
          width: Math.round(newBounds.width),
          height: Math.round(newBounds.height),
        };

        const newAreas = [...areas];
        newAreas[selectedAreaIndex] = {
          ...newAreas[selectedAreaIndex],
          ...newBounds,
        };
        onAreasChange(newAreas);
      }
    },
    [
      dragMode,
      dragStart,
      canvasRef,
      scale,
      selectedAreaIndex,
      originalBounds,
      resizeHandle,
      areas,
      onAreasChange,
      imageSize,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragMode || !dragStart || !canvasRef.current) return;

      if (dragMode === "drawing") {
        const coords = getCanvasCoordinates(e, canvasRef.current);
        const bounds = calculateImagemapRectangle(
          dragStart,
          coords,
          scale,
          imageSize
        );

        // Only add area if it has meaningful size
        if (bounds.width >= MIN_AREA_SIZE && bounds.height >= MIN_AREA_SIZE) {
          const newArea: ImagemapArea = {
            ...bounds,
            action: {
              type: "uri",
              linkUri: "https://example.com",
            },
          };
          onAreasChange([...areas, newArea]);
          setSelectedAreaIndex(areas.length);
        }
      }

      // Reset drag state
      setDragMode(null);
      setDragStart(null);
      setCurrentDrag(null);
      setResizeHandle(null);
      setOriginalBounds(null);
    },
    [dragMode, dragStart, canvasRef, scale, areas, onAreasChange, imageSize]
  );

  const handleMouseLeave = useCallback(() => {
    if (dragMode) {
      setDragMode(null);
      setDragStart(null);
      setCurrentDrag(null);
      setResizeHandle(null);
      setOriginalBounds(null);
    }
  }, [dragMode]);

  const handleDeleteArea = useCallback(
    (index: number) => {
      onAreasChange(areas.filter((_, i) => i !== index));
      if (selectedAreaIndex === index) {
        setSelectedAreaIndex(null);
      } else if (selectedAreaIndex !== null && selectedAreaIndex > index) {
        setSelectedAreaIndex(selectedAreaIndex - 1);
      }
    },
    [areas, selectedAreaIndex, onAreasChange]
  );

  const handleUpdateArea = useCallback(
    (index: number, updates: Partial<ImagemapArea>) => {
      const newAreas = [...areas];
      newAreas[index] = { ...newAreas[index], ...updates };
      onAreasChange(newAreas);
    },
    [areas, onAreasChange]
  );

  return {
    selectedAreaIndex,
    setSelectedAreaIndex,
    isDrawing: dragMode === "drawing",
    drawStart: dragMode === "drawing" ? dragStart : null,
    currentDraw: dragMode === "drawing" ? currentDrag : null,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDeleteArea,
    handleUpdateArea,
  };
}
