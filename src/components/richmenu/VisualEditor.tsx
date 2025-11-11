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

export function VisualEditor({ imageUrl, size, areas, onAreasChange }: VisualEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const richMenuSize = RICHMENU_SIZES[size];

  // Load image
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      updateScale();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update scale when container size changes
  useEffect(() => {
    const handleResize = () => updateScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateScale = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const newScale = Math.min(containerWidth / richMenuSize.width, 1);
    setScale(newScale);
  };

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

      // Draw label
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.fillText(
        `Area ${index + 1}`,
        area.bounds.x * scale + 5,
        area.bounds.y * scale + 20 * scale
      );
    });

    // Draw current drawing area
    if (isDrawing && drawStart && currentDraw) {
      const x = Math.min(drawStart.x, currentDraw.x);
      const y = Math.min(drawStart.y, currentDraw.y);
      const width = Math.abs(currentDraw.x - drawStart.x);
      const height = Math.abs(currentDraw.y - drawStart.y);

      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  }, [image, areas, selectedAreaIndex, isDrawing, drawStart, currentDraw, scale, richMenuSize]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    // Check if clicking on existing area
    const clickedIndex = areas.findIndex((area) => {
      const x = area.bounds.x * scale;
      const y = area.bounds.y * scale;
      const w = area.bounds.width * scale;
      const h = area.bounds.height * scale;
      return coords.x >= x && coords.x <= x + w && coords.y >= y && coords.y <= y + h;
    });

    if (clickedIndex !== -1) {
      setSelectedAreaIndex(clickedIndex);
      return;
    }

    // Start drawing new area
    setSelectedAreaIndex(null);
    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentDraw(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setCurrentDraw(getCanvasCoordinates(e));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;

    const coords = getCanvasCoordinates(e);
    const x = Math.min(drawStart.x, coords.x) / scale;
    const y = Math.min(drawStart.y, coords.y) / scale;
    const width = Math.abs(coords.x - drawStart.x) / scale;
    const height = Math.abs(coords.y - drawStart.y) / scale;

    // Only add area if it has meaningful size
    if (width > 10 && height > 10) {
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

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
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
        <div className="text-xs text-slate-500">
          画像上をドラッグして領域を作成、クリックして選択
        </div>
      </div>

      <div ref={containerRef} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (isDrawing) {
              setIsDrawing(false);
              setDrawStart(null);
              setCurrentDraw(null);
            }
          }}
          className="w-full cursor-crosshair rounded border border-slate-600"
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
            <p className="text-sm text-slate-400">画像上をドラッグしてタップ領域を作成</p>
          </div>
        )}
      </div>
    </div>
  );
}
