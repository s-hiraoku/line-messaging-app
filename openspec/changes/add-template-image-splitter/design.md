# Design: テンプレート分割画像エディタ

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TemplateImageEditor                       │
│  ┌────────────────────┬──────────────────┬────────────────┐ │
│  │  TemplateSelector  │ AreaUploader(s)  │ PreviewPanel   │ │
│  └────────────────────┴──────────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Jotai State (Atoms)    │
              │  - selectedTemplate     │
              │  - templateAreas        │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ Template Definitions    │
              │ (template-definitions.ts│
              └─────────────────────────┘
                            │
                            ▼
      ┌────────────────────────────────────────┐
      │     Image Composition Pipeline         │
      │  ImageCropUploader → Cloudinary Upload │
      │       → Multi-Image Composition        │
      │         → Imagemap Conversion          │
      └────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  LINE Messaging API     │
              │  (Imagemap Message)     │
              └─────────────────────────┘
```

## Component Design

### 1. TemplateImageEditor (メインコンポーネント)

**責任:**
- 全体のフロー制御（テンプレート選択 → 画像設定 → プレビュー → 送信）
- 各フェーズ間の遷移管理
- 親コンポーネント（カードフォーム）への変更通知

**Props:**
```typescript
interface TemplateImageEditorProps {
  onAreasChange: (areas: TemplateArea[]) => void;
  initialTemplateId?: string;          // 既存データの復元用
  initialAreas?: TemplateArea[];       // 既存データの復元用
}
```

**State:**
- 現在のフェーズ (`'select' | 'upload' | 'preview'`)
- 選択中のテンプレート
- 各エリアの画像データ
- 合成画像URL

**主要メソッド:**
- `handleTemplateSelect(templateId: string)` - テンプレート選択
- `handleAreaImageUpload(areaId: string, imageUrl: string)` - エリア画像設定
- `handleCompose()` - 画像合成開始
- `handleReset()` - リセット

### 2. TemplateSelector (テンプレート選択)

**責任:**
- 利用可能なテンプレート一覧の表示
- 各テンプレートのビジュアルプレビュー
- テンプレート選択の処理

**Props:**
```typescript
interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
}
```

**UI構造:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {templates.map(template => (
    <TemplateCard
      key={template.id}
      template={template}
      selected={template.id === selectedTemplateId}
      onClick={() => onSelect(template.id)}
    />
  ))}
</div>
```

**TemplateCard内容:**
- テンプレート名（例: "2分割（縦）60/40"）
- SVGまたはCanvasでの構造プレビュー
- 説明文（サイズ比率、エリア数など）

### 3. TemplateAreaUploader (エリア別画像アップロード)

**責任:**
- 特定エリアへの画像アップロード
- ImageCropUploaderの統合
- アップロード状態の管理と表示

**Props:**
```typescript
interface TemplateAreaUploaderProps {
  area: TemplateAreaDefinition;       // テンプレート定義から取得
  currentImageUrl?: string;            // 既にアップロード済みの画像URL
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
}
```

**状態:**
- アップロード中 (`uploading`)
- 完了 (`uploaded`)
- 未設定 (`empty`)

**UI構造:**
```tsx
{!currentImageUrl ? (
  <ImageCropUploader
    onImageUploaded={onImageUpload}
    defaultAspectRatio="FREE"  // エリアのアスペクト比に応じて調整
  />
) : (
  <div className="relative">
    <img src={currentImageUrl} alt={`エリア ${area.id}`} />
    <button onClick={onImageRemove}>削除</button>
    <button onClick={() => setEditing(true)}>変更</button>
  </div>
)}
```

### 4. TemplatePreview (プレビュー表示)

**責任:**
- 合成後の画像プレビュー
- ズーム機能
- ローディング状態の表示

**Props:**
```typescript
interface TemplatePreviewProps {
  composedImageUrl?: string;
  template: Template;
  areas: TemplateArea[];
  isComposing: boolean;
}
```

**UI構造:**
```tsx
{isComposing ? (
  <LoadingSpinner text="画像を合成中..." />
) : composedImageUrl ? (
  <ZoomableImage src={composedImageUrl} />
) : (
  <EmptyState text="全エリアに画像を設定すると合成されます" />
)}
```

## Data Models

### Template (テンプレート定義)

```typescript
interface Template {
  id: string;                    // 'split-2-vertical-50-50'
  name: string;                  // '2分割（縦）50/50'
  description: string;           // '上下に均等に分割'
  areaCount: number;             // 2
  baseSize: {
    width: number;               // 1024
    height: number;              // 1024
  };
  areas: TemplateAreaDefinition[];
}

interface TemplateAreaDefinition {
  id: string;                    // 'area-1', 'area-2', ...
  label: string;                 // 'エリア1（上部）'
  x: number;                     // 0 (pixels)
  y: number;                     // 0 (pixels)
  width: number;                 // 1024 (pixels)
  height: number;                // 512 (pixels)
  suggestedAspectRatio?: AspectRatioPreset;  // 'LANDSCAPE', 'PORTRAIT', etc.
}
```

### TemplateArea (画像設定済みエリア)

```typescript
interface TemplateArea {
  id: string;                    // 'area-1'
  imageUrl: string;              // Cloudinary URL
  x: number;                     // テンプレート定義から継承
  y: number;                     // テンプレート定義から継承
  width: number;                 // テンプレート定義から継承
  height: number;                // テンプレート定義から継承
}
```

### TemplateMessage (送信データ)

```typescript
interface TemplateMessage {
  templateId: string;
  composedImageUrl: string;      // 合成後の最終画像URL
  baseSize: {
    width: number;
    height: number;
  };
  areas: TemplateArea[];
}
```

## Template Definitions

### テンプレートカタログ

```typescript
// src/app/dashboard/message-items/card/_components/utils/template-definitions.ts

export const TEMPLATES: Template[] = [
  // 1分割
  {
    id: 'split-1-full',
    name: '1分割（全画面）',
    description: '1枚の画像を全画面表示',
    areaCount: 1,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1', x: 0, y: 0, width: 1024, height: 1024 }
    ]
  },

  // 2分割（縦）
  {
    id: 'split-2-vertical-50-50',
    name: '2分割（縦）50/50',
    description: '上下に均等分割',
    areaCount: 2,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上部）', x: 0, y: 0, width: 1024, height: 512, suggestedAspectRatio: 'LANDSCAPE' },
      { id: 'area-2', label: 'エリア2（下部）', x: 0, y: 512, width: 1024, height: 512, suggestedAspectRatio: 'LANDSCAPE' }
    ]
  },
  {
    id: 'split-2-vertical-60-40',
    name: '2分割（縦）60/40',
    description: '上部60%、下部40%',
    areaCount: 2,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上部）', x: 0, y: 0, width: 1024, height: 614 },
      { id: 'area-2', label: 'エリア2（下部）', x: 0, y: 614, width: 1024, height: 410 }
    ]
  },
  {
    id: 'split-2-vertical-70-30',
    name: '2分割（縦）70/30',
    description: '上部70%、下部30%',
    areaCount: 2,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上部）', x: 0, y: 0, width: 1024, height: 717 },
      { id: 'area-2', label: 'エリア2（下部）', x: 0, y: 717, width: 1024, height: 307 }
    ]
  },

  // 2分割（横）
  {
    id: 'split-2-horizontal-50-50',
    name: '2分割（横）50/50',
    description: '左右に均等分割',
    areaCount: 2,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（左）', x: 0, y: 0, width: 512, height: 1024, suggestedAspectRatio: 'PORTRAIT' },
      { id: 'area-2', label: 'エリア2（右）', x: 512, y: 0, width: 512, height: 1024, suggestedAspectRatio: 'PORTRAIT' }
    ]
  },
  {
    id: 'split-2-horizontal-60-40',
    name: '2分割（横）60/40',
    description: '左60%、右40%',
    areaCount: 2,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（左）', x: 0, y: 0, width: 614, height: 1024 },
      { id: 'area-2', label: 'エリア2（右）', x: 614, y: 0, width: 410, height: 1024 }
    ]
  },

  // 3分割（縦）
  {
    id: 'split-3-vertical-33-33-33',
    name: '3分割（縦）均等',
    description: '上中下に均等分割',
    areaCount: 3,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上）', x: 0, y: 0, width: 1024, height: 341 },
      { id: 'area-2', label: 'エリア2（中）', x: 0, y: 341, width: 1024, height: 342 },
      { id: 'area-3', label: 'エリア3（下）', x: 0, y: 683, width: 1024, height: 341 }
    ]
  },
  {
    id: 'split-3-vertical-40-30-30',
    name: '3分割（縦）40/30/30',
    description: '上部40%、中下30%ずつ',
    areaCount: 3,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上）', x: 0, y: 0, width: 1024, height: 410 },
      { id: 'area-2', label: 'エリア2（中）', x: 0, y: 410, width: 1024, height: 307 },
      { id: 'area-3', label: 'エリア3（下）', x: 0, y: 717, width: 1024, height: 307 }
    ]
  },

  // 3分割（グリッド）
  {
    id: 'split-3-grid-top-2-bottom-1',
    name: '3分割（グリッド）上2/下1',
    description: '上部に左右2つ、下部に1つ',
    areaCount: 3,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（左上）', x: 0, y: 0, width: 512, height: 512 },
      { id: 'area-2', label: 'エリア2（右上）', x: 512, y: 0, width: 512, height: 512 },
      { id: 'area-3', label: 'エリア3（下部）', x: 0, y: 512, width: 1024, height: 512, suggestedAspectRatio: 'LANDSCAPE' }
    ]
  },
  {
    id: 'split-3-grid-top-1-bottom-2',
    name: '3分割（グリッド）上1/下2',
    description: '上部に1つ、下部に左右2つ',
    areaCount: 3,
    baseSize: { width: 1024, height: 1024 },
    areas: [
      { id: 'area-1', label: 'エリア1（上部）', x: 0, y: 0, width: 1024, height: 512, suggestedAspectRatio: 'LANDSCAPE' },
      { id: 'area-2', label: 'エリア2（左下）', x: 0, y: 512, width: 512, height: 512 },
      { id: 'area-3', label: 'エリア3（右下）', x: 512, y: 512, width: 512, height: 512 }
    ]
  }
];
```

## Image Composition Pipeline

### Cloudinary Multi-Image Composition

```typescript
// src/lib/cloudinary/template-image-composer.ts

export async function composeTemplateImages(
  template: Template,
  areas: TemplateArea[]
): Promise<string> {
  // 1. ベース画像サイズの確保（透明または白背景）
  const baseLayer = {
    width: template.baseSize.width,
    height: template.baseSize.height,
    background: 'rgb:ffffff'
  };

  // 2. 各エリアの画像をレイヤーとして配置
  const overlays = areas.map(area => {
    const publicId = extractPublicId(area.imageUrl);
    return {
      overlay: publicId,
      width: area.width,
      height: area.height,
      x: area.x,
      y: area.y,
      gravity: 'north_west',
      crop: 'fill'
    };
  });

  // 3. Cloudinary URL生成
  const transformation = [baseLayer, ...overlays];

  return cloudinary.url('placeholder', {  // ベース画像としてplaceholder使用
    transformation,
    secure: true,
    type: 'upload'
  });
}
```

### LINE Imagemap Conversion

```typescript
// src/lib/line/imagemap-converter.ts

export function convertTemplateToImagemap(
  templateMessage: TemplateMessage
): ImagemapMessage {
  const baseUrl = removeFileExtension(templateMessage.composedImageUrl);

  return {
    type: 'imagemap',
    baseUrl,
    altText: 'テンプレート画像メッセージ',
    baseSize: templateMessage.baseSize,
    actions: templateMessage.areas.map((area, index) => ({
      type: 'message',  // アクション不要だがLINE APIの要件として必要
      label: `area-${index + 1}`,
      text: `エリア${index + 1}がタップされました`,  // ダミーテキスト
      area: {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height
      }
    }))
  };
}
```

**注意:** LINE Messaging APIのImagemapメッセージは最低1つのactionが必要なため、ダミーのmessage actionを設定します。

## State Management (Jotai)

```typescript
// src/state/message/template-image-areas-atom.ts

import { atomWithStorage } from 'jotai/utils';

export const selectedTemplateAtom = atomWithStorage<string | null>(
  'template-image-selected-template',
  null
);

export const templateAreasAtom = atomWithStorage<TemplateArea[]>(
  'template-image-areas',
  []
);

export const composedImageUrlAtom = atomWithStorage<string | null>(
  'template-composed-image-url',
  null
);
```

## Integration Points

### Card Form Integration

```tsx
// src/app/dashboard/message-items/card/_components/card-form-product.tsx

// 既存のImageAreaEditor削除
// <ImageAreaEditor ... /> を削除

// TemplateImageEditor追加
<TemplateImageEditor
  onAreasChange={useCallback(
    (areas: TemplateArea[]) => onChange({ templateAreas: areas }),
    [onChange]
  )}
  initialTemplateId={card.templateId}
  initialAreas={card.templateAreas}
/>
```

### Payload Normalization

```typescript
// src/lib/line/payload-normalizer.ts

if ("type" in payload && payload.type === "cardType") {
  // 新しいテンプレート形式の検出
  if (payload.templateAreas && payload.templateAreas.length > 0) {
    // テンプレート画像の合成
    const composedImageUrl = await composeTemplateImages(
      payload.template,
      payload.templateAreas
    );

    // Imagemapへの変換
    const imagemapMessage = convertTemplateToImagemap({
      templateId: payload.templateId,
      composedImageUrl,
      baseSize: payload.template.baseSize,
      areas: payload.templateAreas
    });

    return {
      to,
      messages: [imagemapMessage],
      isTemplate: false,
      messageItemType: "cardType" as const,
    };
  }

  // 旧形式（imageAreas）は削除済み
  // 従来のTemplate送信のみサポート
  return {
    to,
    messages: [],
    isTemplate: true,
    templateData: {
      altText: payload.altText,
      template: payload.template,
    },
    messageItemType: "cardType" as const,
  };
}
```

## Performance Considerations

### Image Optimization
- Cloudinaryでの画像最適化（自動フォーマット、品質調整）
- 合成画像のキャッシング（Cloudinary CDN）
- プレビュー用に低解像度バージョンを先行表示

### State Management
- Jotai atomsの適切な分割（selectedTemplate、areas、composedUrl）
- localStorage連携による編集状態の永続化
- 不要な再レンダリングの防止（useMemo, useCallback）

### User Experience
- 画像アップロード中のプログレスバー
- 合成中のローディングインジケーター
- エラー時の明確なフィードバック

## Security Considerations

### Image Upload
- ファイルサイズ制限（最大10MB）
- 許可ファイル形式（JPEG, PNG のみ）
- Cloudinary Upload Preset のセキュア設定

### Data Validation
- テンプレート定義の整合性チェック
- 座標値の範囲検証
- XSS対策（ユーザー入力のサニタイズ）

## Accessibility

### Keyboard Navigation
- Tabキーでフォーカス移動
- Enterキーで選択/決定
- Escキーでキャンセル

### Screen Reader Support
- ARIA labels on all interactive elements
- Progress announcements
- Error message announcements

### Visual Indicators
- 現在選択中の要素の明確な視覚的フィードバック
- コントラスト比の確保
- カラーブラインドフレンドリーな配色

## Testing Strategy

### Unit Tests
- Template definitions validation
- Coordinate calculations
- Image composition logic

### Component Tests
- TemplateSelector behavior
- TemplateAreaUploader interactions
- TemplatePreview display

### Integration Tests
- End-to-end template selection → upload → compose → send flow
- Cloudinary integration
- LINE API integration

### E2E Tests
- Full user journey from card creation to message send
- Multi-device testing (desktop, tablet, mobile)
- Browser compatibility testing

## Migration Strategy

### データ移行
既存の `imageAreas` データは新しい `templateAreas` 形式に変換できません（構造が異なるため）。

**推奨アプローチ:**
1. 既存データの警告表示（「この機能は廃止されました」）
2. 新しいテンプレート方式の案内
3. マイグレーションスクリプトは提供しない（手動再作成を推奨）

**ユーザー通知:**
```
⚠️ 重要: 画像エリア機能が新しいテンプレート方式に変更されました

従来の自由描画機能は廃止され、使いやすいテンプレート選択方式に
置き換えられました。既存の画像エリアデータは使用できなくなります。

新しい方式では、1-3分割のテンプレートから選択し、各エリアに
個別の画像を簡単に設定できます。
```

## Future Enhancements

### Phase 2以降の機能拡張
- カスタムテンプレートの作成機能
- テンプレートのインポート/エクスポート
- 画像エフェクト（フィルター、ボーダー等）
- アニメーションGIF対応
- 動画サムネイル対応
