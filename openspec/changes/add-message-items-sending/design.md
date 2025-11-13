# Design: Message Items Sending Feature

## Context

LINE Official Account Manager (https://manager.line.biz/) では、視覚的に魅力的なメッセージアイテムを作成できます：

1. **リッチメッセージ**: 画像全体または特定の領域にタップアクションを設定できるメッセージ
2. **カードタイプメッセージ**: 複数のカード（最大9枚）を横スワイプで表示するカルーセル形式

これらのメッセージアイテムは、LINE Manager で作成後に「メッセージID」が発行されます。このIDを使用して Messaging API 経由で送信できることが期待されます。

### Constraints
- LINE Messaging API の公式ドキュメント: https://developers.line.biz/ja/reference/messaging-api/
- 既存のメッセージ送信実装: `src/app/api/line/send/route.ts`、`src/lib/line/client.ts`
- メッセージスキーマ: `src/lib/line/message-schemas.ts`

## Goals / Non-Goals

### Goals
1. LINE Manager で作成したメッセージアイテムを個別ユーザーに送信できる機能の実装
2. 既存のメッセージ送信パターンとの一貫性を保つ
3. ユーザー選択UIの再利用可能なコンポーネント化

### Non-Goals
- メッセージアイテムの作成・編集機能
- メッセージアイテムのプレビュー表示
- 一斉配信（ブロードキャスト）機能

## Decisions

### Decision 1: LINE Messaging API の調査

**調査項目**:

1. **リッチメッセージの送信方法**:
   - 参考: https://developers.line.biz/ja/reference/messaging-api/#send-rich-message
   - エンドポイント: `POST https://api.line.me/v2/bot/message/push`
   - リクエストボディでのメッセージID指定方法
   - 想定: `{ type: "richMessage", richMessageId: "..." }` のような形式

2. **カードタイプメッセージの送信方法**:
   - 参考: https://developers.line.biz/ja/docs/messaging-api/using-card-type-messages/
   - Narrowcast API の使用が必要か、通常の push メッセージで送信可能か
   - 想定: `{ type: "cardType", cardTypeId: "..." }` のような形式

3. **エラーレスポンスの確認**:
   - 無効なメッセージIDの場合のエラーコード
   - メッセージアイテムが削除されている場合のエラーハンドリング

**実装前のタスク**:
- [ ] LINE Messaging API ドキュメントの精読
- [ ] サンプルリクエストの作成とテスト
- [ ] エラーケースの確認

### Decision 2: API エンドポイントの設計

**Option A: 既存の `/api/line/send` を拡張**
- Pros: 一貫性がある、既存のバリデーション・ロギングを活用できる
- Cons: ペイロードスキーマが複雑化する

**Option B: 新規エンドポイント `/api/line/send-item` を作成**
- Pros: シンプルなペイロード、メッセージアイテム専用の処理を分離
- Cons: エンドポイントが増える、共通処理の重複の可能性

**選択: Option A（既存エンドポイントを拡張）**

理由:
- 既存の送信パターンとの一貫性
- `payloadSchema` に新しいスキーマを追加するだけで対応可能
- エラーハンドリング、ロギング、DB永続化のロジックを再利用できる

**実装案**:
```typescript
// src/lib/line/message-schemas.ts に追加
export const richMessagePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("richMessage"),
  richMessageId: z.string().min(1),
});

export const cardTypeMessagePayloadSchema = z.object({
  to: z.string().min(1),
  type: z.literal("cardType"),
  cardTypeId: z.string().min(1),
});

// payloadSchema を拡張
export const payloadSchema = z.union([
  // ... 既存のスキーマ
  richMessagePayloadSchema,
  cardTypeMessagePayloadSchema,
]);
```

### Decision 3: ユーザー選択UIコンポーネント

**要件**:
- ユーザー一覧から検索・選択
- 表示名、lineUserId、アイコン画像を表示
- 他のメッセージ送信ページでも再利用可能

**実装方針**:
- **コンポーネント名**: `UserSelector`
- **配置場所**: `src/app/dashboard/_components/user-selector.tsx`
- **使用ライブラリ**: Radix UI の `Combobox` または `Command` コンポーネント
- **API呼び出し**: `/api/users?q={searchTerm}` でサーバーサイド検索

**コンポーネントインターフェース**:
```typescript
interface UserSelectorProps {
  value?: string; // selected lineUserId
  onValueChange: (lineUserId: string) => void;
  placeholder?: string;
}
```

### Decision 4: データモデルの拡張

**既存の `Message` モデル**:
```prisma
model Message {
  type          MessageType      # TEXT, IMAGE, VIDEO, etc.
  content       Json
  // ...
}

enum MessageType {
  TEXT, IMAGE, VIDEO, AUDIO, LOCATION, STICKER, IMAGEMAP, FLEX, TEMPLATE
}
```

**オプション A: 既存の `FLEX` または `TEMPLATE` タイプを使用**
- Pros: マイグレーション不要
- Cons: メッセージアイテムと通常のメッセージの区別がつきにくい

**オプション B: 新しいタイプを追加**
```prisma
enum MessageType {
  // ... 既存
  RICH_MESSAGE,
  CARD_TYPE,
}
```
- Pros: 明確な区別、分析しやすい
- Cons: マイグレーションが必要

**選択: Option B（新しいタイプを追加）**

理由:
- メッセージアイテムは LINE Manager で作成された特殊なメッセージとして扱うべき
- 将来的な分析や統計で区別できることが重要

**`content` フィールドの構造**:
```typescript
// Rich Message
{
  type: "richMessage",
  richMessageId: "rm-xxxx",
}

// Card Type Message
{
  type: "cardType",
  cardTypeId: "ct-xxxx",
}
```

### Decision 5: ページ構成とナビゲーション

**新規ページ**:
- **パス**: `/dashboard/message-items`
- **配置**: `src/app/dashboard/message-items/page.tsx`

**ナビゲーション追加**:
- `src/app/dashboard/layout.tsx` のサイドバーに「メッセージアイテム」メニューを追加
- アイコン: `MessageSquare` または `LayoutGrid`
- 配置: 「メッセージ管理」セクション内

## Risks / Trade-offs

### Risk 1: LINE API 仕様の不明確さ
- **リスク**: メッセージアイテムの送信方法が想定と異なる可能性
- **影響度**: High
- **緩和策**: 実装前に公式ドキュメントの精読とサンプル実装での検証

### Risk 2: メッセージアイテムのプレビューなし
- **リスク**: ユーザーがメッセージIDだけでは内容を把握できない
- **影響度**: Medium
- **緩和策**: メッセージIDと共にメモやタグを保存できる機能の追加を検討（将来的）

### Risk 3: エラーハンドリングの複雑化
- **リスク**: 無効なメッセージID、削除されたメッセージアイテムのエラー処理
- **影響度**: Medium
- **緩和策**: 詳細なエラーメッセージとデバッグパネルでの情報表示

## Migration Plan

### Phase 1: 調査フェーズ
1. LINE Messaging API ドキュメントの精読
2. サンプルリクエストの作成とテスト
3. エラーケースの確認

### Phase 2: 基盤実装
1. `MessageType` enum の拡張とマイグレーション
2. メッセージアイテム用のスキーマ追加
3. ユーザー選択コンポーネントの実装

### Phase 3: 機能実装
1. メッセージアイテム送信ページの作成
2. API エンドポイントの拡張
3. LINE クライアントの送信処理追加

### Phase 4: 統合とテスト
1. ナビゲーションへの追加
2. デバッグパネルの実装
3. 統合テストの実施

### Rollback Plan
- データベースマイグレーションのロールバックスクリプト
- 新規ページの削除（既存機能への影響なし）
- ナビゲーションメニューの削除

## Open Questions

1. **Q: リッチメッセージとカードタイプメッセージの送信方法は同じAPIエンドポイントか？**
   - A: 調査フェーズで確認

2. **Q: メッセージアイテムIDのフォーマットは？**
   - A: 調査フェーズで確認し、バリデーションルールを定義

3. **Q: メッセージアイテムのプレビュー取得APIは存在するか？**
   - A: 初期バージョンでは対応しないが、将来的な拡張として調査

4. **Q: 一斉配信（ブロードキャスト）への対応は？**
   - A: 初期バージョンでは個別送信のみ。将来的な拡張として検討

## References

- [LINE Messaging API - Imagemap Message](https://developers.line.biz/ja/reference/messaging-api/#imagemap-message)
- [LINE Messaging API Reference](https://developers.line.biz/ja/reference/messaging-api/)
- [LINE Official Account Manager](https://manager.line.biz/)
- Existing implementation: `src/app/api/line/send/route.ts`
- Message schemas: `src/lib/line/message-schemas.ts`
