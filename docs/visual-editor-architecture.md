# VisualEditor アーキテクチャドキュメント

## 概要

VisualEditorは、LINEリッチメニューのタップ領域を視覚的に設定するためのインタラクティブなキャンバスエディタです。このドキュメントでは、VisualEditorの実装アーキテクチャ、各コンポーネントの役割、および内部の動作メカニズムについて詳しく説明します。

## アーキテクチャ概要

VisualEditorは以下の主要コンポーネントとレイヤーで構成されています：

```
┌─────────────────────────────────────────────────────────┐
│                    VisualEditor                          │
│  (メインコンポーネント・オーケストレーター)                │
└──────────────┬─────────────────────────┬────────────────┘
               │                         │
       ┌───────▼────────┐       ┌───────▼────────┐
       │ RichMenuCanvas │       │   AreaList     │
       │ (キャンバス描画) │       │ (エリア一覧)   │
       └───────┬────────┘       └────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌──────▼───────┐
│   Hooks    │    │    Utils     │
└────────────┘    └──────────────┘
    │                     │
    ├─ useCanvasScale    ├─ canvasCoordinates
    ├─ useAreaSelection  ├─ canvasDrawing
    └─ useCanvasDrawing  │
                         └─ Types & Constants
```

## コアコンポーネント

### 1. VisualEditor (src/components/richmenu/VisualEditor.tsx)

#### 責務
- リッチメニュー編集UIの最上位コンポーネント
- 画像の読み込みと管理
- 各種フックの統合
- キーボードショートカットのハンドリング

#### Props
```typescript
interface VisualEditorProps {
  imageUrl: string;              // リッチメニュー画像のURL
  size: RichMenuSizeType;        // 'full' | 'half'
  areas: TapArea[];              // タップ領域の配列
  onAreasChange: (areas: TapArea[]) => void;  // 領域変更のコールバック
}
```

#### 主要な機能

##### 画像読み込み
`src/components/richmenu/VisualEditor.tsx:46-62`

```typescript
useEffect(() => {
  if (!imageUrl) {
    setImage(null);
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => setImage(img);
  img.onerror = () => {
    console.error("Failed to load image:", imageUrl);
    setImage(null);
  };
  img.src = imageUrl;
}, [imageUrl]);
```

- CORSに対応した画像読み込み
- エラーハンドリング
- imageUrlが空の場合はプレースホルダーを表示

##### キーボードショートカット
`src/components/richmenu/VisualEditor.tsx:65-76`

- **Escapeキー**: 選択中のエリアを削除
- グローバルイベントリスナーとして実装
- クリーンアップ処理を含む

#### 使用フック
- `useCanvasScale`: レスポンシブなキャンバスサイズの計算
- `useAreaSelection`: エリアの選択・編集・操作の状態管理

### 2. RichMenuCanvas (src/components/richmenu/RichMenuCanvas.tsx)

#### 責務
- HTML5 Canvasを使用した描画
- マウスイベントのハンドリング
- カーソルスタイルの動的変更
- リサイズハンドルの表示と操作

#### Props
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

#### リサイズハンドル
`src/components/richmenu/RichMenuCanvas.tsx:25-55`

8方向のリサイズハンドルをサポート：
- **コーナー**: `nw`, `ne`, `sw`, `se`
- **エッジ**: `n`, `s`, `e`, `w`

```typescript
type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;
const HANDLE_SIZE = 20; // ピクセル単位の閾値
```

#### カーソルスタイル
`src/components/richmenu/RichMenuCanvas.tsx:57-75`

状況に応じた動的カーソル変更：
- **リサイズハンドル上**: 方向に応じたリサイズカーソル (`nw-resize`, `n-resize`, など)
- **エリア内**: `move` (移動可能)
- **エリア上 (選択されていない)**: `pointer` (クリック可能)
- **空白エリア**: `crosshair` (描画モード)

### 3. AreaList (src/components/richmenu/AreaList.tsx)

#### 責務
- タップ領域のリスト表示
- 各エリアの選択・削除・更新インターフェース
- 空状態の表示

#### 主要機能
- 各エリアを `AreaItem` コンポーネントとしてレンダリング
- エリアがない場合、プレースホルダーメッセージを表示
- 選択状態の視覚的フィードバック

## カスタムフック

### 1. useCanvasScale (src/hooks/useCanvasScale.ts)

#### 目的
コンテナの幅に基づいてキャンバスのスケール係数を計算し、レスポンシブなキャンバス表示を実現します。

#### 動作
```typescript
const scale = Math.min(containerWidth / richMenuSize.width, 1);
```

- コンテナ幅がリッチメニュー幅より小さい場合はスケールダウン
- それ以外の場合は1:1のスケール（最大1）
- ウィンドウリサイズイベントに対応

#### 返り値
- `scale: number` - 現在のスケール係数（0 < scale ≤ 1）

### 2. useAreaSelection (src/hooks/useAreaSelection.ts)

#### 目的
タップ領域の選択、描画、移動、リサイズなどのすべてのインタラクション状態を管理します。

#### 状態管理
```typescript
const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
const [dragMode, setDragMode] = useState<DragMode | null>(null);
const [dragStart, setDragStart] = useState<Point | null>(null);
const [currentDrag, setCurrentDrag] = useState<Point | null>(null);
const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
const [originalBounds, setOriginalBounds] = useState<TapArea["bounds"] | null>(null);
```

#### ドラッグモード
```typescript
type DragMode = "drawing" | "moving" | "resizing";
```

- **drawing**: 新規エリアを描画中
- **moving**: 既存エリアを移動中
- **resizing**: 既存エリアをリサイズ中

#### 主要なイベントハンドラ

##### handleMouseDown
`src/hooks/useAreaSelection.ts:62-99`

1. クリック位置が既存エリア内かチェック
2. エリア内の場合：
   - リサイズハンドル上かチェック
   - ハンドル上なら `resizing` モード
   - それ以外なら `moving` モード
3. エリア外の場合：
   - 新規エリアの `drawing` モード開始

##### handleMouseMove
`src/hooks/useAreaSelection.ts:101-199`

**移動モード** (`moving`):
```typescript
const dx = (coords.x - dragStart.x) / scale;
const dy = (coords.y - dragStart.y) / scale;
newBounds = {
  ...originalBounds,
  x: Math.round(originalBounds.x + dx),
  y: Math.round(originalBounds.y + dy),
};
```

**リサイズモード** (`resizing`):
- 各ハンドルに応じた座標計算
- 最小サイズ（`MIN_AREA_SIZE = 10`）の保証
- 座標の整数化（ピクセル精度）

リサイズロジックの例（南東ハンドル）:
```typescript
case "se":
  newBounds.width = originalBounds.width + dx;
  newBounds.height = originalBounds.height + dy;
  break;
```

##### handleMouseUp
`src/hooks/useAreaSelection.ts:201-231`

- **描画モード**: 最小サイズを満たす場合のみ新規エリアを作成
- デフォルトアクションは `{ type: "uri", uri: "https://example.com" }`
- ドラッグ状態のクリーンアップ

#### 返り値
```typescript
{
  selectedAreaIndex: number | null;
  setSelectedAreaIndex: (index: number) => void;
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

### 3. useCanvasDrawing (src/hooks/useCanvasDrawing.ts)

#### 目的
Canvas 2D APIを使用して、リッチメニュー画像、タップ領域、描画プレビューを描画します。

#### 描画シーケンス
`src/hooks/useCanvasDrawing.ts:28-85`

1. **キャンバスサイズ設定**
   ```typescript
   canvas.width = richMenuSize.width * scale;
   canvas.height = richMenuSize.height * scale;
   ```

2. **背景描画**
   - 画像がある場合: 画像を描画
   - 画像がない場合: プレースホルダー（グリッド + テキスト）

3. **グリッドパターン** (画像なしの場合)
   ```typescript
   const gridSize = 50 * scale;
   // 垂直線と水平線を描画
   ```

4. **既存エリアの描画**
   ```typescript
   areas.forEach((area, index) => {
     const isSelected = index === selectedAreaIndex;
     drawArea(ctx, area, scale, index, isSelected);
   });
   ```

5. **描画プレビュー** (描画中の場合)
   ```typescript
   if (isDrawing && drawStart && currentDraw) {
     drawDrawingPreview(ctx, drawStart, currentDraw);
   }
   ```

#### 依存配列
すべての描画関連の変数を監視し、変更時に再描画：
```typescript
[canvasRef, image, areas, selectedAreaIndex, isDrawing, drawStart, currentDraw, scale, richMenuSize]
```

## ユーティリティ関数

### canvasCoordinates (src/utils/canvasCoordinates.ts)

#### getCanvasCoordinates
```typescript
function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point
```

マウスイベントからキャンバス内の相対座標を計算します。
- `getBoundingClientRect()` でキャンバスの位置を取得
- クライアント座標から相対座標に変換

#### isPointInArea
```typescript
function isPointInArea(point: Point, area: TapArea, scale: number): boolean
```

点がエリア内に存在するかを判定します。
- スケールを考慮した座標変換
- 矩形の境界チェック

#### calculateRectangle
```typescript
function calculateRectangle(start: Point, end: Point, scale: number)
```

2点から矩形を計算します。
- 開始点と終了点から正規化された矩形を生成
- スケールを逆適用して実座標系に変換
- 座標を整数化

#### normalizeRectangle
```typescript
function normalizeRectangle(start: Point, end: Point)
```

2点から正規化された矩形を作成します（左上が原点）。
- ドラッグ方向に関わらず一貫した矩形を生成

### canvasDrawing (src/utils/canvasDrawing.ts)

#### drawImage
```typescript
function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
)
```

リッチメニュー画像をキャンバスに描画します。

#### drawArea
```typescript
function drawArea(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  scale: number,
  colorIndex: number,
  isSelected: boolean
)
```

タップ領域を描画します。

**描画要素**:
1. **塗りつぶし**: `AREA_COLORS[colorIndex % 6]` から色を選択
2. **ボーダー**: 選択状態に応じて色と幅を変更
   - 選択時: 青色 (`#3b82f6`)、3px
   - 非選択時: 白色 (`#ffffff`)、2px
3. **リサイズハンドル** (選択時のみ):
   - 8個の白色正方形（8x8px）
   - 青色のボーダー

#### drawAreaLabel
```typescript
function drawAreaLabel(
  ctx: CanvasRenderingContext2D,
  area: TapArea,
  index: number,
  scale: number
)
```

エリアにラベルテキストを描画します（現在は未使用）。

#### drawDrawingPreview
```typescript
function drawDrawingPreview(
  ctx: CanvasRenderingContext2D,
  drawStart: Point,
  currentDraw: Point
)
```

描画中のプレビュー領域を表示します。
- 半透明の青色（`rgba(59, 130, 246, 0.3)`）
- 青色のボーダー

## 型定義とインターフェース

### 型定義 (src/types/richmenu.ts)

#### TapArea
```typescript
interface TapArea {
  bounds: {
    x: number;          // 左上のX座標
    y: number;          // 左上のY座標
    width: number;      // 幅
    height: number;     // 高さ
  };
  action: {
    type: "uri" | "message" | "postback";
    label?: string;     // アクションラベル
    uri?: string;       // URIアクションの場合のURL
    text?: string;      // メッセージアクションの場合のテキスト
    data?: string;      // ポストバックアクションの場合のデータ
  };
}
```

#### RichMenuSize
```typescript
interface RichMenuSize {
  width: number;   // ピクセル単位の幅
  height: number;  // ピクセル単位の高さ
}
```

#### RichMenuSizeType
```typescript
type RichMenuSizeType = "full" | "half";
```

#### Point
```typescript
interface Point {
  x: number;
  y: number;
}
```

### 定数 (src/constants/richmenu.ts)

#### RICHMENU_SIZES
```typescript
const RICHMENU_SIZES: Record<RichMenuSizeType, RichMenuSize> = {
  full: { width: 2500, height: 1686 },  // LINEの標準フルサイズ
  half: { width: 2500, height: 843 },   // LINEの標準ハーフサイズ
};
```

#### AREA_COLORS
```typescript
const AREA_COLORS = [
  "rgba(59, 130, 246, 0.3)",   // blue
  "rgba(239, 68, 68, 0.3)",    // red
  "rgba(34, 197, 94, 0.3)",    // green
  "rgba(234, 179, 8, 0.3)",    // yellow
  "rgba(168, 85, 247, 0.3)",   // purple
  "rgba(236, 72, 153, 0.3)",   // pink
];
```

最大6つのエリアまで異なる色で表示されます。

#### その他の定数
```typescript
const MIN_AREA_SIZE = 10;                          // 最小エリアサイズ（ピクセル）
const HANDLE_SIZE = 20;                            // リサイズハンドル検出領域
const LABEL_FONT_SIZE = 20;                        // ラベルフォントサイズ
const SELECTED_BORDER_WIDTH = 3;                   // 選択時ボーダー幅
const DEFAULT_BORDER_WIDTH = 2;                    // デフォルトボーダー幅
const SELECTED_BORDER_COLOR = "#3b82f6";           // 選択時ボーダー色（青）
const DEFAULT_BORDER_COLOR = "#ffffff";            // デフォルトボーダー色（白）
const DRAWING_PREVIEW_COLOR = "rgba(59, 130, 246, 0.3)"; // 描画プレビュー色
```

## データフロー

### 1. エリア作成フロー

```
User Action: マウスドラッグ
    ↓
handleMouseDown (空白エリア)
    ↓ dragMode = "drawing"
handleMouseMove
    ↓ currentDraw更新
useCanvasDrawing
    ↓ 描画プレビュー表示
handleMouseUp
    ↓ 最小サイズチェック
onAreasChange (新規エリア追加)
    ↓
Parent Component (状態更新)
    ↓
VisualEditor再レンダリング
    ↓
useCanvasDrawing (エリア描画)
```

### 2. エリア移動フロー

```
User Action: エリア内でドラッグ
    ↓
handleMouseDown (エリア内)
    ↓ dragMode = "moving"
    ↓ originalBounds保存
handleMouseMove
    ↓ オフセット計算 (dx, dy)
    ↓ 新座標 = originalBounds + offset
onAreasChange (リアルタイム更新)
    ↓
useCanvasDrawing (再描画)
    ↓
handleMouseUp (確定)
```

### 3. エリアリサイズフロー

```
User Action: ハンドルをドラッグ
    ↓
handleMouseDown (ハンドル上)
    ↓ dragMode = "resizing"
    ↓ resizeHandle設定 (e.g., "se")
    ↓ originalBounds保存
handleMouseMove
    ↓ ハンドル種別に応じた座標計算
    ↓ 最小サイズ制約適用
onAreasChange (リアルタイム更新)
    ↓
useCanvasDrawing (再描画)
    ↓
handleMouseUp (確定)
```

## レスポンシブ対応

### スケーリングメカニズム

すべての座標計算とレンダリングは、`scale` パラメータを考慮して行われます：

#### 座標変換の公式

**キャンバス座標 → 実座標**:
```typescript
const realX = canvasX / scale;
const realY = canvasY / scale;
```

**実座標 → キャンバス座標**:
```typescript
const canvasX = realX * scale;
const canvasY = realY * scale;
```

#### スケール計算
```typescript
const scale = Math.min(containerWidth / richMenuSize.width, 1);
```

- デスクトップ: scale ≈ 1（1:1表示）
- タブレット: scale ≈ 0.5-0.8
- モバイル: scale ≈ 0.2-0.4

### レスポンシブ考慮事項

1. **リサイズハンドルサイズ**: スケールに関わらず一定のピクセルサイズ（20px）
2. **最小エリアサイズ**: 実座標系で10px（キャンバス上では `10 * scale`）
3. **フォントサイズ**: スケールに応じて調整 (`LABEL_FONT_SIZE * scale`)
4. **グリッドサイズ**: スケールに応じて調整 (`50 * scale`)

## パフォーマンス最適化

### 1. useEffect依存配列の最適化

各フックは必要な依存のみを監視：
```typescript
// useCanvasDrawing
[canvasRef, image, areas, selectedAreaIndex, isDrawing, drawStart, currentDraw, scale, richMenuSize]
```

### 2. useCallback による関数メモ化

頻繁に呼び出されるイベントハンドラをメモ化：
```typescript
const handleMouseDown = useCallback(/* ... */, [canvasRef, areas, scale]);
const handleMouseMove = useCallback(/* ... */, [/* 依存配列 */]);
```

### 3. Canvas再描画の最適化

- 状態が変更された場合のみ再描画
- 描画処理を純粋関数として分離
- コンテキスト設定の最小化

### 4. 画像読み込みの最適化

- `crossOrigin = "anonymous"` でCORS対応
- エラーハンドリングとフォールバック
- 不要な再読み込みを防ぐ依存配列設定

## エラーハンドリング

### 1. 画像読み込みエラー
```typescript
img.onerror = () => {
  console.error("Failed to load image:", imageUrl);
  setImage(null);  // プレースホルダー表示にフォールバック
};
```

### 2. Canvas取得エラー
```typescript
const canvas = canvasRef.current;
if (!canvas) return;  // 早期リターン

const ctx = canvas.getContext("2d");
if (!ctx) return;  // 早期リターン
```

### 3. 最小サイズ制約
```typescript
if (bounds.width > MIN_AREA_SIZE && bounds.height > MIN_AREA_SIZE) {
  // エリアを作成
}
```

## 拡張ポイント

### 1. 新しいアクションタイプの追加

`src/types/richmenu.ts` の `action.type` に新しい型を追加：
```typescript
type: "uri" | "message" | "postback" | "datetimepicker" | "camera";
```

### 2. カスタムカーソルの追加

`src/components/richmenu/RichMenuCanvas.tsx` の `getCursorStyle` 関数を拡張：
```typescript
function getCursorStyle(handle: ResizeHandle, isOverArea: boolean, isDragging: boolean): string {
  // カスタムロジック
}
```

### 3. スナップ機能の追加

`src/hooks/useAreaSelection.ts` の `handleMouseMove` に追加：
```typescript
const snapToGrid = (value: number, gridSize: number) => {
  return Math.round(value / gridSize) * gridSize;
};
```

### 4. 複数選択機能

`useAreaSelection` に `selectedAreaIndices: number[]` を追加し、Shift/Ctrlキーのハンドリングを実装。

### 5. undo/redo機能

履歴管理用のカスタムフック `useHistory` を作成：
```typescript
const { state, setState, undo, redo, canUndo, canRedo } = useHistory(initialAreas);
```

## テスト戦略

### 単体テスト

#### ユーティリティ関数
- `getCanvasCoordinates`: 座標変換の正確性
- `isPointInArea`: 境界条件のテスト
- `calculateRectangle`: 正規化と丸めのテスト

#### カスタムフック
- `useCanvasScale`: 異なるコンテナサイズでのスケール計算
- `useAreaSelection`: 各ドラッグモードの状態遷移

### 統合テスト

#### VisualEditor
- 新規エリアの作成
- エリアの移動
- エリアのリサイズ
- エリアの削除
- キーボードショートカット

### E2Eテスト

- ユーザーフローのシミュレーション
- 画像読み込みからエリア作成までの一連の操作

## トラブルシューティング

### 問題: キャンバスがぼやける

**原因**: デバイスピクセル比（devicePixelRatio）を考慮していない

**解決策**: キャンバスサイズに `window.devicePixelRatio` を乗算
```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = richMenuSize.width * scale * dpr;
canvas.height = richMenuSize.height * scale * dpr;
ctx.scale(dpr, dpr);
```

### 問題: リサイズハンドルが反応しない

**原因**: `HANDLE_SIZE` が小さすぎる、またはスケールが考慮されていない

**解決策**: ハンドルサイズを調整、またはタッチデバイス用に閾値を増やす
```typescript
const threshold = isTouchDevice ? HANDLE_SIZE * 1.5 : HANDLE_SIZE;
```

### 問題: 移動時にエリアがちらつく

**原因**: 頻繁な状態更新による再レンダリング

**解決策**: `requestAnimationFrame` でスロットリング
```typescript
useEffect(() => {
  let rafId: number;
  const draw = () => {
    // 描画処理
    rafId = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(rafId);
}, [dependencies]);
```

## ベストプラクティス

1. **座標系の一貫性**: 常に実座標系とキャンバス座標系を明確に区別
2. **イミュータブルな状態更新**: 配列や オブジェクトは常に新しいインスタンスを作成
3. **早期リターン**: null チェックは関数の最初で行う
4. **型安全性**: TypeScript の型を最大限に活用
5. **関数の単一責任**: 各関数は1つの明確な責務のみを持つ
6. **コメントの適切な使用**: 複雑なロジックには説明を追加

## 参考資料

- [LINE Messaging API - Rich Menu](https://developers.line.biz/ja/reference/messaging-api/#rich-menu)
- [MDN - Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [React - useEffect](https://react.dev/reference/react/useEffect)
- [React - useCallback](https://react.dev/reference/react/useCallback)

## まとめ

VisualEditorは、Canvas APIを活用したインタラクティブなリッチメニューエディタです。コンポーネント分離、カスタムフック、ユーティリティ関数の適切な設計により、保守性と拡張性の高いアーキテクチャを実現しています。

主な特徴：
- レスポンシブデザイン（スケーリング対応）
- リアルタイムプレビュー
- 直感的な操作（ドラッグ、リサイズ、移動）
- 型安全な実装
- パフォーマンス最適化

このドキュメントを参照することで、開発者は VisualEditor の内部動作を理解し、機能の追加やカスタマイズを効率的に行うことができます。
