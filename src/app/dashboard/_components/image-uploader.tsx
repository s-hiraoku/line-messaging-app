'use client';

import { useRef, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  placeholder?: string;
}

interface UploadError {
  message: string;
  type: 'validation' | 'upload';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 1024;

export function ImageUploader({
  onImageUploaded,
  placeholder = '画像ファイルをドラッグ&ドロップ、貼り付け（Cmd/Ctrl+V）、または選択してください'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file before upload
   */
  const validateFile = async (file: File): Promise<UploadError | null> => {
    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        message: 'JPEG または PNG 形式の画像ファイルを選択してください',
        type: 'validation'
      };
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        message: `ファイルサイズは ${MAX_FILE_SIZE / 1024 / 1024}MB 以下にしてください（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`,
        type: 'validation'
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
            type: 'validation'
          });
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          message: '画像ファイルの読み込みに失敗しました',
          type: 'validation'
        });
      };

      img.src = objectUrl;
    });
  };

  /**
   * Upload file to Cloudinary
   */
  const uploadFile = async (file: File): Promise<void> => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadedUrl(null);

    try {
      // Validate file
      const validationError = await validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Simulate progress for UX (real progress requires XMLHttpRequest)
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
      formData.set('file', file);

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

      // Reset success state after 3 seconds
      setTimeout(() => {
        setUploadedUrl(null);
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'アップロードに失敗しました',
        type: 'upload'
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
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
      void uploadFile(file);
    }
  };

  /**
   * Handle paste event
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const file = e.clipboardData.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  /**
   * Open file picker
   */
  const handleClick = () => {
    inputRef.current?.click();
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        className={`
          relative border-2 border-dashed p-6 text-center transition-all
          ${isDragging
            ? 'border-[#00B900] bg-[#00B900]/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            : 'border-black bg-white'
          }
          ${uploading ? 'cursor-wait' : 'cursor-pointer'}
        `}
        onClick={uploading ? undefined : handleClick}
        role="button"
        aria-label="画像をアップロード"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploadedUrl ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-12 w-12 text-[#00B900]" />
            <p className="text-sm font-bold uppercase tracking-wider text-[#00B900]">
              アップロード完了
            </p>
          </div>
        ) : uploading ? (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-[#00B900] animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-wider text-black">
                アップロード中... {uploadProgress}%
              </p>
              <div className="mx-auto h-3 w-48 border-2 border-black bg-white">
                <div
                  className="h-full bg-[#00B900] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-black" />
            <div className="space-y-1">
              <p className="text-sm text-black">{placeholder}</p>
              <button
                type="button"
                className="inline-flex items-center border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                ファイルを選択
              </button>
            </div>
            <p className="text-xs font-mono text-black/60">
              JPEG/PNG形式、{MAX_FILE_SIZE / 1024 / 1024}MB以下、{MIN_DIMENSION}x{MIN_DIMENSION}px以上
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 border-2 border-red-600 bg-red-50 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">
              {error.type === 'validation' ? '検証エラー' : 'アップロードエラー'}
            </p>
            <p className="text-sm text-red-600/80 mt-0.5">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="flex-shrink-0 border-2 border-red-600 bg-white p-1 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-red-600 transition-all"
            aria-label="エラーを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
