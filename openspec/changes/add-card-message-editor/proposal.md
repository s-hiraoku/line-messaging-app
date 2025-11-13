# Change: カードタイプメッセージエディタの追加

## Why

現在のカードメッセージ送信機能は、3つの固定カードをハードコードで送信する簡易実装になっています。LINE Official Account Managerでは、4種類のカードタイプ（商品、場所、人物、画像）を選択し、最大9枚のカードを動的に作成・編集できるビジュアルエディタが提供されています。

ユーザーが同等の機能を使用して、柔軟にカードタイプメッセージを作成・送信できるようにする必要があります。

## What Changes

- **カードタイプ選択機能の追加**
  - 商品タイプ（Product）: タイトル、説明、価格、画像
  - 場所タイプ（Location）: タイトル、住所、営業時間、画像
  - 人物タイプ（Person）: 名前、説明、タグ、画像
  - 画像タイプ（Image）: 画像中心の表示

- **カード動的管理機能**
  - カードの追加・編集・削除（最大9枚）
  - カードの並び替え
  - カードタイプごとの専用フォーム

- **アクション設定機能**
  - 各カードに最大3つのアクションボタン
  - アクションタイプ: URI、Message、Postback
  - タイトル・タップ領域へのアクション設定

- **ビジュアルエディタUI**
  - カルーセルプレビュー
  - リアルタイム更新
  - バリデーション表示

- **既存実装の置き換え**
  - `src/app/dashboard/message-items/card/page.tsx` を全面的に刷新

## Impact

### Affected specs
- `card-message-editor` (新規作成)

### Affected code
- `src/app/dashboard/message-items/card/page.tsx` - 全面的に刷新
- `src/app/dashboard/message-items/card/_components/` - 新規作成
  - `card-editor.tsx` - メインエディタコンポーネント
  - `card-form-product.tsx` - 商品タイプフォーム
  - `card-form-location.tsx` - 場所タイプフォーム
  - `card-form-person.tsx` - 人物タイプフォーム
  - `card-form-image.tsx` - 画像タイプフォーム
  - `card-list.tsx` - カード一覧
  - `card-preview.tsx` - プレビュー
  - `action-editor.tsx` - アクション設定

### Migration path
- 既存の簡易実装を置き換えるため、既存ユーザーへの影響はなし
- 既存のAPIエンドポイント (`/api/line/send`) はそのまま利用

### Dependencies
- ImageUploader コンポーネント（既存）
- UserSelector コンポーネント（既存）
- Cloudinary（画像アップロード）

### Testing requirements
- 各カードタイプの入力・バリデーション
- カードの追加・編集・削除・並び替え
- アクション設定
- LINE APIへの送信
- 実際のLINEアプリでの表示確認
