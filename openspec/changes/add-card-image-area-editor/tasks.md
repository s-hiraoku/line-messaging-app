# Tasks: カードタイプメッセージの画像エリア分割エディタ

## Phase 1: 型定義とデータモデル

- [ ] `ImageArea` 型を `src/app/dashboard/message-items/card/_components/types.ts` に追加
  - `id`, `label`, `area` (x, y, width, height), `action`, `labelPosition` を定義
- [ ] `BaseCard` インターフェースに `imageAreas?: ImageArea[]` を追加
- [ ] `src/lib/line/message-schemas.ts` に `imageAreaSchema` を追加
  - Zod スキーマでバリデーションルールを定義
- [ ] `src/lib/line/message-schemas.ts` に Imagemap メッセージスキーマを拡張
  - テキストオーバーレイをサポート

## Phase 2: 状態管理(Jotai)

- [ ] `src/state/message/card-image-areas-atom.ts` を作成
  - `cardImageAreasAtom` を定義(`Record<string, ImageArea[]>`)
  - `selectedAreaIdAtom` を定義(`string | null`)
- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-image-area-editor.ts` を作成
  - `addArea`, `updateArea`, `deleteArea`, `selectArea`, `reorderAreas` 関数を実装
  - localStorage への自動保存機能(debounce 3秒)
  - データ復元機能

## Phase 3: UI コンポーネント - 基本構造

- [ ] `src/app/dashboard/message-items/card/_components/image-area-editor.tsx` を作成
  - メインエディタコンポーネント(トグルスイッチ、レイアウト)
  - 3カラムレイアウト: キャンバス | 領域リスト | 編集フォーム
  - レスポンシブ対応(デスクトップ/タブレット/モバイル)
- [ ] `src/app/dashboard/message-items/card/_components/image-area-list.tsx` を作成
  - 領域一覧表示
  - 領域の選択・削除ボタン
  - ドラッグ&ドロップでの並び替え
  - 検索フィルタ
- [ ] `src/app/dashboard/message-items/card/_components/image-area-form.tsx` を作成
  - テキストラベル入力(最大20文字)
  - 座標・サイズ入力(X, Y, 幅, 高さ)
  - アクション設定(ActionEditor 再利用)
  - バリデーション表示

## Phase 4: ビジュアルエディタ(Canvas)

- [ ] `src/app/dashboard/message-items/card/_components/image-area-canvas.tsx` を作成
  - Canvas 要素の作成と初期化
  - ImageCropUploader でアップロードされた画像の読み込みと描画
  - 画像の元サイズ(width, height)の取得
  - 領域の描画(半透明矩形 + テキストラベル)
  - 選択中の領域のハイライト表示
  - リサイズハンドル(4隅 + 4辺)の描画
- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-image-area-canvas-drawing.ts` を作成
  - Canvas 描画ロジック
  - requestAnimationFrame による最適化
  - ズーム対応(50%〜200%)
  - パン対応
- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-image-area-interaction.ts` を作成
  - マウスイベント処理(click, mousedown, mousemove, mouseup)
  - 領域のドラッグ移動
  - 領域のリサイズ
  - 新規領域のドラッグ作成
  - ラベル位置のドラッグ調整

## Phase 5: 高度な機能

- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-image-area-canvas-grid.ts` を作成
  - グリッド表示機能(10px間隔)
  - スナップ機能(グリッド・他領域への吸着)
- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-image-area-keyboard.ts` を作成
  - キーボード操作(Tab, 矢印キー, Delete, Esc)
  - Shift + 矢印キーで10px単位移動
- [ ] `src/app/dashboard/message-items/card/_components/utils/image-area-validation.ts` を作成
  - 包括的なバリデーション関数
  - 座標・サイズの妥当性チェック
  - 領域の重複チェック
  - URL形式チェック

## Phase 6: カードフォームへの統合

- [ ] `src/app/dashboard/message-items/card/_components/card-form-product.tsx` を更新
  - 既存の ImageCropUploader の `onImageUploaded` コールバックで画像URL取得
  - ImageAreaEditor コンポーネントを ImageCropUploader の直後に追加
  - 「画像エリア分割を有効にする」トグルスイッチ追加(画像アップロード後に有効化)
  - 推奨アスペクト比: SQUARE (1:1)
- [ ] `src/app/dashboard/message-items/card/_components/card-form-location.tsx` を更新
  - ImageAreaEditor コンポーネント統合
  - 推奨アスペクト比: LANDSCAPE (16:9)
- [ ] `src/app/dashboard/message-items/card/_components/card-form-person.tsx` を更新
  - ImageAreaEditor コンポーネント統合
  - 推奨アスペクト比: SQUARE (1:1)
- [ ] `src/app/dashboard/message-items/card/_components/card-form-image.tsx` を更新
  - ImageAreaEditor コンポーネント統合
  - 推奨アスペクト比: FREE (自由)

## Phase 7: 画像合成(Cloudinary)

- [ ] `src/lib/cloudinary/text-overlay.ts` を作成
  - Cloudinary Transformation API を使用したテキストオーバーレイ
  - 複数のテキストラベルを一括合成
  - フォント・サイズ・色の設定
  - エラーハンドリング
- [ ] `src/lib/cloudinary/text-overlay.test.ts` を作成
  - テキストオーバーレイ関数のユニットテスト

## Phase 8: LINE API 統合

- [ ] `src/lib/line/payload-normalizer.ts` を更新
  - カードメッセージに `imageAreas` が存在する場合の処理分岐
  - Imagemap メッセージ形式への変換
  - Carousel Template 形式(従来)との共存
- [ ] `src/lib/line/imagemap-converter.ts` を作成
  - カードメッセージ + ImageArea → Imagemap メッセージ変換
  - アクションの変換(URI, Message)
  - Postback は Message に変換(Imagemap 未サポートのため)
- [ ] `src/lib/line/imagemap-converter.test.ts` を作成
  - Imagemap 変換ロジックのユニットテスト

## Phase 9: データ永続化

- [ ] `src/app/dashboard/message-items/card/_components/hooks/use-card-persistence.ts` を更新
  - 画像エリアデータの localStorage 保存
  - 自動保存(debounce 3秒)
  - データ復元
  - 送信成功時のクリア

## Phase 10: UI/UX 改善

- [ ] カードプレビューコンポーネント更新
  - テキスト合成後の画像を表示
  - Imagemap メッセージのプレビュー
- [ ] ツールチップ追加
  - 各機能の説明を表示
- [ ] アニメーション追加
  - 領域選択時のフェードイン
  - ドラッグ中のカーソル変更
- [ ] アクセシビリティ対応
  - aria-label 設定
  - role 設定
  - キーボード操作のフォーカス表示

## Phase 11: テスト

- [ ] `image-area-editor.test.tsx` - コンポーネントテスト
  - トグルスイッチの動作
  - 領域の追加・編集・削除
- [ ] `image-area-canvas.test.tsx` - Canvas 描画テスト
  - 領域の描画
  - ドラッグ&リサイズ
- [ ] `image-area-form.test.tsx` - フォームテスト
  - バリデーション
  - 数値入力
- [ ] `use-image-area-editor.test.ts` - フックテスト
  - 状態管理
  - localStorage 保存・復元
- [ ] E2E テスト
  - 画像エリア編集の完全フロー
  - LINE API への送信確認

## Phase 12: ドキュメント

- [ ] `src/app/dashboard/message-items/card/_components/README.md` を更新
  - ImageAreaEditor コンポーネントの使用方法
  - 画像エリア機能の概要
- [ ] 使用例コンポーネント作成
  - `image-area-editor.example.tsx`
  - `image-area-canvas.example.tsx`
- [ ] CLAUDE.md を更新
  - 画像エリア機能の説明を追加

## Phase 13: デバッグとリファインメント

- [ ] デバッグパネル実装
  - 開発環境で画像エリアデータを表示
  - Imagemap メッセージペイロードを表示
- [ ] パフォーマンス最適化
  - Canvas 描画のデバウンス
  - メモ化の追加
- [ ] エラーハンドリング強化
  - Cloudinary API エラー
  - LINE API エラー

## Validation Checklist

- [ ] すべてのバリデーションルールが実装されている
- [ ] エラーメッセージが適切に表示される
- [ ] 画像範囲外への移動・リサイズが制限されている
- [ ] 最小サイズ(20x20px)が適用されている
- [ ] 最大領域数(10個)が適用されている
- [ ] テキストラベルの文字数制限(20文字)が適用されている

## Acceptance Criteria

- [ ] ユーザーが画像エリア分割機能を有効化できる
- [ ] ユーザーが画像上に最大10個の領域を追加できる
- [ ] ユーザーが各領域をドラッグ&リサイズできる
- [ ] ユーザーが各領域にテキストラベルを設定できる
- [ ] ユーザーが各領域にアクション(URI/Message/Postback)を設定できる
- [ ] ユーザーが領域を削除・並び替えできる
- [ ] テキストが Cloudinary で画像に合成される
- [ ] 画像エリア付きカードが LINE Imagemap メッセージとして送信される
- [ ] LINE アプリで正しく表示され、タップ可能である
- [ ] デスクトップ・タブレット・モバイルで動作する
- [ ] localStorage にデータが自動保存される
- [ ] ページリロード後にデータが復元される
