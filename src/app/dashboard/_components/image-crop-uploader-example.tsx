'use client';

import { useState } from 'react';
import { ImageCropUploader } from './image-crop-uploader';
import Image from 'next/image';

/**
 * Example usage page for ImageCropUploader component
 *
 * Demonstrates different usage patterns and configurations
 */
export function ImageCropUploaderExample() {
  const [basicUrl, setBasicUrl] = useState<string>('');
  const [squareUrl, setSquareUrl] = useState<string>('');
  const [landscapeUrl, setLandscapeUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [zoomShrinkUrl, setZoomShrinkUrl] = useState<string>('');
  const [zoomExtendedUrl, setZoomExtendedUrl] = useState<string>('');
  const [zoomInitialUrl, setZoomInitialUrl] = useState<string>('');
  const [zoomStepUrl, setZoomStepUrl] = useState<string>('');

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">ImageCropUploader Examples</h1>
        <p className="mt-2 text-sm text-slate-400">
          画像クロップアップローダーの使用例
        </p>
      </div>

      {/* Example 1: Basic Usage */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">1. 基本的な使い方</h2>
          <p className="mt-1 text-sm text-slate-400">
            デフォルト設定で使用（自由なアスペクト比）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
/>`}
          </pre>
        </div>

        <ImageCropUploader onImageUploaded={setBasicUrl} />

        {basicUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={basicUrl}
              alt="Uploaded image"
              width={200}
              height={200}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{basicUrl}</p>
          </div>
        )}
      </div>

      {/* Example 2: Fixed Square Crop */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">2. 正方形固定クロップ</h2>
          <p className="mt-1 text-sm text-slate-400">
            アスペクト比を1:1に固定（アイコン、プロフィール画像など）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="SQUARE"
  allowAspectRatioChange={false}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setSquareUrl}
          defaultAspectRatio="SQUARE"
          allowAspectRatioChange={false}
        />

        {squareUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={squareUrl}
              alt="Uploaded image"
              width={200}
              height={200}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{squareUrl}</p>
          </div>
        )}
      </div>

      {/* Example 3: Landscape with Custom Min Dimensions */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">3. 横長クロップ（カスタム最小サイズ）</h2>
          <p className="mt-1 text-sm text-slate-400">
            アスペクト比16:9、最小サイズ480x270px（バナー、リッチメッセージなど）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="LANDSCAPE"
  minCroppedWidth={480}
  minCroppedHeight={270}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setLandscapeUrl}
          defaultAspectRatio="LANDSCAPE"
          minCroppedWidth={480}
          minCroppedHeight={270}
        />

        {landscapeUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={landscapeUrl}
              alt="Uploaded image"
              width={320}
              height={180}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{landscapeUrl}</p>
          </div>
        )}
      </div>

      {/* Example 4: Custom Aspect Ratio */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">4. カスタムアスペクト比</h2>
          <p className="mt-1 text-sm text-slate-400">
            4:3のアスペクト比（写真、プレゼンテーションなど）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio={4/3}
/>`}
          </pre>
        </div>

        <ImageCropUploader onImageUploaded={setCustomUrl} defaultAspectRatio={4 / 3} />

        {customUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={customUrl}
              alt="Uploaded image"
              width={320}
              height={240}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{customUrl}</p>
          </div>
        )}
      </div>

      {/* Example 5: Zoom with Shrinking Enabled */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">5. ズーム縮小対応</h2>
          <p className="mt-1 text-sm text-slate-400">
            minZoomを1未満に設定することで、画像を縮小できます（0.5倍〜3倍）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="SQUARE"
  minZoom={0.5}
  maxZoom={3}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setZoomShrinkUrl}
          defaultAspectRatio="SQUARE"
          minZoom={0.5}
          maxZoom={3}
        />

        {zoomShrinkUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={zoomShrinkUrl}
              alt="Uploaded image"
              width={200}
              height={200}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{zoomShrinkUrl}</p>
          </div>
        )}
      </div>

      {/* Example 6: Extended Zoom Range */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">6. 拡張ズーム範囲</h2>
          <p className="mt-1 text-sm text-slate-400">
            maxZoomを大きくすることで、より大きく拡大できます（1倍〜5倍）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="LANDSCAPE"
  minZoom={1}
  maxZoom={5}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setZoomExtendedUrl}
          defaultAspectRatio="LANDSCAPE"
          minZoom={1}
          maxZoom={5}
        />

        {zoomExtendedUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={zoomExtendedUrl}
              alt="Uploaded image"
              width={320}
              height={180}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{zoomExtendedUrl}</p>
          </div>
        )}
      </div>

      {/* Example 7: Custom Initial Zoom */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">7. カスタム初期ズーム</h2>
          <p className="mt-1 text-sm text-slate-400">
            defaultZoomで初期ズームレベルを設定できます（1.5倍で開始）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="SQUARE"
  defaultZoom={1.5}
  minZoom={0.8}
  maxZoom={3}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setZoomInitialUrl}
          defaultAspectRatio="SQUARE"
          defaultZoom={1.5}
          minZoom={0.8}
          maxZoom={3}
        />

        {zoomInitialUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={zoomInitialUrl}
              alt="Uploaded image"
              width={200}
              height={200}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{zoomInitialUrl}</p>
          </div>
        )}
      </div>

      {/* Example 8: Custom Zoom Step */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">8. カスタムズームステップ</h2>
          <p className="mt-1 text-sm text-slate-400">
            zoomStepで細かいズーム調整が可能です（0.05刻み）
          </p>
        </div>

        <div className="rounded-md bg-slate-900 p-4">
          <pre className="text-xs text-slate-300">
            {`<ImageCropUploader
  onImageUploaded={(url) => setImageUrl(url)}
  defaultAspectRatio="PORTRAIT"
  minZoom={1}
  maxZoom={2}
  zoomStep={0.05}
/>`}
          </pre>
        </div>

        <ImageCropUploader
          onImageUploaded={setZoomStepUrl}
          defaultAspectRatio="PORTRAIT"
          minZoom={1}
          maxZoom={2}
          zoomStep={0.05}
        />

        {zoomStepUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">アップロード済み:</p>
            <Image
              src={zoomStepUrl}
              alt="Uploaded image"
              width={180}
              height={320}
              className="rounded-lg border border-slate-600"
            />
            <p className="break-all text-xs text-slate-500">{zoomStepUrl}</p>
          </div>
        )}
      </div>

      {/* Props Documentation */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-300">
                <th className="pb-2">Prop</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Default</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">onImageUploaded</td>
                <td className="py-2 text-xs">(url: string) =&gt; void</td>
                <td className="py-2 text-xs">-</td>
                <td className="py-2 text-xs">アップロード完了時のコールバック</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">defaultAspectRatio</td>
                <td className="py-2 text-xs">AspectRatioPreset | number</td>
                <td className="py-2 text-xs">'FREE'</td>
                <td className="py-2 text-xs">デフォルトのアスペクト比</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">minCroppedWidth</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">240</td>
                <td className="py-2 text-xs">クロップ後の最小幅（px）</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">minCroppedHeight</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">240</td>
                <td className="py-2 text-xs">クロップ後の最小高さ（px）</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">placeholder</td>
                <td className="py-2 text-xs">string</td>
                <td className="py-2 text-xs">-</td>
                <td className="py-2 text-xs">プレースホルダーテキスト</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">minZoom</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">0.8</td>
                <td className="py-2 text-xs">最小ズーム倍率（1未満で縮小可能）</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">maxZoom</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">2</td>
                <td className="py-2 text-xs">最大ズーム倍率</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">defaultZoom</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">1</td>
                <td className="py-2 text-xs">初期ズーム倍率</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 font-mono text-xs">zoomStep</td>
                <td className="py-2 text-xs">number</td>
                <td className="py-2 text-xs">0.1</td>
                <td className="py-2 text-xs">ズームスライダーのステップ値</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white">Aspect Ratio Presets</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="font-mono text-sm text-slate-300">'FREE'</p>
            <p className="text-xs text-slate-400">自由なアスペクト比（制約なし）</p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm text-slate-300">'SQUARE'</p>
            <p className="text-xs text-slate-400">正方形（1:1）</p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm text-slate-300">'LANDSCAPE'</p>
            <p className="text-xs text-slate-400">横長（16:9）</p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm text-slate-300">'PORTRAIT'</p>
            <p className="text-xs text-slate-400">縦長（9:16）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
