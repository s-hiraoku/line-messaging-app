'use client';

import { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getCroppedImg } from '@/lib/crop-utils';

/**
 * Aspect ratio presets for common use cases
 */
type AspectRatioPreset = 'FREE' | 'SQUARE' | 'LANDSCAPE' | 'PORTRAIT';

/**
 * Custom aspect ratio definition
 */
interface CustomAspectRatio {
  label: string;
  value: number;
}

/**
 * Props for ImageCropUploader component
 */
export interface ImageCropUploaderProps {
  /** Callback fired when image is successfully uploaded */
  onImageUploaded: (url: string) => void;

  /** Default aspect ratio (default: 'FREE') */
  defaultAspectRatio?: AspectRatioPreset | number;

  /** Available aspect ratio options for the selector
   * If not provided, defaults to all presets: FREE, SQUARE, LANDSCAPE, PORTRAIT
   * Can be a mix of presets and custom ratios
   */
  aspectRatioOptions?: Array<AspectRatioPreset | CustomAspectRatio>;

  /** Allow aspect ratio selection in UI (default: true)
   * If false, only the defaultAspectRatio is used (no selector shown)
   */
  allowAspectRatioChange?: boolean;

  /** Minimum dimensions after crop (default: 240x240) */
  minCroppedWidth?: number;
  minCroppedHeight?: number;

  /** Zoom control settings */
  /** Minimum zoom level (default: 0.8, can be < 1 for shrinking) */
  minZoom?: number;
  /** Maximum zoom level (default: 2) */
  maxZoom?: number;
  /** Initial zoom level (default: 1) */
  defaultZoom?: number;
  /** Zoom step for slider (default: 0.01) */
  zoomStep?: number;

  /** Custom placeholder text */
  placeholder?: string;
}

interface UploadError {
  message: string;
  type: 'validation' | 'crop' | 'upload';
}

// Constants
const ASPECT_RATIOS: Record<AspectRatioPreset, number> = {
  FREE: 0,
  SQUARE: 1,
  LANDSCAPE: 16 / 9,
  PORTRAIT: 9 / 16,
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 1024;
const DEFAULT_MIN_CROPPED_DIMENSION = 240;

/**
 * Image Crop Uploader Component
 *
 * Allows users to select, crop, zoom, and upload images to Cloudinary.
 * Features:
 * - Drag & drop, file picker, and paste support
 * - Interactive crop editor with zoom (0.8x-2x)
 * - Configurable aspect ratios via props
 * - Client-side cropping using Canvas API
 * - Upload to existing Cloudinary endpoint
 *
 * @example
 * ```tsx
 * // Fixed square crop
 * <ImageCropUploader
 *   onImageUploaded={(url) => setImageUrl(url)}
 *   defaultAspectRatio="SQUARE"
 *   allowAspectRatioChange={false}
 * />
 * ```
 */
export function ImageCropUploader({
  onImageUploaded,
  defaultAspectRatio = 'FREE',
  minCroppedWidth = DEFAULT_MIN_CROPPED_DIMENSION,
  minCroppedHeight = DEFAULT_MIN_CROPPED_DIMENSION,
  minZoom = 0.8,
  maxZoom = 2,
  defaultZoom = 1,
  zoomStep = 0.01,
  placeholder = '画像ファイルをドラッグ&ドロップ、貼り付け（Cmd/Ctrl+V）、または選択してください',
}: ImageCropUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(defaultZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate aspect ratio from prop
  const aspectRatio =
    typeof defaultAspectRatio === 'number'
      ? defaultAspectRatio
      : ASPECT_RATIOS[defaultAspectRatio];

  /**
   * Validate file before loading
   */
  const validateFile = async (file: File): Promise<UploadError | null> => {
    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        message: 'JPEG または PNG 形式の画像ファイルを選択してください',
        type: 'validation',
      };
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        message: `ファイルサイズは ${MAX_FILE_SIZE / 1024 / 1024}MB 以下にしてください（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`,
        type: 'validation',
      };
    }

    // Image dimension validation
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          resolve({
            message: `画像のサイズは ${MIN_DIMENSION}x${MIN_DIMENSION}px 以上にしてください（現在: ${img.width}x${img.height}px）`,
            type: 'validation',
          });
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          message: '画像ファイルの読み込みに失敗しました',
          type: 'validation',
        });
      };

      img.src = objectUrl;
    });
  };

  /**
   * Load file and open crop editor
   */
  const loadFile = async (file: File): Promise<void> => {
    setError(null);
    setUploadedUrl(null);

    // Validate file
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Load image into crop editor
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile(file);
      setImageSrc(reader.result as string);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(defaultZoom);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void loadFile(file);
    }
    // Reset input to allow uploading the same file again
    e.target.value = '';
  };

  /**
   * Handle drag events
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void loadFile(file);
    }
  };

  /**
   * Handle paste event
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const file = e.clipboardData.files?.[0];
    if (file) {
      void loadFile(file);
    }
  };

  /**
   * Open file picker
   */
  const handleClick = () => {
    inputRef.current?.click();
  };

  /**
   * Handle crop complete callback from react-easy-crop
   */
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  /**
   * Check if cropped area meets minimum dimensions
   */
  const isCropValid = (): boolean => {
    if (!croppedAreaPixels) return false;
    return (
      croppedAreaPixels.width >= minCroppedWidth &&
      croppedAreaPixels.height >= minCroppedHeight
    );
  };

  /**
   * Execute crop and upload
   */
  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Determine output format from original file type
      const outputFormat = selectedFile.type as 'image/jpeg' | 'image/png';

      // Execute crop
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        outputFormat
      );

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Cloudinary
      const formData = new FormData();
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '') + '-cropped';
      const extension = outputFormat === 'image/jpeg' ? '.jpg' : '.png';
      formData.set('file', croppedBlob, filename + extension);

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'アップロードAPIが正しく応答していません。Cloudinary環境変数（CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET）が.envに設定されているか確認してください。'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'アップロードに失敗しました');
      }

      setUploadProgress(100);
      setUploadedUrl(data.secure_url);
      onImageUploaded(data.secure_url);

      // Reset state after success
      setTimeout(() => {
        setIsCropping(false);
        setImageSrc(null);
        setSelectedFile(null);
        setUploadedUrl(null);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'アップロードに失敗しました',
        type: err instanceof Error && err.message.includes('切り取り')
          ? 'crop'
          : 'upload',
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Cancel crop and return to file selection
   */
  const handleCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(defaultZoom);
    setCroppedAreaPixels(null);
    setError(null);
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Handle ESC key to close modal
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isCropping) {
      handleCancel();
    }
  };

  return (
    <div className="space-y-2" onKeyDown={handleKeyDown}>
      {/* File Drop Zone */}
      {!isCropping && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          className={`
            relative rounded-2xl p-6 text-center transition-all duration-300
            ${isDragging
              ? 'bg-[#00B900]/10 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]'
              : 'bg-[#e8f5e9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]'
            }
            ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
          `}
          onClick={isUploading ? undefined : handleClick}
          role="button"
          aria-label="画像をアップロード"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {uploadedUrl ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-12 w-12 text-[#00B900]" />
              <p className="text-sm font-bold uppercase tracking-wider text-[#00B900]">アップロード完了</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto h-12 w-12 text-gray-700" />
              <div className="space-y-1">
                <p className="text-sm text-gray-700">{placeholder}</p>
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  ファイルを選択
                </button>
              </div>
              <p className="text-xs font-mono text-gray-700/60">
                JPEG/PNG形式、{MAX_FILE_SIZE / 1024 / 1024}MB以下、{MIN_DIMENSION}x{MIN_DIMENSION}
                px以上
              </p>
            </div>
          )}
        </div>
      )}

      {/* Crop Editor Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_16px_48px_rgba(0,0,0,0.15)] lg:max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 p-4 bg-white">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">画像クロップ</h2>
              <button
                onClick={handleCancel}
                className="rounded-xl bg-white p-1 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 text-gray-700"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-96 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                aspect={aspectRatio || undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
                cropShape="rect"
                showGrid={true}
                restrictPosition={false}
                style={{
                  containerStyle: {
                    backgroundColor: '#000000',
                  },
                }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 bg-[#e8f5e9]">
              {/* Zoom Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="zoom" className="text-sm font-bold uppercase tracking-wider text-gray-800">
                    ズーム
                  </label>
                  <span className="text-sm font-mono text-gray-800">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  id="zoom"
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={zoomStep}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-white rounded-xl appearance-none cursor-pointer accent-[#00B900] hover:accent-[#00B900]/80 transition-all duration-300"
                />
              </div>

              {/* Validation Warning */}
              {!isCropValid() && croppedAreaPixels && (
                <div className="rounded-xl bg-[#FFE500]/10 p-3 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                  <p className="text-sm font-bold text-gray-800">
                    切り取り後のサイズが小さすぎます。ズームまたは切り取り範囲を調整してください。
                    （最小: {minCroppedWidth}x{minCroppedHeight}px）
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-200 p-4 bg-white">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCrop}
                disabled={isUploading || !isCropValid()}
                className="rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? `アップロード中... ${uploadProgress}%` : '切り取る'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">
              {error.type === 'validation' ? '検証エラー' : error.type === 'crop' ? 'クロップエラー' : 'アップロードエラー'}
            </p>
            <p className="mt-0.5 text-sm text-red-600/80">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="flex-shrink-0 rounded-xl bg-white p-1 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] text-red-600 transition-all duration-300 hover:-translate-y-0.5"
            aria-label="エラーを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
