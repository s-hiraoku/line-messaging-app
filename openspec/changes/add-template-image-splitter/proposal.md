# Change: テンプレート分割画像エディタの追加

## Why

現在の画像エリアエディタは自由描画方式を採用しており、ユーザーが領域を手動で描画・配置する必要があります。しかし、多くのユーザーが求めているのは「1-3分割のシンプルなテンプレート」です。

**問題点:**
- 自由描画は柔軟だが、操作が複雑で学習コストが高い
- ほとんどのユースケースは定型的な分割パターン（2分割、3分割など）
- アクション設定が不要なケースが多い（画像表示のみ）
- 1枚の画像に領域を描画するより、各領域に個別の画像を配置したい

**ユーザーニーズ:**
- 直感的なテンプレート選択（1-3分割）
- 各エリアに個別の画像をアップロード・クロップ
- 画像表示に特化（アクション設定不要）
- リアルタイムプレビュー

## What Changes

### 新機能
1. **テンプレート選択UI**
   - 1分割、2分割（縦/横）、3分割（縦/横/グリッド）のプリセット
   - サイズ比率が異なる複数のバリエーション（例: 50/50, 60/40, 70/30）
   - ビジュアルプレビュー付きの選択画面

2. **エリア別画像アップロード**
   - 既存のImageCropUploaderを活用
   - 各エリアに個別に画像を設定
   - クロップ・ズーム機能

3. **画像合成**
   - Cloudinaryで各エリアの画像を1枚に合成
   - テンプレートの座標定義に基づいて配置
   - 最終的な合成画像のプレビュー

4. **送信制御**
   - 全エリアに画像が設定されるまで送信ボタン無効化
   - 進捗表示（例: 2/3エリア完了）

### 削除機能
- **既存の自由描画画像エリアエディタ** を完全に削除
  - ImageAreaEditor コンポーネント
  - ImageAreaCanvas（Canvas描画機能）
  - ImageAreaList（領域リスト）
  - ImageAreaForm（領域編集フォーム）
  - 関連するhooks（use-image-area-*）
  - 関連するutils（image-area-*-utils.ts）
  - Jotai atoms（card-image-areas-atom.ts）

### 変更機能
- **カードフォーム統合**
  - 全カードタイプ（product/location/person/image）でテンプレートエディタを使用
  - ImageAreaEditorの呼び出しを新しいTemplateImageEditorに置き換え

- **API処理**
  - payload-normalizer: テンプレート形式のデータ処理
  - imagemap-converter: テンプレートからImagemap変換
  - Cloudinary text-overlay: 削除（アクション不要のため不使用）

## Impact

### Breaking Changes ⚠️
**既存の自由描画機能を完全削除**
- ユーザーが作成した既存の画像エリアデータは使用不可になる
- マイグレーション手順の提供が必要
- データベース: imageAreas フィールドの構造変更

### Affected Specs
- **NEW**: `template-image-splitter` - 新規capability追加
- **REMOVED**: `card-image-area-editor` - 既存仕様を削除
- **MODIFIED**: `card-message-editor` - カードフォーム統合部分を変更

### Affected Code
**新規作成:**
- `src/app/dashboard/message-items/card/_components/template-image-editor.tsx`
- `src/app/dashboard/message-items/card/_components/template-selector.tsx`
- `src/app/dashboard/message-items/card/_components/template-area-uploader.tsx`
- `src/app/dashboard/message-items/card/_components/template-preview.tsx`
- `src/app/dashboard/message-items/card/_components/utils/template-definitions.ts`
- `src/state/message/template-image-areas-atom.ts`

**削除:**
- `src/app/dashboard/message-items/card/_components/image-area-editor.tsx`
- `src/app/dashboard/message-items/card/_components/image-area-canvas.tsx`
- `src/app/dashboard/message-items/card/_components/image-area-list.tsx`
- `src/app/dashboard/message-items/card/_components/image-area-form.tsx`
- `src/app/dashboard/message-items/card/_components/hooks/use-image-area-*.ts`（4ファイル）
- `src/app/dashboard/message-items/card/_components/utils/image-area-*.ts`（3ファイル）
- `src/state/message/card-image-areas-atom.ts`

**変更:**
- `src/app/dashboard/message-items/card/_components/card-form-*.tsx`（4ファイル）
- `src/lib/line/payload-normalizer.ts`
- `src/lib/line/imagemap-converter.ts`
- `src/lib/line/message-schemas.ts`

### User Impact
**利点:**
- より直感的で使いやすいUI
- テンプレート選択により作業時間短縮
- アクション不要により設定が簡素化

**注意点:**
- 既存の自由描画データは移行が必要
- 自由な領域配置はできなくなる（テンプレートのみ）

### Technical Impact
**削減:**
- コード行数: 約2,000行削除（既存機能）
- コンポーネント数: 12ファイル削除

**追加:**
- コード行数: 約1,200行追加（新機能）
- コンポーネント数: 6ファイル新規作成

**ネット削減:** 約800行のコード削減

## Timeline
- **Phase 1-2:** 1週間 - OpenSpec作成とテンプレート定義
- **Phase 3-4:** 2週間 - コンポーネント実装
- **Phase 5:** 1週間 - 既存機能削除とマイグレーション
- **Phase 6:** 1週間 - テストとドキュメント

**合計:** 約5週間

## Risks
1. **データ移行リスク**: 既存ユーザーのデータ喪失の可能性
   - **対策**: マイグレーションスクリプトの提供

2. **機能削減**: 自由な領域配置ができなくなる
   - **対策**: テンプレートバリエーションを充実させる

3. **Cloudinary制限**: 画像合成の処理時間・コスト
   - **対策**: 画像サイズの最適化とキャッシング

## Success Criteria
- ✅ 1-3分割のテンプレートが選択可能
- ✅ 各エリアに個別画像をアップロード可能
- ✅ 全エリア設定後に送信ボタンが有効化
- ✅ 既存の自由描画機能が完全削除
- ✅ ビルドエラーなし、全テスト合格
- ✅ マイグレーションガイド提供
