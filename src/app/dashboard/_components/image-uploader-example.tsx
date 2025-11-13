'use client';

import { useState } from 'react';
import { ImageUploader } from './image-uploader';

/**
 * Example usage of ImageUploader component
 * This file demonstrates how to integrate the ImageUploader into your forms
 */
export function ImageUploaderExample() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleImageUploaded = (url: string) => {
    setUploadedImageUrl(url);
    console.log('Image uploaded successfully:', url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">ImageUploader Component Example</h2>
        <p className="text-sm text-slate-400">
          This component supports file selection, drag & drop, and clipboard paste (Cmd/Ctrl+V)
        </p>
      </div>

      <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-6">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Upload Image</h3>

        <ImageUploader
          onImageUploaded={handleImageUploaded}
          placeholder="カスタムプレースホルダーの例"
        />
      </div>

      {uploadedImageUrl && (
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-medium text-slate-200">Upload Result</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Uploaded URL:</label>
            <input
              type="text"
              value={uploadedImageUrl}
              readOnly
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Preview:</label>
            <div className="rounded-md border border-slate-700 bg-slate-900 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="max-w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-2">
        <h4 className="text-sm font-medium text-slate-300">Component Features:</h4>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>File selection via button or click on drop area</li>
          <li>Drag & drop support with visual feedback</li>
          <li>Clipboard paste support (Cmd/Ctrl+V)</li>
          <li>File type validation (JPEG/PNG only)</li>
          <li>File size validation (10MB limit)</li>
          <li>Image dimension validation (1024x1024px minimum)</li>
          <li>Upload progress indicator</li>
          <li>Success and error state handling</li>
          <li>Dark theme styling with Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}
