'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { ImageArea } from './types';
import { useImageAreaCanvasDrawing } from './hooks/use-image-area-canvas-drawing';
import { useImageAreaInteraction } from './hooks/use-image-area-interaction';
import {
  getCanvasCoordinates,
  isPointInImageArea,
  getResizeHandle,
  getCursorStyle,
} from './utils/image-area-canvas-utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Grid3x3, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageSize {
  width: number;
  height: number;
}

interface ImageAreaCanvasProps {
  imageUrl: string | null;
  areas: ImageArea[];
  selectedAreaId: string | null;
  onSelectArea: (id: string | null) => void;
  onUpdateArea: (id: string, updates: Partial<ImageArea>) => void;
  onAddArea: (area: Omit<ImageArea, 'id'>) => void;
}

export function ImageAreaCanvas({
  imageUrl,
  areas,
  selectedAreaId,
  onSelectArea,
  onUpdateArea,
  onAddArea,
}: ImageAreaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 1024, height: 1024 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [cursor, setCursor] = useState('crosshair');

  const gridSize = 20;

  // Load image
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      // Auto-scale to fit container
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // subtract padding
        const optimalScale = Math.min(1, containerWidth / img.naturalWidth);
        setScale(optimalScale);
      }
    };
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      setImage(null);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Interaction hook (must be before drawing hook)
  const interaction = useImageAreaInteraction({
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
  });

  // Drawing hook (must be after interaction hook)
  useImageAreaCanvasDrawing({
    canvasRef,
    image,
    imageSize,
    scale,
    areas,
    selectedAreaId,
    isDrawing: interaction.isDrawing,
    drawStart: interaction.drawStart,
    currentDraw: interaction.currentDraw,
    showGrid,
    gridSize,
  });

  // Update cursor based on hover
  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || interaction.isDrawing) return;

      const coords = getCanvasCoordinates(e, canvas);
      const selectedArea = areas.find((a) => a.id === selectedAreaId);

      // Check if hovering over selected area
      if (selectedArea) {
        const handle = getResizeHandle(coords, selectedArea, scale);
        const isOver = isPointInImageArea(coords, selectedArea, scale);
        setCursor(getCursorStyle(handle, isOver));
        return;
      }

      // Check if hovering over any area
      const hoveredIndex = areas.findIndex((area) =>
        isPointInImageArea(coords, area, scale)
      );
      setCursor(hoveredIndex !== -1 ? 'pointer' : 'crosshair');
    },
    [canvasRef, interaction.isDrawing, selectedAreaId, areas, scale]
  );

  const handleMouseMoveWithCursor = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleHover(e);
      interaction.onMouseMove(e);
    },
    [handleHover, interaction]
  );

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    if (containerRef.current && image) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const optimalScale = Math.min(1, containerWidth / image.naturalWidth);
      setScale(optimalScale);
    } else {
      setScale(1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              showGrid ? 'bg-blue-300' : 'bg-white'
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs border-2 border-black bg-[#FFFEF5]">
            グリッド: {showGrid ? 'ON' : 'OFF'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge
            variant="outline"
            className="cursor-pointer border-2 border-black text-xs"
            onClick={handleResetZoom}
          >
            {Math.round(scale * 100)}%
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="overflow-auto border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        style={{ maxHeight: '600px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={interaction.onMouseDown}
          onMouseMove={handleMouseMoveWithCursor}
          onMouseUp={interaction.onMouseUp}
          onMouseLeave={interaction.onMouseLeave}
          style={{ cursor }}
          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {/* Help Text */}
      <div className="text-xs font-mono text-black/60 space-y-1">
        <p>• クリック&ドラッグで新しい領域を作成</p>
        <p>• 領域をクリックして選択、ドラッグで移動</p>
        <p>• 選択された領域のハンドルでリサイズ</p>
      </div>
    </div>
  );
}
