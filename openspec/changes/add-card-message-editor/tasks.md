# Implementation Tasks: Card Message Editor

## Phase 1: 基本構造とデータ型定義（0.5日）

### 1.1 型定義の作成
- [ ] 1.1.1 `src/app/dashboard/message-items/card/_components/types.ts` ファイル作成
  - [ ] CardType enum（Product, Location, Person, Image）
  - [ ] BaseCard インターフェース
  - [ ] ProductCard, LocationCard, PersonCard, ImageCard インターフェース
  - [ ] CardAction インターフェース（URI, Message, Postback）
  - [ ] CardFormState インターフェース

### 1.2 ユーティリティ関数の作成
- [ ] 1.2.1 `src/app/dashboard/message-items/card/_components/utils.ts` ファイル作成
  - [ ] バリデーション関数（validateCard, validateAction）
  - [ ] カードをLINE API形式に変換する関数（cardToCarouselColumn）
  - [ ] デフォルトカード生成関数（createDefaultCard）

## Phase 2: カードフォームコンポーネント（1.5日）

### 2.1 共通コンポーネントの作成
- [ ] 2.1.1 `src/app/dashboard/message-items/card/_components/action-editor.tsx` ファイル作成
  - [ ] アクションタイプ選択（URI/Message/Postback）
  - [ ] アクション追加・編集・削除
  - [ ] バリデーション表示
  - [ ] 最大3つの制限

### 2.2 商品タイプフォームの作成
- [ ] 2.2.1 `src/app/dashboard/message-items/card/_components/card-form-product.tsx` ファイル作成
  - [ ] タイトル入力（最大40文字）
  - [ ] 説明入力（最大60文字）
  - [ ] 価格入力（数値、オプション）
  - [ ] 画像アップロード（ImageUploader統合）
  - [ ] アクション設定（ActionEditor統合）

### 2.3 場所タイプフォームの作成
- [ ] 2.3.1 `src/app/dashboard/message-items/card/_components/card-form-location.tsx` ファイル作成
  - [ ] タイトル入力（最大40文字）
  - [ ] 住所入力（最大60文字）
  - [ ] 営業時間入力（最大60文字、オプション）
  - [ ] 画像アップロード
  - [ ] アクション設定

### 2.4 人物タイプフォームの作成
- [ ] 2.4.1 `src/app/dashboard/message-items/card/_components/card-form-person.tsx` ファイル作成
  - [ ] 名前入力（最大40文字）
  - [ ] 説明入力（最大60文字）
  - [ ] タグ入力（複数、各最大20文字）
  - [ ] 画像アップロード
  - [ ] アクション設定

### 2.5 画像タイプフォームの作成
- [ ] 2.5.1 `src/app/dashboard/message-items/card/_components/card-form-image.tsx` ファイル作成
  - [ ] 画像アップロード
  - [ ] タイトル入力（最大40文字、オプション）
  - [ ] 説明入力（最大60文字、オプション）
  - [ ] アクション設定

## Phase 3: カード管理機能（1日）

### 3.1 カード一覧コンポーネントの作成
- [ ] 3.1.1 `src/app/dashboard/message-items/card/_components/card-list.tsx` ファイル作成
  - [ ] カード一覧表示
  - [ ] カード選択機能
  - [ ] カード編集ボタン
  - [ ] カード削除ボタン
  - [ ] ドラッグ&ドロップ並び替え（react-beautiful-dnd等）

### 3.2 カードタイプ選択ダイアログの作成
- [ ] 3.2.1 `src/app/dashboard/message-items/card/_components/card-type-selector.tsx` ファイル作成
  - [ ] 4種類のカードタイプ表示
  - [ ] タイプ説明の表示
  - [ ] 選択時のコールバック

### 3.3 カードエディタメインコンポーネントの作成
- [ ] 3.3.1 `src/app/dashboard/message-items/card/_components/card-editor.tsx` ファイル作成
  - [ ] カード配列の状態管理
  - [ ] カード追加機能（最大9枚制限）
  - [ ] カード編集機能
  - [ ] カード削除機能（最低1枚制限）
  - [ ] カードタイプに応じた動的フォーム表示
  - [ ] 選択中のカード管理

## Phase 4: プレビュー機能（0.5日）

### 4.1 プレビューコンポーネントの作成
- [ ] 4.1.1 `src/app/dashboard/message-items/card/_components/card-preview.tsx` ファイル作成
  - [ ] カルーセル形式の表示
  - [ ] 横スクロール機能
  - [ ] 各カードタイプの適切な表示
  - [ ] リアルタイム更新

## Phase 5: バリデーションと送信機能（1日）

### 5.1 バリデーション実装
- [ ] 5.1.1 バリデーション関数の拡充
  - [ ] 必須項目チェック
  - [ ] 文字数制限チェック
  - [ ] URL形式チェック
  - [ ] カードタイプごとの特有バリデーション

### 5.2 LINE API変換処理
- [ ] 5.2.1 `utils.ts` にAPI変換関数を実装
  - [ ] 商品タイプの変換ロジック
  - [ ] 場所タイプの変換ロジック
  - [ ] 人物タイプの変換ロジック
  - [ ] 画像タイプの変換ロジック
  - [ ] Carousel Template形式への統合

### 5.3 送信処理の実装
- [ ] 5.3.1 送信ボタンとステータス管理
  - [ ] 送信前バリデーション実行
  - [ ] `/api/line/send` へのPOST
  - [ ] ローディング状態表示
  - [ ] 成功/エラー表示

## Phase 6: ページ統合（0.5日）

### 6.1 メインページの刷新
- [ ] 6.1.1 `src/app/dashboard/message-items/card/page.tsx` の全面書き換え
  - [ ] UserSelector統合
  - [ ] 代替テキスト入力
  - [ ] CardEditor統合
  - [ ] CardPreview統合
  - [ ] 送信処理
  - [ ] DebugPanel統合（開発環境）
  - [ ] レスポンシブレイアウト

## Phase 7: データ永続化（0.5日）

### 7.1 localStorage統合
- [ ] 7.1.1 `src/app/dashboard/message-items/card/_components/hooks/use-card-persistence.ts` ファイル作成
  - [ ] 自動保存フック（debounce 3秒）
  - [ ] データ復元
  - [ ] 送信成功時のクリア
  - [ ] 復元通知

## Phase 8: テストとドキュメント（1日）

### 8.1 ユニットテストの作成
- [ ] 8.1.1 型定義とユーティリティのテスト
  - [ ] バリデーション関数のテスト
  - [ ] API変換関数のテスト
- [ ] 8.1.2 コンポーネントのテスト
  - [ ] ActionEditorのテスト
  - [ ] 各カードフォームのテスト
  - [ ] CardListのテスト

### 8.2 統合テスト
- [ ] 8.2.1 手動テスト
  - [ ] 各カードタイプの作成・編集・削除
  - [ ] カードの並び替え
  - [ ] バリデーション動作
  - [ ] 送信処理
  - [ ] localStorage動作

### 8.3 ブラウザ互換性テスト
- [ ] 8.3.1 各ブラウザでのテスト
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### 8.4 実際のLINEでの確認
- [ ] 8.4.1 LINE アプリでの表示確認
  - [ ] 各カードタイプの表示
  - [ ] カルーセルのスクロール
  - [ ] アクションボタンの動作

### 8.5 ドキュメント作成
- [ ] 8.5.1 READMEコンポーネント
  - [ ] `src/app/dashboard/message-items/card/_components/README.md` 作成
  - [ ] 各コンポーネントの説明
  - [ ] 使用方法

## Phase 9: コードレビューと最終調整（0.5日）

### 9.1 コード品質チェック
- [ ] 9.1.1 ESLint実行
  - [ ] エラー/警告の修正
- [ ] 9.1.2 TypeScript型チェック
  - [ ] 型エラーの修正
- [ ] 9.1.3 テスト実行
  - [ ] 全テストパス確認

### 9.2 パフォーマンス最適化
- [ ] 9.2.1 レンダリング最適化
  - [ ] React.memo適用
  - [ ] useCallback/useMemo適用
  - [ ] 不要な再レンダリング削減

## 推定工数

- Phase 1: 0.5日
- Phase 2: 1.5日
- Phase 3: 1日
- Phase 4: 0.5日
- Phase 5: 1日
- Phase 6: 0.5日
- Phase 7: 0.5日
- Phase 8: 1日
- Phase 9: 0.5日

**合計: 7日**

## 依存関係

- ImageUploader コンポーネント（既存）
- UserSelector コンポーネント（既存）
- DebugPanel コンポーネント（既存）
- Cloudinary設定（既存）

## 備考

- 各フェーズは前のフェーズの完了を前提としている
- テストは各フェーズで並行して実施推奨
- モバイル対応は基本機能のみ（ドラッグ&ドロップは除外）
- ドラッグ&ドロップライブラリは `@dnd-kit/core` または `react-beautiful-dnd` を検討
