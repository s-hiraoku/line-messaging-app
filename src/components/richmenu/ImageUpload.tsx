"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";

type RichMenuSize =
  | "2500x1686"
  | "2500x843"
  | "1200x810"
  | "1200x405"
  | "800x540"
  | "800x270";

interface ImageUploadProps {
  size: RichMenuSize;
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUpload({ size, onUploadComplete, currentImageUrl }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedSize = size;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("size", size);

      const response = await fetch("/api/upload/richmenu-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "アップロードに失敗しました");
      }

      setPreviewUrl(data.url);
      onUploadComplete(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold uppercase tracking-wider text-black">
        リッチメニュー画像 <span className="font-mono text-black/60">({expectedSize}px)</span>
      </label>

      {previewUrl ? (
        <div className="relative border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <img
                src={previewUrl}
                alt="Rich menu preview"
                className="w-full h-auto border-2 border-black"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="border-2 border-black bg-red-600 p-2 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="画像を削除"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm font-bold uppercase tracking-wider text-[#00B900]">
            <CheckCircle2 className="w-4 h-4" />
            アップロード完了
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed border-black p-8 text-center transition-all cursor-pointer
            ${isDragging ? "bg-[#FFFEF5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"}
            ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FFFEF5]"}
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-black animate-spin" />
              <p className="text-sm font-mono text-black/60">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-12 h-12 text-black" />
              <p className="text-sm font-bold text-black">
                画像をドラッグ＆ドロップ、またはクリックして選択
              </p>
              <p className="text-xs font-mono text-black/60">
                推奨サイズ: {expectedSize}px (JPG/PNG)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="border-2 border-black bg-red-100 px-4 py-3 text-sm font-mono text-red-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {error}
        </div>
      )}
    </div>
  );
}
