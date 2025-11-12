import { useState, useCallback, RefObject } from "react";
import type { TapArea, Point } from "@/types/richmenu";
import { getCanvasCoordinates, isPointInArea, calculateRectangle } from "@/utils/canvasCoordinates";
import { MIN_AREA_SIZE } from "@/constants/richmenu";

interface UseAreaSelectionProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  areas: TapArea[];
  onAreasChange: (areas: TapArea[]) => void;
  scale: number;
}

type DragMode = "drawing" | "moving" | "resizing";
type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

const HANDLE_SIZE = 20; // Size of resize handles in pixels

function getResizeHandle(
  point: Point,
  area: TapArea,
  scale: number
): ResizeHandle {
  const x = area.bounds.x * scale;
  const y = area.bounds.y * scale;
  const w = area.bounds.width * scale;
  const h = area.bounds.height * scale;
  const threshold = HANDLE_SIZE;

  const nearLeft = Math.abs(point.x - x) < threshold;
  const nearRight = Math.abs(point.x - (x + w)) < threshold;
  const nearTop = Math.abs(point.y - y) < threshold;
  const nearBottom = Math.abs(point.y - (y + h)) < threshold;

  // Corners (priority)
  if (nearLeft && nearTop) return "nw";
  if (nearRight && nearTop) return "ne";
  if (nearLeft && nearBottom) return "sw";
  if (nearRight && nearBottom) return "se";

  // Edges
  if (nearTop && point.x >= x && point.x <= x + w) return "n";
  if (nearBottom && point.x >= x && point.x <= x + w) return "s";
  if (nearLeft && point.y >= y && point.y <= y + h) return "w";
  if (nearRight && point.y >= y && point.y <= y + h) return "e";

  return null;
}

export function useAreaSelection({
  canvasRef,
  areas,
  onAreasChange,
  scale,
}: UseAreaSelectionProps) {
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentDrag, setCurrentDrag] = useState<Point | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [originalBounds, setOriginalBounds] = useState<TapArea["bounds"] | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const coords = getCanvasCoordinates(e, canvas);

      // Check if clicking on existing area
      const clickedIndex = areas.findIndex((area) => isPointInArea(coords, area, scale));

      if (clickedIndex !== -1) {
        const area = areas[clickedIndex];
        const handle = getResizeHandle(coords, area, scale);

        setSelectedAreaIndex(clickedIndex);
        setDragStart(coords);
        setCurrentDrag(coords);
        setOriginalBounds({ ...area.bounds });

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

      if (dragMode === "moving" && selectedAreaIndex !== null && originalBounds) {
        // Calculate offset
        const dx = (coords.x - dragStart.x) / scale;
        const dy = (coords.y - dragStart.y) / scale;

        const newAreas = [...areas];
        newAreas[selectedAreaIndex] = {
          ...newAreas[selectedAreaIndex],
          bounds: {
            ...originalBounds,
            x: Math.round(originalBounds.x + dx),
            y: Math.round(originalBounds.y + dy),
          },
        };
        onAreasChange(newAreas);
      } else if (dragMode === "resizing" && selectedAreaIndex !== null && originalBounds && resizeHandle) {
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
            newBounds.x = originalBounds.x + originalBounds.width - MIN_AREA_SIZE;
          }
        }
        if (newBounds.height < MIN_AREA_SIZE) {
          newBounds.height = MIN_AREA_SIZE;
          if (resizeHandle.includes("n")) {
            newBounds.y = originalBounds.y + originalBounds.height - MIN_AREA_SIZE;
          }
        }

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
          bounds: newBounds,
        };
        onAreasChange(newAreas);
      }
    },
    [dragMode, dragStart, canvasRef, scale, selectedAreaIndex, originalBounds, resizeHandle, areas, onAreasChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragMode || !dragStart || !canvasRef.current) return;

      if (dragMode === "drawing") {
        const coords = getCanvasCoordinates(e, canvasRef.current);
        const bounds = calculateRectangle(dragStart, coords, scale);

        // Only add area if it has meaningful size
        if (bounds.width > MIN_AREA_SIZE && bounds.height > MIN_AREA_SIZE) {
          const newArea: TapArea = {
            bounds,
            action: {
              type: "uri",
              uri: "https://example.com",
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
    [dragMode, dragStart, canvasRef, scale, areas, onAreasChange]
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
    (index: number, updates: Partial<TapArea>) => {
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
