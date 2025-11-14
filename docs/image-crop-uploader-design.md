# ImageCropUploader 設計書

## 概要

ImageCropUploader は、画像のアップロード、クロップ、ズーム調整を一つのモーダル UI で完結させる統合コンポーネントです。ユーザーはドラッグ&ドロップ、ファイル選択、貼り付けで画像を読み込み、インタラクティブにクロップ領域を調整できます。

### 主な機能

- 画像の複数入力方法（ドラッグ&ドロップ、ファイルピッカー、Cmd/Ctrl+V 貼り付け）
- インタラクティブなクロップエディター（ドラッグ&ズーム対応）
- 設定可能なアスペクト比プリセット（FREE, SQUARE, LANDSCAPE, PORTRAIT）
- 柔軟なズーム制御（80%〜200%、カスタマイズ可能）
- クライアントサイドでの Canvas API クロッピング
- クロップ済み画像の Blob 生成（外部 API との統合が容易）
- リアルタイムバリデーション（ファイル形式、サイズ、最小寸法）

## 技術選定

### react-easy-crop

画像クロップ機能の実装に `react-easy-crop` ライブラリを使用します。

**選定理由**：

- タッチ&マウス対応（デスクトップとモバイルの両方）
- 軽量（約 10KB gzipped）
- React 専用設計で useState との統合が容易
- アスペクト比、ズーム範囲のカスタマイズが可能
- ピクセル座標とパーセンテージ座標の両方を提供

### Canvas API

クロップ後の画像生成には、ブラウザ標準の Canvas API を使用します。

**選定理由**：

- クライアントサイド処理（サーバー負荷なし）
- 追加ライブラリ不要
- JPEG/PNG 形式の高品質な出力

## コンポーネント構成

### システム構成図

```
┌─────────────────────────────────────────────────┐
│           ImageCropUploader                      │
│  (統合コンポーネント・状態管理・UI制御)           │
└──────────┬──────────────────────────┬───────────┘
           │                          │
    ┌──────▼────────┐        ┌───────▼────────┐
    │  react-easy-  │        │  crop-utils.ts │
    │     crop      │        │ (Canvas処理)    │
    │ (クロップUI)   │        │ (Blob生成)     │
    └───────────────┘        └────────────────┘
```

### ディレクトリ構成

```
src/
├── app/dashboard/_components/
│   ├── image-crop-uploader.tsx         # メインコンポーネント
│   └── image-crop-uploader-example.tsx # 使用例・ドキュメント
│
└── lib/
    └── crop-utils.ts                   # Canvas APIユーティリティ
```

## Props インターフェース

```typescript
export interface ImageCropUploaderProps {
  /** アップロード完了時のコールバック（画像URLを返す） */
  onImageUploaded: (url: string) => void;

  /** デフォルトアスペクト比 (default: 'FREE') */
  defaultAspectRatio?: AspectRatioPreset | number;

  /** クロップ後の最小寸法 (default: 240x240) */
  minCroppedWidth?: number;
  minCroppedHeight?: number;

  /** 最小ズーム倍率 (default: 0.8 = 80%) */
  minZoom?: number;

  /** 最大ズーム倍率 (default: 2 = 200%) */
  maxZoom?: number;

  /** 初期ズーム倍率 (default: 1 = 100%) */
  defaultZoom?: number;

  /** ズームステップ (default: 0.01 = 1%刻み) */
  zoomStep?: number;

  /** プレースホルダーテキスト */
  placeholder?: string;
}

// アスペクト比プリセット
type AspectRatioPreset = "FREE" | "SQUARE" | "LANDSCAPE" | "PORTRAIT";
```

### アスペクト比の定義

```typescript
const ASPECT_RATIOS: Record<AspectRatioPreset, number> = {
  FREE: 0, // 自由（制約なし）
  SQUARE: 1, // 1:1
  LANDSCAPE: 16 / 9, // 16:9
  PORTRAIT: 9 / 16, // 9:16
};
```

## react-easy-crop の基本的な使い方

### インストール

```bash
npm install react-easy-crop
```

### 基本的な実装パターン

```typescript
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

function ImageCropUploader() {
  // 状態管理
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // クロップ完了時のコールバック
  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  return (
    <Cropper
      image={imageSrc}
      crop={crop}
      zoom={zoom}
      aspect={1} // 1:1のアスペクト比
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={onCropComplete}
      restrictPosition={false} // 中心基点のズーム
    />
  );
}
```

### 重要な Props

| Prop               | 型       | 説明                                    |
| ------------------ | -------- | --------------------------------------- |
| `image`            | string   | 画像の URL（Data URL または HTTP URL）  |
| `crop`             | Point    | クロップ位置 `{ x: number, y: number }` |
| `zoom`             | number   | ズーム倍率                              |
| `aspect`           | number   | アスペクト比（0 で自由）                |
| `restrictPosition` | boolean  | `false`で中心基点のズーム               |
| `onCropChange`     | function | クロップ位置変更時のコールバック        |
| `onZoomChange`     | function | ズーム変更時のコールバック              |
| `onCropComplete`   | function | クロップ完了時のコールバック            |

## Canvas API によるクロッピング

### crop-utils.ts の実装

```typescript
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 画像URLからHTMLImageElementを作成
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) =>
      reject(new Error(`画像の読み込みに失敗しました: ${error}`))
    );
    image.src = url;
  });
}

/**
 * Canvas APIを使用して画像をクロップし、Blobとして返す
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Canvasサイズをクロップ後のサイズに設定
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 元画像からクロップ領域を描画
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // CanvasをBlobに変換
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"));
          return;
        }
        resolve(blob);
      },
      outputFormat,
      0.95 // JPEG品質
    );
  });
}
```

## 主要な状態管理

```typescript
// ファイル関連
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [imageSrc, setImageSrc] = useState<string | null>(null);

// UI状態
const [isCropping, setIsCropping] = useState(false); // モーダル表示
const [isUploading, setIsUploading] = useState(false); // アップロード中

// エラーと結果
const [error, setError] = useState<UploadError | null>(null);
const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

// クロップ関連（react-easy-crop）
const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
const [zoom, setZoom] = useState(defaultZoom);
const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
```

## バリデーション仕様

### ファイルバリデーション

| 項目                   | 制約                                           |
| ---------------------- | ---------------------------------------------- |
| ファイル形式           | JPEG, PNG のみ                                 |
| ファイルサイズ         | 10MB 以下                                      |
| 画像寸法（クロップ前） | 1024x1024px 以上                               |
| クロップ後寸法         | 240x240px 以上（Props 経由でカスタマイズ可能） |

### バリデーション実装

```typescript
const validateFile = async (file: File): Promise<UploadError | null> => {
  // ファイル形式チェック
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return {
      message: "JPEG または PNG 形式を選択してください",
      type: "validation",
    };
  }

  // ファイルサイズチェック
  if (file.size > 10 * 1024 * 1024) {
    return {
      message: "ファイルサイズは10MB以下にしてください",
      type: "validation",
    };
  }

  // 画像寸法チェック（非同期）
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve) => {
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 1024 || img.height < 1024) {
        resolve({
          message: "画像は1024x1024px以上が必要です",
          type: "validation",
        });
      } else {
        resolve(null);
      }
    };
    img.src = objectUrl;
  });
};
```

## データフロー

### 1. 画像読み込みフロー

```
ファイル選択/ドロップ/貼り付け
    ↓
バリデーション（形式・サイズ・寸法）
    ↓
FileReader.readAsDataURL
    ↓
setImageSrc（Data URL設定）
    ↓
setIsCropping(true)（モーダル表示）
    ↓
Cropperコンポーネントで調整
    ↓
onCropComplete → croppedAreaPixels保存
```

### 2. クロップ&アップロードフロー

```
「アップロード」ボタンクリック
    ↓
最小寸法チェック
    ↓
getCroppedImg（Canvas APIでクロップ）
    ↓
Blob生成
    ↓
FormDataで外部APIへPOST
    ↓
画像URL取得
    ↓
onImageUploaded（親コンポーネントへコールバック）
    ↓
モーダルクローズ
```

## UI 構成

### モーダル構造

```
┌─────────────────────────────────────┐
│  画像をクロップ           [×]       │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────┐          │
│     │                   │          │
│     │   Cropper エリア  │          │
│     │  (固定クロップ)   │          │
│     │                   │          │
│     └───────────────────┘          │
│                                     │
│  ズーム: [━━━━●━━━━] 100%        │
│                                     │
│  ⚠ クロップ後のサイズが小さすぎます │
│                                     │
├─────────────────────────────────────┤
│           [キャンセル] [アップロード] │
└─────────────────────────────────────┘
```

### 入力エリア構造

```
┌─────────────────────────────────────┐
│  📁                                 │
│  画像ファイルをドラッグ&ドロップ    │
│  または選択してください              │
│  (Cmd/Ctrl+V で貼り付けも可能)      │
└─────────────────────────────────────┘
```

## 実装の進め方

### Phase 1: 基本構成

1. `crop-utils.ts` を作成

   - `createImage` 関数
   - `getCroppedImg` 関数

2. 基本的な型定義
   - `ImageCropUploaderProps`
   - `AspectRatioPreset`
   - `UploadError`

### Phase 2: ファイル入力

1. ドラッグ&ドロップ実装

   - `onDragEnter`, `onDragLeave`, `onDrop` ハンドラ
   - 視覚的フィードバック（背景色変化）

2. ファイルピッカー

   - `<input type="file">` の非表示化
   - クリックでファイル選択

3. 貼り付け対応

   - `onPaste` ハンドラ
   - クリップボードからの画像取得

4. バリデーション
   - ファイル形式・サイズチェック
   - 画像寸法チェック

### Phase 3: react-easy-crop 統合

1. Cropper コンポーネントの配置

   - モーダル UI 構築
   - Cropper 表示エリア

2. 状態管理

   - `crop`, `zoom`, `croppedAreaPixels`

3. ズームスライダー
   - `<input type="range">`
   - リアルタイムパーセンテージ表示

### Phase 4: Canvas クロッピング

1. `getCroppedImg` の呼び出し
2. Blob → FormData 変換
3. 外部 API へ POST
4. レスポンス処理

### Phase 5: UI/UX 改善

1. エラーハンドリング
2. ローディング表示
3. アクセシビリティ対応
4. レスポンシブ対応

## 使用例

### カードフォームでの統合

```typescript
// card-form-product.tsx
export function ProductForm({ card, onChange }: ProductFormProps) {
  const handleImageUploaded = (url: string) => {
    onChange({ imageUrl: url });
  };

  return (
    <ImageCropUploader
      onImageUploaded={handleImageUploaded}
      defaultAspectRatio="SQUARE"
      placeholder="商品画像をアップロード (JPEG/PNG, 1024x1024px以上)"
    />
  );
}
```

### アスペクト比の選び方

| 用途             | アスペクト比 | 理由                 |
| ---------------- | ------------ | -------------------- |
| 商品画像         | SQUARE       | 正方形が一般的       |
| プロフィール写真 | SQUARE       | SNS と統一           |
| 場所の写真       | LANDSCAPE    | 風景は横長           |
| 自由な用途       | FREE         | ユーザーに選択させる |

## 定数定義

```typescript
// バリデーション制約
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 1024; // クロップ前
const DEFAULT_MIN_CROPPED_DIMENSION = 240; // クロップ後

// ズーム設定
const DEFAULT_MIN_ZOOM = 0.8; // 80%
const DEFAULT_MAX_ZOOM = 2; // 200%
const DEFAULT_ZOOM = 1; // 100%
const DEFAULT_ZOOM_STEP = 0.01; // 1%刻み
```

## 参考資料

- [react-easy-crop - GitHub](https://github.com/valentinh/react-easy-crop)
- [MDN - Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [MDN - File API](https://developer.mozilla.org/ja/docs/Web/API/File)
- [MDN - Drag and Drop API](https://developer.mozilla.org/ja/docs/Web/API/HTML_Drag_and_Drop_API)
