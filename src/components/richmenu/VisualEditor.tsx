"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Edit2, Plus, Copy, XCircle } from "lucide-react";

interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback" | "datetimepicker" | "camera" | "cameraRoll" | "location" | "richmenuswitch";
    label?: string;
    // URI action
    uri?: string;
    // Message action
    text?: string;
    // Postback action
    data?: string;
    displayText?: string;
    // Datetimepicker action
    mode?: "date" | "time" | "datetime";
    initial?: string;
    max?: string;
    min?: string;
    // Richmenu switch action
    richMenuAliasId?: string;
  };
}

interface VisualEditorProps {
  imageUrl: string;
  size: "full" | "half";
  areas: TapArea[];
  onAreasChange: (areas: TapArea[]) => void;
}

const RICHMENU_SIZES = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
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

  const handleDuplicateArea = (index: number) => {
    const areaToDuplicate = areas[index];
    const newArea = {
      ...areaToDuplicate,
      bounds: {
        ...areaToDuplicate.bounds,
        x: Math.min(areaToDuplicate.bounds.x + 50, richMenuSize.width - areaToDuplicate.bounds.width),
        y: Math.min(areaToDuplicate.bounds.y + 50, richMenuSize.height - areaToDuplicate.bounds.height),
      },
    };
    onAreasChange([...areas, newArea]);
    setSelectedAreaIndex(areas.length);
  };

  const handleClearAllAreas = () => {
    if (confirm("全てのタップエリアをクリアしますか？")) {
      onAreasChange([]);
      setSelectedAreaIndex(null);
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
          <span className="ml-2 text-xs text-slate-500">({areas.length}/20)</span>
        </label>
        <div className="flex items-center gap-2">
          {areas.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllAreas}
              className="inline-flex items-center gap-1 rounded-md border border-red-600/50 bg-red-600/10 px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-600/20"
            >
              <XCircle className="h-3 w-3" />
              全てクリア
            </button>
          )}
          <div className="text-xs text-slate-500">
            画像上をドラッグして領域を作成
          </div>
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
                    onChange={(e) => {
                      const type = e.target.value as TapArea["action"]["type"];
                      const baseAction: TapArea["action"] = { type };

                      if (type === "uri") {
                        baseAction.uri = "https://example.com";
                      } else if (type === "message") {
                        baseAction.text = "メッセージ";
                      } else if (type === "postback") {
                        baseAction.data = "action=example";
                      } else if (type === "datetimepicker") {
                        baseAction.data = "action=datetime";
                        baseAction.mode = "datetime";
                      } else if (type === "richmenuswitch") {
                        baseAction.richMenuAliasId = "";
                        baseAction.data = "richmenu_switch";
                      }

                      handleUpdateArea(index, { action: baseAction });
                    }}
                    className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                    <option value="postback">ポストバック</option>
                    <option value="datetimepicker">日時選択</option>
                    <option value="camera">カメラ</option>
                    <option value="cameraRoll">カメラロール</option>
                    <option value="location">位置情報</option>
                    <option value="richmenuswitch">リッチメニュー切り替え</option>
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
                    <>
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
                      <input
                        type="text"
                        value={area.action.displayText || ""}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, displayText: e.target.value },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                        placeholder="表示テキスト（オプション）"
                      />
                    </>
                  )}

                  {area.action.type === "datetimepicker" && (
                    <>
                      <select
                        value={area.action.mode || "datetime"}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, mode: e.target.value as "date" | "time" | "datetime" },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white"
                      >
                        <option value="date">日付</option>
                        <option value="time">時刻</option>
                        <option value="datetime">日時</option>
                      </select>
                      <input
                        type="text"
                        value={area.action.data || ""}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, data: e.target.value },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                        placeholder="データ（action=datetime）"
                        required
                      />
                      <input
                        type="text"
                        value={area.action.initial || ""}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, initial: e.target.value },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                        placeholder="初期値（例: 2024-01-01 または 10:00）"
                      />
                    </>
                  )}

                  {(area.action.type === "camera" || area.action.type === "cameraRoll" || area.action.type === "location") && (
                    <div className="rounded bg-slate-800/60 px-3 py-2 text-xs text-slate-400">
                      <p>このアクションは追加設定不要です。ユーザーがタップすると{" "}
                        {area.action.type === "camera" && "カメラが起動"}
                        {area.action.type === "cameraRoll" && "カメラロールが開き"}
                        {area.action.type === "location" && "位置情報送信"}
                        します。
                      </p>
                    </div>
                  )}

                  {area.action.type === "richmenuswitch" && (
                    <>
                      <input
                        type="text"
                        value={area.action.richMenuAliasId || ""}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, richMenuAliasId: e.target.value },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                        placeholder="切り替え先のリッチメニューエイリアス"
                        required
                      />
                      <input
                        type="text"
                        value={area.action.data || ""}
                        onChange={(e) =>
                          handleUpdateArea(index, {
                            action: { ...area.action, data: e.target.value },
                          })
                        }
                        className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                        placeholder="データ（オプション）"
                      />
                    </>
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
                  onClick={() => handleDuplicateArea(index)}
                  className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                  title="複製"
                  disabled={areas.length >= 20}
                >
                  <Copy className="h-4 w-4" />
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
