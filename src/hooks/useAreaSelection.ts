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

export function useAreaSelection({
  canvasRef,
  areas,
  onAreasChange,
  scale,
}: UseAreaSelectionProps) {
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [currentDraw, setCurrentDraw] = useState<Point | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const coords = getCanvasCoordinates(e, canvas);

      // Check if clicking on existing area
      const clickedIndex = areas.findIndex((area) => isPointInArea(coords, area, scale));

      if (clickedIndex !== -1) {
        setSelectedAreaIndex(clickedIndex);
        return;
      }

      // Start drawing new area
      setSelectedAreaIndex(null);
      setIsDrawing(true);
      setDrawStart(coords);
      setCurrentDraw(coords);
    },
    [canvasRef, areas, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;
      setCurrentDraw(getCanvasCoordinates(e, canvasRef.current));
    },
    [isDrawing, canvasRef]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !drawStart || !canvasRef.current) return;

      const coords = getCanvasCoordinates(e, canvasRef.current);
      const bounds = calculateRectangle(drawStart, coords, scale);

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

      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
    },
    [isDrawing, drawStart, canvasRef, scale, areas, onAreasChange]
  );

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
    }
  }, [isDrawing]);

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
    isDrawing,
    drawStart,
    currentDraw,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDeleteArea,
    handleUpdateArea,
  };
}
