"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Edit2, Plus } from "lucide-react";

interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback";
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
  };
}

type RichMenuSize =
  | "2500x1686"
  | "2500x843"
  | "1200x810"
  | "1200x405"
  | "800x540"
  | "800x270";

interface VisualEditorProps {
  imageUrl: string;
  size: RichMenuSize;
  areas: TapArea[];
  onAreasChange: (areas: TapArea[]) => void;
}

const RICHMENU_SIZES: Record<RichMenuSize, { width: number; height: number }> = {
  "2500x1686": { width: 2500, height: 1686 },
  "2500x843": { width: 2500, height: 843 },
  "1200x810": { width: 1200, height: 810 },
  "1200x405": { width: 1200, height: 405 },
  "800x540": { width: 800, height: 540 },
  "800x270": { width: 800, height: 270 },
};

const COLORS = [
  "rgba(59, 130, 246, 0.3)", // blue
  "rgba(239, 68, 68, 0.3)", // red
  "rgba(34, 197, 94, 0.3)", // green
  "rgba(234, 179, 8, 0.3)", // yellow
  "rgba(168, 85, 247, 0.3)", // purple
  "rgba(236, 72, 153, 0.3)", // pink
];

type DragMode = 'none' | 'draw' | 'move' | 'resize-n' | 'resize-s' | 'resize-e' | 'resize-w' | 'resize-ne' | 'resize-nw' | 'resize-se' | 'resize-sw';

export function VisualEditor({ imageUrl, size, areas, onAreasChange }: VisualEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number; y: number } | null>(null);
  const [originalBounds, setOriginalBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cursor, setCursor] = useState<string>('crosshair');

  const richMenuSize = RICHMENU_SIZES[size];

  // Initial scale setup
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const newScale = Math.min(containerWidth / richMenuSize.width, 1);
      setScale(newScale);
    }
  }, [richMenuSize.width]);

  // Load image and update scale
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      // Update scale after image loads
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(containerWidth / richMenuSize.width, 1);
        setScale(newScale);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, richMenuSize.width]);

  // Update scale when size changes
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const newScale = Math.min(containerWidth / richMenuSize.width, 1);
      setScale(newScale);
    }
  }, [size, richMenuSize.width]);

  // Update scale when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(containerWidth / richMenuSize.width, 1);
        setScale(newScale);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [richMenuSize.width]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = richMenuSize.width * scale;
    canvas.height = richMenuSize.height * scale;

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw existing areas
    areas.forEach((area, index) => {
      const isSelected = index === selectedAreaIndex;
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fillRect(
        area.bounds.x * scale,
        area.bounds.y * scale,
        area.bounds.width * scale,
        area.bounds.height * scale
      );

      // Draw border
      ctx.strokeStyle = isSelected ? "#3b82f6" : "#ffffff";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(
        area.bounds.x * scale,
        area.bounds.y * scale,
        area.bounds.width * scale,
        area.bounds.height * scale
      );

      // Draw resize handles for selected area
      if (isSelected) {
        const handleSize = 8;
        const x = area.bounds.x * scale;
        const y = area.bounds.y * scale;
        const w = area.bounds.width * scale;
        const h = area.bounds.height * scale;

        ctx.fillStyle = "#3b82f6";
        // Corners
        ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x + w - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x - handleSize / 2, y + h - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x + w - handleSize / 2, y + h - handleSize / 2, handleSize, handleSize);
        // Edges
        ctx.fillRect(x + w / 2 - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x + w / 2 - handleSize / 2, y + h - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x - handleSize / 2, y + h / 2 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(x + w - handleSize / 2, y + h / 2 - handleSize / 2, handleSize, handleSize);
      }

      // Draw label
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.fillText(
        `Area ${index + 1}`,
        area.bounds.x * scale + 5,
        area.bounds.y * scale + 20 * scale
      );
    });

    // Draw current drawing/dragging area
    if (dragMode === 'draw' && dragStart && currentDrag) {
      const x = Math.min(dragStart.x, currentDrag.x);
      const y = Math.min(dragStart.y, currentDrag.y);
      const width = Math.abs(currentDrag.x - dragStart.x);
      const height = Math.abs(currentDrag.y - dragStart.y);

      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  }, [image, areas, selectedAreaIndex, dragMode, dragStart, currentDrag, scale, richMenuSize]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getHitTest = (x: number, y: number, areaIndex: number): DragMode => {
    const area = areas[areaIndex];
    const ax = area.bounds.x * scale;
    const ay = area.bounds.y * scale;
    const aw = area.bounds.width * scale;
    const ah = area.bounds.height * scale;
    const handleSize = 8;
    const threshold = 12;

    // Check corners
    if (Math.abs(x - ax) < threshold && Math.abs(y - ay) < threshold) return 'resize-nw';
    if (Math.abs(x - (ax + aw)) < threshold && Math.abs(y - ay) < threshold) return 'resize-ne';
    if (Math.abs(x - ax) < threshold && Math.abs(y - (ay + ah)) < threshold) return 'resize-sw';
    if (Math.abs(x - (ax + aw)) < threshold && Math.abs(y - (ay + ah)) < threshold) return 'resize-se';

    // Check edges
    if (Math.abs(y - ay) < threshold && x > ax && x < ax + aw) return 'resize-n';
    if (Math.abs(y - (ay + ah)) < threshold && x > ax && x < ax + aw) return 'resize-s';
    if (Math.abs(x - ax) < threshold && y > ay && y < ay + ah) return 'resize-w';
    if (Math.abs(x - (ax + aw)) < threshold && y > ay && y < ay + ah) return 'resize-e';

    // Check inside area for move
    if (x >= ax && x <= ax + aw && y >= ay && y <= ay + ah) return 'move';

    return 'none';
  };

  const getCursorForMode = (mode: DragMode): string => {
    const cursorMap: Record<DragMode, string> = {
      'none': 'crosshair',
      'draw': 'crosshair',
      'move': 'move',
      'resize-n': 'ns-resize',
      'resize-s': 'ns-resize',
      'resize-e': 'ew-resize',
      'resize-w': 'ew-resize',
      'resize-ne': 'nesw-resize',
      'resize-sw': 'nesw-resize',
      'resize-nw': 'nwse-resize',
      'resize-se': 'nwse-resize',
    };
    return cursorMap[mode] || 'crosshair';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (dragMode === 'none') {
      // Update cursor based on hover
      if (selectedAreaIndex !== null) {
        const mode = getHitTest(coords.x, coords.y, selectedAreaIndex);
        setCursor(getCursorForMode(mode));
      } else {
        setCursor('crosshair');
      }
      return;
    }

    if (!dragStart || !originalBounds) return;
    setCurrentDrag(coords);

    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;

    if (selectedAreaIndex === null) return;

    const newAreas = [...areas];
    const area = newAreas[selectedAreaIndex];

    if (dragMode === 'move') {
      area.bounds.x = Math.round(originalBounds.x + dx / scale);
      area.bounds.y = Math.round(originalBounds.y + dy / scale);
    } else if (dragMode.startsWith('resize-')) {
      let newX = originalBounds.x;
      let newY = originalBounds.y;
      let newW = originalBounds.width;
      let newH = originalBounds.height;

      if (dragMode.includes('n')) {
        newY = originalBounds.y + dy / scale;
        newH = originalBounds.height - dy / scale;
      }
      if (dragMode.includes('s')) {
        newH = originalBounds.height + dy / scale;
      }
      if (dragMode.includes('w')) {
        newX = originalBounds.x + dx / scale;
        newW = originalBounds.width - dx / scale;
      }
      if (dragMode.includes('e')) {
        newW = originalBounds.width + dx / scale;
      }

      // Minimum size constraint
      if (newW >= 50 && newH >= 50) {
        area.bounds.x = Math.round(newX);
        area.bounds.y = Math.round(newY);
        area.bounds.width = Math.round(newW);
        area.bounds.height = Math.round(newH);
      }
    }

    onAreasChange(newAreas);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    // Check if clicking on selected area first
    if (selectedAreaIndex !== null) {
      const mode = getHitTest(coords.x, coords.y, selectedAreaIndex);
      if (mode !== 'none') {
        setDragMode(mode);
        setDragStart(coords);
        setCurrentDrag(coords);
        setOriginalBounds({ ...areas[selectedAreaIndex].bounds });
        return;
      }
    }

    // Check if clicking on any area
    for (let i = 0; i < areas.length; i++) {
      const mode = getHitTest(coords.x, coords.y, i);
      if (mode !== 'none') {
        setSelectedAreaIndex(i);
        setDragMode(mode);
        setDragStart(coords);
        setCurrentDrag(coords);
        setOriginalBounds({ ...areas[i].bounds });
        return;
      }
    }

    // Start drawing new area
    setSelectedAreaIndex(null);
    setDragMode('draw');
    setDragStart(coords);
    setCurrentDrag(coords);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMode === 'draw' && dragStart) {
      const coords = getCanvasCoordinates(e);

      // Calculate canvas pixel size (scaled size)
      const canvasWidth = Math.abs(coords.x - dragStart.x);
      const canvasHeight = Math.abs(coords.y - dragStart.y);

      // Only add area if it has meaningful size (at least 30x30 pixels on canvas)
      if (canvasWidth >= 30 && canvasHeight >= 30) {
        // Convert to rich menu coordinates
        const x = Math.min(dragStart.x, coords.x) / scale;
        const y = Math.min(dragStart.y, coords.y) / scale;
        const width = canvasWidth / scale;
        const height = canvasHeight / scale;

        const newArea: TapArea = {
          bounds: {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          },
          action: {
            type: "uri",
            uri: "https://example.com",
          },
        };
        onAreasChange([...areas, newArea]);
        setSelectedAreaIndex(areas.length);
      }
    }

    setDragMode('none');
    setDragStart(null);
    setCurrentDrag(null);
    setOriginalBounds(null);
  };

  const handleDeleteArea = (index: number) => {
    onAreasChange(areas.filter((_, i) => i !== index));
    if (selectedAreaIndex === index) {
      setSelectedAreaIndex(null);
    } else if (selectedAreaIndex !== null && selectedAreaIndex > index) {
      setSelectedAreaIndex(selectedAreaIndex - 1);
    }
  };

  const handleUpdateArea = (index: number, updates: Partial<TapArea>) => {
    const newAreas = [...areas];
    newAreas[index] = { ...newAreas[index], ...updates };
    onAreasChange(newAreas);
  };

  if (!imageUrl) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400">画像をアップロードしてタップ領域を設定してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          タップ領域 <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>ドラッグで新規作成、エリア内をドラッグで移動、境界線をドラッグでリサイズ</span>
          <span className="text-slate-600">
            スケール: {(scale * 100).toFixed(0)}% |
            キャンバス: {Math.round(richMenuSize.width * scale)}×{Math.round(richMenuSize.height * scale)}px
          </span>
        </div>
      </div>

      <div ref={containerRef} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (dragMode !== 'none') {
              setDragMode('none');
              setDragStart(null);
              setCurrentDrag(null);
              setOriginalBounds(null);
            }
          }}
          style={{
            width: `${richMenuSize.width * scale}px`,
            height: `${richMenuSize.height * scale}px`,
            maxWidth: '100%',
            cursor: cursor,
          }}
          className="rounded border border-slate-600"
        />
      </div>

      {/* Area List */}
      <div className="space-y-2">
        {areas.map((area, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 transition-colors ${
              selectedAreaIndex === index
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-700/50 bg-slate-900/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-300">エリア {index + 1}</span>
                  <span className="text-xs text-slate-500">
                    ({area.bounds.x}, {area.bounds.y}) - {area.bounds.width}×{area.bounds.height}
                  </span>
                </div>

                {/* Action Type */}
                <div className="space-y-2">
                  <select
                    value={area.action.type}
                    onChange={(e) =>
                      handleUpdateArea(index, {
                        action: {
                          type: e.target.value as "uri" | "message" | "postback",
                          ...(e.target.value === "uri" && { uri: "https://example.com" }),
                          ...(e.target.value === "message" && { text: "メッセージ" }),
                          ...(e.target.value === "postback" && { data: "action=example" }),
                        },
                      })
                    }
                    className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                    <option value="postback">ポストバック</option>
                  </select>

                  {area.action.type === "uri" && (
                    <input
                      type="url"
                      value={area.action.uri || ""}
                      onChange={(e) =>
                        handleUpdateArea(index, {
                          action: { ...area.action, uri: e.target.value },
                        })
                      }
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                      placeholder="https://example.com"
                      required
                    />
                  )}

                  {area.action.type === "message" && (
                    <input
                      type="text"
                      value={area.action.text || ""}
                      onChange={(e) =>
                        handleUpdateArea(index, {
                          action: { ...area.action, text: e.target.value },
                        })
                      }
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                      placeholder="送信されるテキスト"
                      required
                    />
                  )}

                  {area.action.type === "postback" && (
                    <input
                      type="text"
                      value={area.action.data || ""}
                      onChange={(e) =>
                        handleUpdateArea(index, {
                          action: { ...area.action, data: e.target.value },
                        })
                      }
                      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                      placeholder="action=example&id=123"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAreaIndex(index)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  title="選択"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteArea(index)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {areas.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-900/40 p-8 text-center">
            <Plus className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <p className="text-sm text-slate-400">画像上をドラッグしてタップ領域を作成してください</p>
            <p className="text-xs text-slate-500 mt-2">作成後、エリアをドラッグで移動、境界線をドラッグでサイズ変更できます</p>
          </div>
        )}
      </div>
    </div>
  );
}
