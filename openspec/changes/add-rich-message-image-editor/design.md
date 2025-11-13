# Design: Rich Message Image Editor

## Context

リッチメッセージ（Imagemap Message）は、画像上に複数のタップ可能なエリアを設定できる LINE のメッセージタイプです。現在の実装では、画像URLとエリア座標を手動で入力する必要があり、UXが劣ります。

### Constraints
- 画像サイズ: 1024x1024px 以上（LINE の仕様）
- 座標系: 1040x1040 基準（LINE API の仕様）
- 既存の画像アップロード API: `/api/uploads/image` (Cloudinary)
- 既存のページ: `src/app/dashboard/message-items/rich/page.tsx`

## Goals / Non-Goals

### Goals
1. LINE Manager と同等の画像アップロードとエリア設定 UI
2. 視覚的なエリア編集（ドラッグ&ドロップ）
3. リアルタイムプレビュー
4. 既存のメッセージ送信フローとの統合

### Non-Goals
- 複雑な図形（円形、多角形など）
- 画像編集機能（トリミング、フィルタなど）
- テンプレートライブラリ

## Decisions

### Decision 1: エディタの実装方法

**Option A: div ベースのエディタ**
- Pros: シンプル、CSS で制御しやすい、React との統合が容易
- Cons: 複雑な図形は難しい

**Option B: Canvas ベースのエディタ**
- Pros: 柔軟、高度な描画が可能
- Cons: 実装が複雑、React との統合が難しい

**選択: Option A（div ベースのエディタ）**

理由:
- 矩形エリアのみで十分
- 実装がシンプルで保守しやすい
- CSS アニメーションやホバー効果が簡単

**実装案**:
```tsx
<div className="relative">
  <img src={imageUrl} alt="Rich message" />
  {areas.map((area, index) => (
    <div
      key={index}
      className="absolute border-2 border-blue-500 bg-blue-500/20"
      style={{
        left: `${area.x}px`,
        top: `${area.y}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
      }}
      onClick={() => selectArea(index)}
    >
      {/* Resize handles */}
    </div>
  ))}
</div>
```

### Decision 2: 座標系の扱い

**課題**:
- 表示サイズ: ユーザーの画面サイズに依存（可変）
- LINE API 要求サイズ: 1040x1040 固定

**解決策**:
```typescript
// 表示座標 → API 座標への変換
const toApiCoordinates = (displayCoords: Area, displaySize: number): Area => {
  const scale = 1040 / displaySize;
  return {
    x: Math.round(displayCoords.x * scale),
    y: Math.round(displayCoords.y * scale),
    width: Math.round(displayCoords.width * scale),
    height: Math.round(displayCoords.height * scale),
  };
};

// API 座標 → 表示座標への変換
const toDisplayCoordinates = (apiCoords: Area, displaySize: number): Area => {
  const scale = displaySize / 1040;
  return {
    x: Math.round(apiCoords.x * scale),
    y: Math.round(apiCoords.y * scale),
    width: Math.round(apiCoords.width * scale),
    height: Math.round(apiCoords.height * scale),
  };
};
```

### Decision 3: エリア作成のUX

**Option A: クリック&ドラッグで作成**
- ユーザーが画像上でドラッグして矩形を作成
- 直感的

**Option B: エリア追加ボタン + 手動調整**
- ボタンでデフォルトエリアを追加
- ドラッグでリサイズ

**選択: Option A（クリック&ドラッグで作成）**

理由:
- より直感的
- LINE Manager と同じUX
- 実装も可能な範囲

**実装パターン**:
```typescript
const [isDrawing, setIsDrawing] = useState(false);
const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

const handleMouseDown = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setIsDrawing(true);
  setDrawStart({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  });
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDrawing || !drawStart) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  // Update preview rectangle
};

const handleMouseUp = (e: React.MouseEvent) => {
  if (!isDrawing || !drawStart) return;
  // Create new area
  setIsDrawing(false);
  setDrawStart(null);
};
```

### Decision 4: アクション設定UI

**構造**:
- エリアリスト: 全エリアの一覧表示
- 選択エリア: ハイライト表示
- アクション設定パネル: 選択エリアのアクション編集

**レイアウト**:
```
+------------------+------------------+
|                  |                  |
|  Image Editor    |  Area List       |
|  (画像+エリア)     |  - Area 1        |
|                  |  - Area 2        |
|                  |                  |
+------------------+------------------+
|  Action Settings (選択エリア用)       |
|  - Type: URI / Message              |
|  - Value: [input field]             |
+-------------------------------------+
```

### Decision 5: 画像アップロードの統合

**既存の画像ページのパターンを再利用**:
```tsx
// From: src/app/dashboard/messages/image/page.tsx
const onFile = async (file: File) => {
  setUploading(true);
  try {
    const fd = new FormData();
    fd.set('file', file);
    const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? 'アップロードに失敗しました');
    setImageUrl(data.secure_url); // Cloudinary URL
  } catch (e) {
    setError(e instanceof Error ? e.message : 'アップロードに失敗しました');
  } finally {
    setUploading(false);
  }
};
```

## Component Structure

### 新しいコンポーネント

1. **`ImageUploader`** (`src/app/dashboard/_components/image-uploader.tsx`)
   - 再利用可能な画像アップロードコンポーネント
   - ドラッグ&ドロップ、ファイル選択、クリップボード
   - Props: `onImageUploaded: (url: string) => void`

2. **`RichMessageEditor`** (`src/app/dashboard/message-items/rich/_components/editor.tsx`)
   - メインエディタコンポーネント
   - 画像表示 + エリア編集
   - Props: `imageUrl, areas, onAreasChange`

3. **`AreaList`** (`src/app/dashboard/message-items/rich/_components/area-list.tsx`)
   - エリア一覧表示
   - エリア選択、削除
   - Props: `areas, selectedIndex, onSelect, onDelete`

4. **`ActionEditor`** (`src/app/dashboard/message-items/rich/_components/action-editor.tsx`)
   - アクション設定UI
   - URI / Message の切り替えと入力
   - Props: `action, onChange`

### 状態管理

```typescript
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
  action: {
    type: "uri" | "message";
    linkUri?: string;
    text?: string;
  };
}

const [imageUrl, setImageUrl] = useState("");
const [areas, setAreas] = useState<Area[]>([]);
const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
```

## Risks / Trade-offs

### Risk 1: 座標精度
- **リスク**: 浮動小数点計算による座標のズレ
- **影響度**: Medium
- **緩和策**: Math.round() で整数化、プレビューでの確認

### Risk 2: モバイル対応
- **リスク**: タッチデバイスでのドラッグ操作が困難
- **影響度**: Medium
- **緩和策**: タッチイベントのサポート、または PC 推奨の表示

### Risk 3: パフォーマンス
- **リスク**: 大きな画像やエリア数が多い場合の動作
- **影響度**: Low
- **緩和策**: エリア数の上限設定、適切な画像サイズの推奨

## Migration Plan

### Phase 1: 画像アップロード（1日）
1. ImageUploader コンポーネント作成
2. リッチメッセージページへの統合
3. テスト

### Phase 2: ビジュアルエディタ（2-3日）
1. RichMessageEditor コンポーネント作成
2. マウスイベントハンドリング
3. エリア表示とリサイズ
4. 座標変換ロジック
5. テスト

### Phase 3: アクション設定UI（1日）
1. AreaList コンポーネント作成
2. ActionEditor コンポーネント作成
3. 統合
4. テスト

### Phase 4: プレビューと最終調整（1日）
1. プレビュー機能追加
2. バリデーション強化
3. エラーハンドリング
4. 全体テスト

### Rollback Plan
- 手動入力モードをフォールバックとして残す
- エディタの有効/無効を切り替えられるようにする

## Open Questions

1. **Q: エリアの最大数は？**
   - A: LINE API のドキュメントを確認（通常は制限なしだが、実用的には10程度が妥当）

2. **Q: 画像の最小/最大サイズは？**
   - A: LINE の仕様に従う（1024x1024px 以上）

3. **Q: エリアの最小サイズは？**
   - A: タップ可能な最小サイズを考慮（50x50px程度）

4. **Q: 既存の手動入力UIは残す？**
   - A: Yes。上級ユーザーや特殊なケースのため

## References

- [LINE Messaging API - Imagemap Message](https://developers.line.biz/ja/reference/messaging-api/#imagemap-message)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- 既存実装: `src/app/dashboard/messages/image/page.tsx`
- 既存実装: `src/app/dashboard/message-items/rich/page.tsx`
