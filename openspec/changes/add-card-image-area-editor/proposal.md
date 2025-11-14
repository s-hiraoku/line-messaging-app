# Change: カードタイプメッセージの画像エリア分割エディタの追加

## Why

現在のカードタイプメッセージエディタ(商品、場所、人物、画像の4種類)では、カード画像は単一の画像として扱われ、画像全体が1つのタップ可能な領域となっています。

LINE Official Account Manager では、Product/Location カードで画像を複数の領域に分割し、各領域にテキストラベルとアクションを設定できる機能が提供されています。これにより、1枚の画像内で複数の異なる要素(例:商品の複数パーツ、施設の複数エリア)に個別のアクションを設定できます。

ユーザーが LINE Manager と同等の画像エリア分割機能を使用できるようにすることで、より柔軟で表現力の高いカードメッセージを作成可能にする必要があります。

## What Changes

- **画像エリア分割エディタの追加**
  - 画像上に複数のタップ可能な領域を定義
  - 各領域にテキストラベルを配置
  - 各領域に個別のアクション(URI, Message, Postback)を設定
  - ビジュアルエディタで領域をドラッグ&リサイズ

- **全カードタイプへの適用**
  - 商品タイプ(Product): 商品の複数パーツに個別アクション
  - 場所タイプ(Location): 施設の複数エリアに個別アクション
  - 人物タイプ(Person): 人物の複数要素に個別アクション
  - 画像タイプ(Image): 画像の複数領域に個別アクション

- **LINE Manager と同じUI/UX**
  - 画像プレビュー上での直感的な領域編集
  - テキストラベル配置機能
  - 座標・サイズの数値入力サポート
  - 領域の追加・削除・編集

- **既存カードエディタとの統合**
  - 既存の `card-editor.tsx` に画像エリア編集機能を追加
  - カードタイプごとのフォーム(`card-form-*.tsx`)に統合
  - 既存アクションボタン(最大3つ)との分離

## Impact

### Affected specs
- `card-message-editor` (既存の仕様を拡張)
- `card-image-area-editor` (新規作成)

### Affected code
- `src/app/dashboard/message-items/card/_components/` - 拡張
  - `card-form-product.tsx` - 画像エリアエディタ統合
  - `card-form-location.tsx` - 画像エリアエディタ統合
  - `card-form-person.tsx` - 画像エリアエディタ統合
  - `card-form-image.tsx` - 画像エリアエディタ統合
  - `image-area-editor.tsx` - 新規作成(メインエディタコンポーネント)
  - `image-area-canvas.tsx` - 新規作成(キャンバス描画)
  - `image-area-list.tsx` - 新規作成(領域リスト)
  - `image-area-form.tsx` - 新規作成(領域編集フォーム)
  - `types.ts` - ImageArea 型定義を追加
- `src/lib/line/` - 拡張
  - `message-schemas.ts` - カードメッセージスキーマに imageAreas を追加
  - `payload-normalizer.ts` - 画像エリア情報のLINE API形式への変換

### Migration path
- 既存のカードメッセージデータは引き続き動作(下位互換性維持)
- imageAreas が未定義の場合は従来の単一画像として動作
- 既存カードに画像エリア機能を追加する場合は編集画面で設定

### Dependencies
- **ImageCropUploader コンポーネント(既存)** - 画像のアップロード、クロップ、ズーム調整に使用
  - 各カードフォームで既に使用中
  - `onImageUploaded` コールバックで画像URLを取得
  - アスペクト比設定(SQUARE, LANDSCAPE, FREE)
- ActionEditor コンポーネント(既存)
- Cloudinary(画像アップロード・テキストオーバーレイ)
- 既存のカードエディタコンポーネント

### Testing requirements
- 各カードタイプでの画像エリア編集
- 領域の追加・編集・削除
- テキストラベル配置
- アクション設定
- LINE APIへの送信形式確認
- 実際のLINEアプリでの表示・タップ動作確認

### Breaking changes
なし - 既存機能への追加のみで、破壊的変更はありません
