# Tasks: テンプレート分割画像エディタ

## Phase 1: テンプレート定義と基盤整備

### 1.1 テンプレート定義ファイル作成
- [ ] `template-definitions.ts` を作成
- [ ] 1分割テンプレート定義（1パターン）
- [ ] 2分割（縦）テンプレート定義（50/50, 60/40, 70/30）
- [ ] 2分割（横）テンプレート定義（50/50, 60/40, 70/30）
- [ ] 3分割（縦）テンプレート定義（33/33/33, 40/30/30）
- [ ] 3分割（横）テンプレート定義（33/33/33, 40/30/30）
- [ ] 3分割（グリッド）テンプレート定義（上2/下1, 上1/下2）
- [ ] テンプレート型定義（Template, TemplateArea, TemplateVariant）

### 1.2 型定義の作成
- [ ] `types.ts` に TemplateImageSplitter 型を追加
- [ ] TemplateArea インターフェース定義（id, x, y, width, height, imageUrl）
- [ ] TemplateMessage インターフェース定義（templateId, areas）

### 1.3 Jotai Atoms作成
- [ ] `template-image-areas-atom.ts` を作成
- [ ] selectedTemplateAtom（選択中のテンプレート）
- [ ] templateAreasAtom（各エリアの画像URL）
- [ ] localStorage連携の実装

## Phase 2: テンプレート選択UI

### 2.1 TemplateSelectorコンポーネント
- [ ] `template-selector.tsx` を作成
- [ ] テンプレート一覧表示（グリッドレイアウト）
- [ ] 各テンプレートのビジュアルプレビュー
- [ ] 選択中テンプレートのハイライト
- [ ] テンプレート説明文表示（分割パターン、サイズ比率）

### 2.2 テンプレートプレビューカード
- [ ] SVGまたはCanvasでテンプレート構造を視覚化
- [ ] 分割線の表示
- [ ] エリア番号の表示
- [ ] サイズ比率のラベル表示

## Phase 3: 画像アップロード機能

### 3.1 TemplateAreaUploaderコンポーネント
- [ ] `template-area-uploader.tsx` を作成
- [ ] ImageCropUploaderの統合
- [ ] エリアごとの画像アップロード状態管理
- [ ] アップロード完了後のサムネイル表示
- [ ] 画像削除機能
- [ ] 画像再アップロード機能

### 3.2 アップロードフロー制御
- [ ] 順番にエリアを設定するUI（ステップ形式）
- [ ] 現在のエリアのハイライト
- [ ] 前のエリア/次のエリアへのナビゲーション
- [ ] 進捗表示（2/3エリア完了など）

## Phase 4: 画像合成とプレビュー

### 4.1 Cloudinary画像合成
- [ ] `template-image-composer.ts` ユーティリティ作成
- [ ] テンプレート定義から合成指示を生成
- [ ] Cloudinary Transformations APIで画像合成
- [ ] 合成画像URLの取得

### 4.2 TemplatePreviewコンポーネント
- [ ] `template-preview.tsx` を作成
- [ ] 合成結果のリアルタイムプレビュー
- [ ] ローディング状態の表示
- [ ] エラーハンドリング
- [ ] プレビュー画像のズーム機能

## Phase 5: メインエディタコンポーネント

### 5.1 TemplateImageEditorコンポーネント
- [ ] `template-image-editor.tsx` を作成
- [ ] テンプレート選択フェーズ
- [ ] 画像アップロードフェーズ
- [ ] プレビューフェーズ
- [ ] フェーズ間の遷移制御
- [ ] 戻る/次へボタン
- [ ] リセット機能

### 5.2 送信制御
- [ ] 全エリア画像設定の検証
- [ ] 送信ボタンの有効化/無効化
- [ ] データ構造の最終検証
- [ ] onAreasChange コールバックの実装

## Phase 6: カードフォーム統合

### 6.1 card-form-product.tsx
- [ ] ImageAreaEditor の削除
- [ ] TemplateImageEditor の統合
- [ ] onChange ハンドラーの調整
- [ ] imageAreas データ構造の変更

### 6.2 card-form-location.tsx
- [ ] ImageAreaEditor の削除
- [ ] TemplateImageEditor の統合
- [ ] onChange ハンドラーの調整

### 6.3 card-form-person.tsx
- [ ] ImageAreaEditor の削除
- [ ] TemplateImageEditor の統合
- [ ] onChange ハンドラーの調整

### 6.4 card-form-image.tsx
- [ ] ImageAreaEditor の削除
- [ ] TemplateImageEditor の統合
- [ ] onChange ハンドラーの調整

## Phase 7: API統合

### 7.1 payload-normalizer.ts
- [ ] テンプレート形式のペイロード処理
- [ ] templateAreasからimagemapへの変換
- [ ] Cloudinary画像合成の呼び出し
- [ ] 既存のimageAreas処理の削除

### 7.2 imagemap-converter.ts
- [ ] convertTemplateToImagemap 関数作成
- [ ] テンプレート座標からImagemapアクションへの変換
- [ ] アクション不要のため、ダミーアクション生成（LINE API要件）

### 7.3 message-schemas.ts
- [ ] templateImageSplitterSchema 追加
- [ ] cardTypePayloadSchema の更新
- [ ] Zod バリデーション

## Phase 8: 既存機能の削除

### 8.1 コンポーネント削除
- [ ] image-area-editor.tsx を削除
- [ ] image-area-canvas.tsx を削除
- [ ] image-area-list.tsx を削除
- [ ] image-area-form.tsx を削除

### 8.2 Hooks削除
- [ ] use-image-area-editor.ts を削除
- [ ] use-image-area-canvas-drawing.ts を削除
- [ ] use-image-area-interaction.ts を削除
- [ ] use-image-area-keyboard.ts を削除

### 8.3 Utils削除
- [ ] image-area-validation.ts を削除
- [ ] image-area-drawing-utils.ts を削除
- [ ] image-area-canvas-utils.ts を削除

### 8.4 State削除
- [ ] card-image-areas-atom.ts を削除

### 8.5 未使用インポートのクリーンアップ
- [ ] カードフォームから未使用インポートを削除
- [ ] payload-normalizerから削除
- [ ] imagemap-converterから削除

## Phase 9: テストとバリデーション

### 9.1 単体テスト
- [ ] template-definitions.test.ts - テンプレート定義の検証
- [ ] template-image-composer.test.ts - 画像合成ロジック
- [ ] template-selector.test.tsx - テンプレート選択UI

### 9.2 コンポーネントテスト
- [ ] template-image-editor.test.tsx - エディタの統合テスト
- [ ] template-area-uploader.test.tsx - 画像アップロード
- [ ] template-preview.test.tsx - プレビュー表示

### 9.3 統合テスト
- [ ] カードフォーム統合テスト（4ファイル）
- [ ] payload-normalizer統合テスト
- [ ] E2Eテスト: テンプレート選択→画像設定→送信

### 9.4 ビルドとリント
- [ ] TypeScriptコンパイルエラーなし
- [ ] ESLint警告なし
- [ ] すべてのテストが合格

## Phase 10: ドキュメントとマイグレーション

### 10.1 マイグレーションガイド
- [ ] 既存データの移行手順
- [ ] 代替手段の提示（自由描画からテンプレートへ）
- [ ] FAQセクション

### 10.2 ユーザードキュメント
- [ ] テンプレート選択方法
- [ ] 画像アップロード手順
- [ ] ベストプラクティス
- [ ] トラブルシューティング

### 10.3 開発者ドキュメント
- [ ] コンポーネント設計図
- [ ] データフロー図
- [ ] API統合ガイド
- [ ] 拡張方法（新しいテンプレート追加など）

## Completion Checklist

### 必須要件
- [ ] 全Phase完了
- [ ] 全テスト合格（単体/コンポーネント/統合/E2E）
- [ ] TypeScriptエラーなし
- [ ] ESLint警告なし
- [ ] プロダクションビルド成功
- [ ] マイグレーションガイド完成

### 機能要件
- [ ] 1-3分割テンプレート選択可能
- [ ] 各エリアに個別画像設定可能
- [ ] ImageCropUploader統合動作
- [ ] Cloudinary画像合成成功
- [ ] リアルタイムプレビュー表示
- [ ] 全エリア設定後に送信可能
- [ ] 既存自由描画機能完全削除

### 品質要件
- [ ] コードカバレッジ80%以上
- [ ] パフォーマンステスト合格
- [ ] アクセシビリティチェック合格
- [ ] ブラウザ互換性確認（Chrome, Firefox, Safari, Edge）
- [ ] レスポンシブデザイン確認（デスクトップ、タブレット、モバイル）

## Notes
- 既存の自由描画機能は完全削除するため、慎重に進める
- Cloudinary画像合成のコスト/パフォーマンスに注意
- ユーザーデータの移行手順を明確にする
- テンプレートバリエーションは将来的に追加可能な設計にする
