# VisualEditor 設計書

## 概要

VisualEditorは、LINEリッチメニューのタップ領域を視覚的に設定するためのインタラクティブなキャンバスエディタです。ユーザーはドラッグ&ドロップでタップ領域を作成・編集でき、リアルタイムでプレビューを確認できます。

### 主な機能

- リッチメニュー画像上にタップ領域を視覚的に配置
- ドラッグ&ドロップによる領域の作成・移動・リサイズ
- レスポンシブ対応（デスクトップ〜モバイル）
- リアルタイムプレビュー
- キーボードショートカット対応

## 技術スタック

### Canvas 2D API を選択した理由

本プロジェクトでは、ビジュアルエディタの実装にHTML5 Canvas 2D APIを採用しました。

#### 選定理由

1. **ピクセル精度の制御**
   - LINEリッチメニューの座標指定は整数ピクセル単位
   - Canvas APIは座標を直接制御でき、正確な領域設定が可能

2. **高いパフォーマンス**
   - ドラッグ操作中のリアルタイム描画が必要
   - Canvas APIはDOM操作より高速で、スムーズな描画が可能

3. **柔軟な描画制御**
   - 複数の半透明領域の重ね合わせ
   - リサイズハンドル、グリッド、ガイドラインなどの動的描画
   - 選択状態に応じた視覚的フィードバック

4. **シンプルな実装**
   - SVGやDOM要素の操作に比べてシンプルなコード
   - 描画ロジックの一元管理が容易

#### 他の選択肢との比較

| 技術 | メリット | デメリット |
|------|----------|------------|
| **Canvas 2D** | 高速、ピクセル精度、シンプル | アクセシビリティ対応に工夫が必要 |
| SVG | ベクター、アクセシビリティ、DOM操作可 | 複雑な操作時のパフォーマンス低下 |
| DOM要素 | 実装が容易、アクセシビリティ | 座標精度、パフォーマンス問題 |
| WebGL | 最高のパフォーマンス | 過剰な複雑さ、学習コスト高 |

### Canvas 2D API の基本的な使い方

#### 基本パターン

```typescript
// 1. Canvasとコンテキストの取得
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) return;

// 2. Canvasサイズの設定
canvas.width = 800;
canvas.height = 600;

// 3. 描画処理
ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // 半透明の青
ctx.fillRect(100, 100, 200, 150); // x, y, width, height

ctx.strokeStyle = '#3b82f6'; // 青色のボーダー
ctx.lineWidth = 2;
ctx.strokeRect(100, 100, 200, 150);
```

#### 画像描画

```typescript
// 画像の読み込み
const img = new Image();
img.crossOrigin = 'anonymous'; // CORS対応
img.onload = () => {
  // 画像を描画
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};
img.src = 'https://example.com/richmenu-image.png';
```

#### マウスイベントの座標取得

```typescript
const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = e.currentTarget;
  const rect = canvas.getBoundingClientRect();

  // キャンバス内の相対座標を取得
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  console.log('Canvas coordinates:', { x, y });
};
```

#### レスポンシブ対応（スケーリング）

```typescript
// 実際のサイズとキャンバス表示サイズが異なる場合
const actualWidth = 2500;  // リッチメニューの実サイズ
const actualHeight = 1686;
const scale = 0.4;  // 表示倍率

// キャンバスサイズを設定
canvas.width = actualWidth * scale;   // 1000px
canvas.height = actualHeight * scale; // 674.4px

// 描画時にスケールを適用
const area = { x: 100, y: 100, width: 200, height: 150 };
ctx.fillRect(
  area.x * scale,
  area.y * scale,
  area.width * scale,
  area.height * scale
);

// マウス座標を実座標に変換
const realX = canvasX / scale;  // 1000 → 2500
const realY = canvasY / scale;
```

### サンプルコード：シンプルなエリアエディタ

```typescript
import { useRef, useEffect, useState } from 'react';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function SimpleEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  // 描画処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 既存エリアを描画
    areas.forEach((area, index) => {
      ctx.fillStyle = `rgba(59, 130, 246, 0.3)`;
      ctx.fillRect(area.x, area.y, area.width, area.height);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(area.x, area.y, area.width, area.height);
    });

    // 描画中のプレビュー
    if (isDrawing && startPoint && currentPoint) {
      const x = Math.min(startPoint.x, currentPoint.x);
      const y = Math.min(startPoint.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(x, y, width, height);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    }
  }, [areas, isDrawing, startPoint, currentPoint]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentPoint) return;

    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    if (width > 10 && height > 10) {
      setAreas([...areas, { x, y, width, height }]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-300"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
```

## アーキテクチャ概要

### システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                    VisualEditor                          │
│  (メインコンポーネント・統合・画像管理)                    │
└──────────────┬─────────────────────────┬────────────────┘
               │                         │
       ┌───────▼────────┐       ┌───────▼────────┐
       │ RichMenuCanvas │       │   AreaList     │
       │ (Canvas描画)    │       │ (エリア一覧)   │
       └───────┬────────┘       └────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌──────▼───────┐
│   Hooks    │    │    Utils     │
└────────────┘    └──────────────┘
```

### ディレクトリ構成

```
src/
├── components/richmenu/
│   ├── VisualEditor.tsx        # メインコンポーネント
│   ├── RichMenuCanvas.tsx      # Canvas描画コンポーネント
│   └── AreaList.tsx            # エリア一覧コンポーネント
│
├── hooks/
│   ├── useCanvasScale.ts       # レスポンシブスケーリング
│   ├── useAreaSelection.ts     # エリア選択・操作ロジック
│   └── useCanvasDrawing.ts     # Canvas描画ロジック
│
├── utils/
│   ├── canvasCoordinates.ts    # 座標計算ユーティリティ
│   └── canvasDrawing.ts        # 描画ユーティリティ
│
├── types/
│   └── richmenu.ts             # 型定義
│
└── constants/
    └── richmenu.ts             # 定数定義
```

## コンポーネント設計

### 1. VisualEditor

**責務**：
- リッチメニュー編集UIの最上位コンポーネント
- 画像の読み込みと管理
- 子コンポーネントとフックの統合
- キーボードショートカットのハンドリング

**Props**：
```typescript
interface VisualEditorProps {
  imageUrl: string;              // リッチメニュー画像のURL
  size: RichMenuSizeType;        // 'full' | 'half'
  areas: TapArea[];              // タップ領域の配列
  onAreasChange: (areas: TapArea[]) => void;  // 領域変更のコールバック
}
```

**主要機能**：
- CORS対応の画像読み込み
- Escapeキーでエリア削除
- エラーハンドリング（画像読み込み失敗時）

### 2. RichMenuCanvas

**責務**：
- HTML5 Canvasを使用した描画処理
- マウスイベントのハンドリング
- カーソルスタイルの動的変更
- リサイズハンドルの表示と操作

**Props**：
```typescript
interface RichMenuCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  richMenuSize: RichMenuSize;
  scale: number;
  areas: TapArea[];
  selectedAreaIndex: number | null;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
}
```

**主要機能**：
- 8方向のリサイズハンドル（nw, ne, sw, se, n, s, e, w）
- 状況に応じたカーソル変更（crosshair, move, pointer, resize）
- レスポンシブなCanvas表示

### 3. AreaList

**責務**：
- タップ領域のリスト表示
- エリアの選択・削除・更新インターフェース
- 空状態の表示

**Props**：
```typescript
interface AreaListProps {
  areas: TapArea[];
  selectedIndex: number | null;
  onSelectArea: (index: number) => void;
  onDeleteArea: (index: number) => void;
  onUpdateArea: (index: number, updates: Partial<TapArea>) => void;
}
```

**主要機能**：
- 各エリアをカード形式で表示
- 選択状態の視覚的フィードバック
- アクション設定の編集UI

## カスタムフック設計

### 1. useCanvasScale

**目的**：コンテナの幅に基づいてキャンバスのスケール係数を計算し、レスポンシブ表示を実現

**シグネチャ**：
```typescript
function useCanvasScale(
  containerRef: RefObject<HTMLDivElement | null>,
  richMenuSize: RichMenuSize
): number
```

**返り値**：
- `scale: number` - スケール係数（0 < scale ≤ 1）

**動作**：
```typescript
scale = Math.min(containerWidth / richMenuSize.width, 1)
```

### 2. useAreaSelection

**目的**：タップ領域の選択、描画、移動、リサイズなどのインタラクション状態を管理

**シグネチャ**：
```typescript
function useAreaSelection(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  areas: TapArea[],
  onAreasChange: (areas: TapArea[]) => void,
  scale: number,
  richMenuSize: RichMenuSize
): {
  selectedAreaIndex: number | null;
  setSelectedAreaIndex: (index: number | null) => void;
  isDrawing: boolean;
  drawStart: Point | null;
  currentDraw: Point | null;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: () => void;
  handleDeleteArea: (index: number) => void;
  handleUpdateArea: (index: number, updates: Partial<TapArea>) => void;
}
```

**管理する状態**：
- `selectedAreaIndex`: 選択中のエリアインデックス
- `dragMode`: 'drawing' | 'moving' | 'resizing' | null
- `dragStart`, `currentDrag`: ドラッグ開始位置と現在位置
- `resizeHandle`: リサイズハンドルの種類
- `originalBounds`: 操作開始時の元の座標

**主要ロジック**：
- **描画モード**: 空白エリアをドラッグして新規エリア作成
- **移動モード**: エリア内をドラッグして位置変更
- **リサイズモード**: ハンドルをドラッグしてサイズ変更

### 3. useCanvasDrawing

**目的**：Canvas 2D APIを使用して、画像、エリア、プレビューを描画

**シグネチャ**：
```typescript
function useCanvasDrawing(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  image: HTMLImageElement | null,
  areas: TapArea[],
  selectedAreaIndex: number | null,
  isDrawing: boolean,
  drawStart: Point | null,
  currentDraw: Point | null,
  scale: number,
  richMenuSize: RichMenuSize
): void
```

**描画シーケンス**：
1. Canvasサイズの設定
2. 背景描画（画像またはプレースホルダー）
3. グリッドパターン（画像がない場合）
4. 既存エリアの描画（色分け + ボーダー）
5. 選択エリアのリサイズハンドル
6. 描画中のプレビュー（半透明）

## ユーティリティ関数

### canvasCoordinates.ts

#### getCanvasCoordinates
```typescript
function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point
```
マウスイベントからキャンバス内の相対座標を計算

#### isPointInArea
```typescript
function isPointInArea(point: Point, area: TapArea, scale: number): boolean
```
点がエリア内に存在するかを判定

#### calculateRectangle
```typescript
function calculateRectangle(start: Point, end: Point, scale: number): TapArea['bounds']
```
2点から矩形を計算（スケール逆変換含む）

#### normalizeRectangle
```typescript
function normalizeRectangle(start: Point, end: Point): { x: number; y: number; width: number; height: number }
```
ドラッグ方向に関わらず正規化された矩形を生成

### canvasDrawing.ts

#### drawImage
```typescript
function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
): void
```
リッチメニュー画像を描画

#### drawArea
```typescript
function drawArea(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  scale: number,
  colorIndex: number,
  isSelected: boolean
): void
```
タップ領域を描画（塗りつぶし、ボーダー、ハンドル）

#### drawDrawingPreview
```typescript
function drawDrawingPreview(
  ctx: CanvasRenderingContext2D,
  drawStart: Point,
  currentDraw: Point
): void
```
描画中のプレビュー領域を表示

## 型定義

### 主要な型

```typescript
// タップ領域
interface TapArea {
  bounds: {
    x: number;          // 左上のX座標（ピクセル）
    y: number;          // 左上のY座標（ピクセル）
    width: number;      // 幅（ピクセル）
    height: number;     // 高さ（ピクセル）
  };
  action: {
    type: 'uri' | 'message' | 'postback';
    label?: string;     // アクションラベル
    uri?: string;       // URIアクションの場合のURL
    text?: string;      // メッセージアクションの場合のテキスト
    data?: string;      // ポストバックアクションの場合のデータ
  };
}

// リッチメニューサイズ
interface RichMenuSize {
  width: number;   // ピクセル単位の幅
  height: number;  // ピクセル単位の高さ
}

type RichMenuSizeType = 'full' | 'half';

// 座標点
interface Point {
  x: number;
  y: number;
}

// ドラッグモード
type DragMode = 'drawing' | 'moving' | 'resizing';

// リサイズハンドル
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;
```

## 定数

```typescript
// リッチメニューサイズ（LINE公式仕様）
const RICHMENU_SIZES: Record<RichMenuSizeType, RichMenuSize> = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
};

// エリアカラー（最大6色をローテーション）
const AREA_COLORS = [
  'rgba(59, 130, 246, 0.3)',   // blue
  'rgba(239, 68, 68, 0.3)',    // red
  'rgba(34, 197, 94, 0.3)',    // green
  'rgba(234, 179, 8, 0.3)',    // yellow
  'rgba(168, 85, 247, 0.3)',   // purple
  'rgba(236, 72, 153, 0.3)',   // pink
];

// 制約値
const MIN_AREA_SIZE = 10;              // 最小エリアサイズ（ピクセル）
const HANDLE_SIZE = 20;                // リサイズハンドル検出領域（ピクセル）
const SELECTED_BORDER_WIDTH = 3;       // 選択時ボーダー幅
const DEFAULT_BORDER_WIDTH = 2;        // デフォルトボーダー幅
const SELECTED_BORDER_COLOR = '#3b82f6';  // 選択時ボーダー色（青）
const DEFAULT_BORDER_COLOR = '#ffffff';   // デフォルトボーダー色（白）
```

## データフロー

### 1. エリア作成フロー

```
ユーザー操作：空白エリアをドラッグ
    ↓
handleMouseDown（空白エリア）
    ↓ dragMode = 'drawing'
    ↓ drawStart, currentDraw を記録
handleMouseMove（ドラッグ中）
    ↓ currentDraw を更新
useCanvasDrawing
    ↓ 描画プレビューを表示
handleMouseUp
    ↓ 最小サイズチェック（10px以上）
    ↓ デフォルトアクション設定
onAreasChange（新規エリア追加）
    ↓
親コンポーネントで状態更新
    ↓
再レンダリング → Canvas再描画
```

### 2. エリア移動フロー

```
ユーザー操作：エリア内をドラッグ
    ↓
handleMouseDown（エリア内）
    ↓ dragMode = 'moving'
    ↓ originalBounds を保存
handleMouseMove（ドラッグ中）
    ↓ オフセット計算（dx, dy）
    ↓ 新座標 = originalBounds + offset
onAreasChange（リアルタイム更新）
    ↓
useCanvasDrawing（再描画）
    ↓
handleMouseUp（確定）
```

### 3. エリアリサイズフロー

```
ユーザー操作：リサイズハンドルをドラッグ
    ↓
handleMouseDown（ハンドル上）
    ↓ dragMode = 'resizing'
    ↓ resizeHandle を設定（例：'se'）
    ↓ originalBounds を保存
handleMouseMove（ドラッグ中）
    ↓ ハンドル種別に応じた座標計算
    ↓ 最小サイズ制約適用（MIN_AREA_SIZE）
onAreasChange（リアルタイム更新）
    ↓
useCanvasDrawing（再描画）
    ↓
handleMouseUp（確定）
```

## レスポンシブ対応

### スケーリングメカニズム

```typescript
// スケール計算
const scale = Math.min(containerWidth / richMenuSize.width, 1);

// キャンバス座標 → 実座標
const realX = canvasX / scale;
const realY = canvasY / scale;

// 実座標 → キャンバス座標
const canvasX = realX * scale;
const canvasY = realY * scale;
```

**デバイス別のスケール例**：
- デスクトップ: scale ≈ 1（1:1表示）
- タブレット: scale ≈ 0.5-0.8
- モバイル: scale ≈ 0.2-0.4

### スケール適用対象

- **Canvasサイズ**: `richMenuSize.width * scale`
- **エリア描画座標**: `area.x * scale`, `area.y * scale`
- **グリッドサイズ**: `50 * scale`
- **フォントサイズ**: `LABEL_FONT_SIZE * scale`

### スケール非適用対象

- **リサイズハンドルサイズ**: 常に20px（視認性確保）
- **ボーダー幅**: 常に2-3px
- **最小エリアサイズ**: 実座標系で10px

## 実装時の考慮事項

### パフォーマンス最適化

1. **useCallback によるメモ化**
   - イベントハンドラを最適化し、不要な再レンダリングを防ぐ

2. **useEffect 依存配列の最適化**
   - 必要な依存のみを監視し、無駄な再描画を削減

3. **Canvas再描画の最適化**
   - 状態変更時のみ再描画
   - 描画処理を純粋関数として分離

### エラーハンドリング

1. **画像読み込みエラー**
   ```typescript
   img.onerror = () => {
     console.error('Failed to load image');
     setImage(null); // プレースホルダー表示
   };
   ```

2. **Canvas取得エラー**
   ```typescript
   const ctx = canvas.getContext('2d');
   if (!ctx) return; // 早期リターン
   ```

3. **最小サイズ制約**
   ```typescript
   if (width > MIN_AREA_SIZE && height > MIN_AREA_SIZE) {
     // エリアを作成
   }
   ```

### アクセシビリティ

- キーボード操作のサポート（Escapeキーでエリア削除）
- フォーカス管理の実装
- スクリーンリーダー対応のARIAラベル追加

### セキュリティ

- CORS対応の画像読み込み（`crossOrigin = "anonymous"`）
- XSS対策（ユーザー入力のサニタイズ）

## 拡張可能性

### 今後追加可能な機能

1. **スナップ機能**
   - グリッドにスナップして配置
   - 他のエリアとの揃え

2. **複数選択機能**
   - Shift/Ctrlキーで複数選択
   - 一括移動・削除

3. **Undo/Redo機能**
   - 履歴管理
   - Ctrl+Z, Ctrl+Y サポート

4. **テンプレート機能**
   - よく使うレイアウトの保存
   - ワンクリックで適用

5. **ガイドライン表示**
   - センターライン
   - マージンガイド

6. **エリアの複製**
   - Ctrl+D で複製
   - ドラッグ&Ctrlで複製

## テスト戦略

### 単体テスト

**ユーティリティ関数**：
- 座標変換の正確性
- 境界条件のテスト
- スケール計算の検証

**カスタムフック**：
- 各ドラッグモードの状態遷移
- スケール計算の正確性

### 統合テスト

**VisualEditor**：
- 新規エリアの作成
- エリアの移動・リサイズ
- エリアの削除
- キーボードショートカット

### E2Eテスト

- ユーザーフローのシミュレーション
- 画像読み込みからエリア作成までの一連の操作

## まとめ

VisualEditorは、Canvas 2D APIを活用したインタラクティブなリッチメニューエディタです。

### 主な特徴

- **高パフォーマンス**: Canvas APIによる高速描画
- **レスポンシブ**: デバイスサイズに応じた自動スケーリング
- **直感的な操作**: ドラッグ&ドロップによる視覚的編集
- **型安全**: TypeScriptによる堅牢な実装
- **拡張可能**: モジュール化された設計

### 実装の進め方

1. **Phase 1**: 基本コンポーネントと型定義
2. **Phase 2**: Canvas描画とマウスイベント
3. **Phase 3**: カスタムフックの実装
4. **Phase 4**: リサイズハンドルと移動機能
5. **Phase 5**: レスポンシブ対応とエラーハンドリング
6. **Phase 6**: テストとドキュメント

## 参考資料

- [LINE Messaging API - Rich Menu](https://developers.line.biz/ja/reference/messaging-api/#rich-menu)
- [MDN - Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [MDN - Canvas Tutorial](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial)
- [React - useEffect](https://react.dev/reference/react/useEffect)
- [React - useCallback](https://react.dev/reference/react/useCallback)
