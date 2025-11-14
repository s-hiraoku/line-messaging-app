# Design: カードタイプメッセージの画像エリア分割エディタ

## Architecture Overview

### Component Structure

```
card-form-{type}.tsx (Product/Location/Person/Image)
├── ImageCropUploader (画像アップロード - 既存)
├── ImageAreaEditor (新規 - メインエディタ)
│   ├── ImageAreaCanvas (新規 - ビジュアルエディタ)
│   │   ├── Canvas描画 (画像 + 領域 + テキストラベル)
│   │   ├── ドラッグ&リサイズ (領域編集)
│   │   └── 領域選択
│   ├── ImageAreaList (新規 - 領域リスト)
│   │   ├── 領域一覧表示
│   │   ├── 領域の並び替え
│   │   └── 領域の削除
│   └── ImageAreaForm (新規 - 領域編集フォーム)
│       ├── テキストラベル入力
│       ├── 座標・サイズ入力
│       └── ActionEditor (アクション設定 - 既存)
└── ActionEditor (カードボタン用 - 既存)
```

### Data Model

```typescript
// 新規追加型
interface ImageArea {
  id: string;
  label: string; // テキストラベル
  area: {
    x: number; // 左上X座標 (ピクセル)
    y: number; // 左上Y座標 (ピクセル)
    width: number; // 幅 (ピクセル)
    height: number; // 高さ (ピクセル)
  };
  action: CardAction; // URI/Message/Postback
  labelPosition?: {
    x: number; // ラベルのX座標 (相対位置)
    y: number; // ラベルのY座標 (相対位置)
  };
}

// 既存カード型の拡張
interface BaseCard {
  id: string;
  type: CardType;
  imageUrl: string;
  actions: CardAction[]; // カードボタン用(最大3つ)
  imageAreas?: ImageArea[]; // 画像エリア(新規追加)
}
```

### LINE API Mapping

カードメッセージは LINE の Carousel Template を使用しますが、画像エリア機能は現在の LINE Messaging API の標準カードテンプレートには含まれていません。

**実装方針:**

1. **フロントエンド側でのビジュアル編集機能**
   - 画像上に領域を定義し、テキストラベルを配置
   - 各領域にアクションを設定

2. **送信時の変換処理**
   - 画像エリアが定義されている場合、以下のいずれかの方法で送信:
     - **方法A (推奨)**: Imagemap メッセージとして送信
       - `type: "imagemap"`
       - 各領域を `imagemapArea` として変換
       - テキストラベルは画像に合成してアップロード
     - **方法B**: 複数の Carousel Template として送信
       - 各領域を個別のカードに分割
       - カード数制限(最大10枚)に注意

3. **デフォルト動作**
   - `imageAreas` が未定義の場合は従来の単一カード送信

### UI/UX Design

#### 1. 画像エリアエディタの表示位置
各カードタイプのフォーム内、画像アップロードセクションの直後に配置:

```
┌─────────────────────────────────────┐
│ タイトル入力                        │
│ 説明入力                            │
│ その他フィールド                    │
├─────────────────────────────────────┤
│ 画像アップロード (ImageCropUploader)│
├─────────────────────────────────────┤
│ 画像エリア編集 (ImageAreaEditor)    │ ← 新規追加
│ ├─ ビジュアルエディタ              │
│ ├─ 領域リスト                      │
│ └─ 領域編集フォーム                │
├─────────────────────────────────────┤
│ アクションボタン設定 (ActionEditor) │
└─────────────────────────────────────┘
```

#### 2. ビジュアルエディタ(ImageAreaCanvas)
- 画像をキャンバスに表示
- 各領域を半透明の矩形で表示
- テキストラベルを領域内に表示
- 選択中の領域をハイライト表示
- リサイズハンドル(4隅 + 4辺)を表示
- ドラッグでラベル位置を移動可能

#### 3. 領域リスト(ImageAreaList)
- 定義済み領域を一覧表示
- 各領域の情報(ラベル、座標、サイズ、アクション)を表示
- ドラッグ&ドロップで並び替え
- 「選択」「編集」「削除」ボタン

#### 4. 領域編集フォーム(ImageAreaForm)
- テキストラベル入力(必須、最大20文字)
- 座標入力(X, Y)
- サイズ入力(幅, 高さ)
- アクション設定(ActionEditor 再利用)
- ラベル位置調整(相対位置)

### State Management

```typescript
// Jotai atom (新規)
const cardImageAreasAtom = atom<Record<string, ImageArea[]>>({});

// Hooks (新規)
function useImageAreaEditor(cardId: string) {
  const [areas, setAreas] = useAtom(cardImageAreasAtom);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const addArea = (area: Omit<ImageArea, 'id'>) => { /* ... */ };
  const updateArea = (id: string, updates: Partial<ImageArea>) => { /* ... */ };
  const deleteArea = (id: string) => { /* ... */ };
  const selectArea = (id: string | null) => { /* ... */ };

  return { areas, selectedAreaId, addArea, updateArea, deleteArea, selectArea };
}
```

### Validation Rules

1. **画像エリア数**: 最大10個まで
2. **テキストラベル**: 必須、最大20文字
3. **座標**: 0 以上、画像サイズ以内
4. **サイズ**: 最小20x20ピクセル、最大画像サイズ以内
5. **領域の重複**: 警告表示(エラーではない)
6. **アクション**: 各領域に必須

### Performance Considerations

- **キャンバス描画の最適化**
  - requestAnimationFrame を使用
  - 描画頻度の制限(60fps)

- **画像サイズの制約**
  - エディタ表示用にリサイズ(最大1024px幅)
  - 座標は元画像サイズで保存

- **自動保存**
  - 変更後3秒後に localStorage に保存
  - debounce で保存頻度を制限

### Accessibility

- **キーボード操作**
  - Tab: 領域間の移動
  - Arrow keys: 選択領域の移動(1px単位)
  - Shift + Arrow: サイズ変更(1px単位)
  - Delete: 領域削除

- **スクリーンリーダー対応**
  - 各領域に aria-label 設定
  - 操作可能要素に適切な role 設定

### Testing Strategy

1. **Unit Tests**
   - ImageArea 型のバリデーション
   - 座標・サイズ計算ロジック
   - LINE API 形式への変換

2. **Component Tests**
   - ImageAreaCanvas の描画
   - ドラッグ&リサイズ操作
   - 領域の追加・編集・削除

3. **Integration Tests**
   - カードフォームとの統合
   - メッセージ送信フロー
   - localStorage への保存・復元

4. **E2E Tests**
   - 画像エリア編集の完全フロー
   - LINE API への送信確認
   - LINEアプリでの表示確認

## Technical Decisions

### Decision 1: Imagemap vs Carousel Template

**選択肢:**
- A: Imagemap メッセージとして送信(テキストを画像に合成)
- B: 複数の Carousel Template として送信(各領域を個別カード化)

**決定: 方法A (Imagemap) を推奨**

**理由:**
- ユーザーの要望「LINE Manager と同じUI」に最も近い
- 1枚の画像で複数の領域を扱える
- テキストラベルを画像上に自然に配置可能
- タップ可能な領域を柔軟に定義可能

**トレードオフ:**
- テキストを画像に合成する処理が必要(Cloudinaryで実現可能)
- Imagemap のサイズ制限(最大2500x2500px)を考慮

### Decision 2: Canvas vs HTML Overlay

**選択肢:**
- A: HTML Canvas で描画
- B: HTML要素をabsolute positionでオーバーレイ

**決定: 方法A (Canvas) を採用**

**理由:**
- 既存のリッチメッセージエディタ(Imagemap)で実績あり
- パフォーマンスが良い
- 複雑な描画(半透明領域、リサイズハンドル等)が容易

**参考実装:**
- `src/app/dashboard/message-items/rich/_components/imagemap-canvas.tsx`
- `src/app/dashboard/message-items/rich/_components/hooks/use-imagemap-canvas-drawing.ts`

### Decision 3: 画像へのテキスト合成方法

**選択肢:**
- A: クライアント側で Canvas API を使用して合成
- B: Cloudinary の Transformation API を使用
- C: サーバー側で Sharp を使用して合成

**決定: 方法B (Cloudinary) を採用**

**理由:**
- 既に Cloudinary を画像アップロードで使用中
- Transformation API で高品質なテキストオーバーレイが可能
- サーバー負荷なし、クライアント実装不要
- フォント・サイズ・色・位置を柔軟に指定可能

**実装例:**
```typescript
// Cloudinary URL に transformation パラメータを追加
const overlayUrl = cloudinary.url(imagePublicId, {
  transformation: [
    { width: 1024, height: 1024, crop: 'fill' },
    { overlay: { text: 'エリア1', font_family: 'Arial', font_size: 24 },
      gravity: 'north_west', x: 100, y: 100 }
  ]
});
```

## Open Questions

1. **画像エリア機能の有効化方法**
   - デフォルトで有効? or トグルスイッチで有効化?
   - → **提案**: トグルスイッチで「画像エリア分割を有効にする」を追加

2. **最大領域数**
   - 10個で十分? or もっと必要?
   - → **提案**: 10個(LINE Imagemap の推奨上限)

3. **テキストラベルのスタイル設定**
   - フォント、サイズ、色をカスタマイズ可能にする?
   - → **提案**: 初期実装では固定スタイル、将来的にカスタマイズ可能に

4. **プレビュー表示**
   - カードプレビューに画像エリアを表示する?
   - → **提案**: テキスト合成後の画像をプレビューに表示
