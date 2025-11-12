# Design: Auto-Reply System

## Architecture Overview

自動応答システムは3つの主要コンポーネントで構成されます:

1. **Data Layer**: Prismaを使用したデータモデル
2. **Business Logic Layer**: 応答ルールのマッチングと実行エンジン
3. **Presentation Layer**: Next.js App Routerベースの管理UI

## Data Model

### AutoReply Table

```prisma
model AutoReply {
  id          String   @id @default(cuid())
  name        String   // ルールの名前(例: "営業時間外の問い合わせ")
  keywords    String[] // マッチングキーワード配列
  replyText   String   // 応答メッセージ
  priority    Int      @default(100) // 優先度(低い数値が高優先度)
  isActive    Boolean  @default(true) // 有効/無効
  matchType   MatchType @default(CONTAINS) // マッチングタイプ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  logs        AutoReplyLog[]
}

enum MatchType {
  EXACT       // 完全一致
  CONTAINS    // 部分一致
  STARTS_WITH // 前方一致
  ENDS_WITH   // 後方一致
}
```

### AutoReplyLog Table

```prisma
model AutoReplyLog {
  id              String    @id @default(cuid())
  autoReply       AutoReply @relation(fields: [autoReplyId], references: [id], onDelete: Cascade)
  autoReplyId     String
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  inboundMessage  String    // 受信メッセージ
  matchedKeyword  String?   // マッチしたキーワード
  replySent       Boolean   @default(true) // 応答が送信されたか
  errorMessage    String?   // エラーがあった場合のメッセージ
  createdAt       DateTime  @default(now())
}
```

### DefaultAutoReply Table

```prisma
model DefaultAutoReply {
  id          String   @id @default("default")
  replyText   String?  // デフォルト応答メッセージ(nullの場合は応答しない)
  isActive    Boolean  @default(false) // デフォルト応答を有効にするか
  updatedAt   DateTime @updatedAt
}
```

## Business Logic

### Matching Engine

```typescript
// src/lib/auto-reply/matcher.ts

interface MatchResult {
  matched: boolean;
  autoReply?: AutoReply;
  matchedKeyword?: string;
}

async function findMatchingReply(message: string): Promise<MatchResult> {
  // 1. 有効な応答ルールを優先度順で取得
  const rules = await prisma.autoReply.findMany({
    where: { isActive: true },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  // 2. メッセージを正規化(小文字化、トリム)
  const normalizedMessage = message.toLowerCase().trim();

  // 3. 各ルールに対してマッチングを試行
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();

      const isMatch = matchByType(
        normalizedMessage,
        normalizedKeyword,
        rule.matchType
      );

      if (isMatch) {
        return {
          matched: true,
          autoReply: rule,
          matchedKeyword: keyword
        };
      }
    }
  }

  // 4. マッチしない場合はデフォルト応答を確認
  const defaultReply = await prisma.defaultAutoReply.findUnique({
    where: { id: 'default' }
  });

  if (defaultReply?.isActive && defaultReply.replyText) {
    return {
      matched: true,
      autoReply: {
        id: 'default',
        name: 'Default Reply',
        replyText: defaultReply.replyText,
        // ... other fields
      } as AutoReply
    };
  }

  return { matched: false };
}

function matchByType(
  message: string,
  keyword: string,
  matchType: MatchType
): boolean {
  switch (matchType) {
    case 'EXACT':
      return message === keyword;
    case 'CONTAINS':
      return message.includes(keyword);
    case 'STARTS_WITH':
      return message.startsWith(keyword);
    case 'ENDS_WITH':
      return message.endsWith(keyword);
    default:
      return false;
  }
}
```

### Execution Engine

```typescript
// src/lib/auto-reply/executor.ts

async function executeAutoReply(
  client: messagingApi.MessagingApiClient,
  event: MessageEvent,
  userId: string
): Promise<void> {
  if (event.message.type !== 'text') {
    return; // テキストメッセージのみ処理
  }

  const matchResult = await findMatchingReply(event.message.text);

  if (!matchResult.matched || !matchResult.autoReply) {
    // マッチしない場合は何もしない
    return;
  }

  try {
    // 応答メッセージを送信
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: 'text',
        text: matchResult.autoReply.replyText
      }]
    });

    // ログを記録
    await prisma.autoReplyLog.create({
      data: {
        autoReplyId: matchResult.autoReply.id,
        userId: userId,
        inboundMessage: event.message.text,
        matchedKeyword: matchResult.matchedKeyword,
        replySent: true
      }
    });

    addLog('info', 'auto-reply:sent', {
      userId,
      ruleId: matchResult.autoReply.id,
      ruleName: matchResult.autoReply.name
    });
  } catch (error) {
    // エラーログを記録
    await prisma.autoReplyLog.create({
      data: {
        autoReplyId: matchResult.autoReply.id,
        userId: userId,
        inboundMessage: event.message.text,
        matchedKeyword: matchResult.matchedKeyword,
        replySent: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });

    addLog('error', 'auto-reply:failed', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
```

## API Endpoints

### Auto-Reply Management

```
GET    /api/auto-reply          # 応答ルール一覧を取得
POST   /api/auto-reply          # 新しい応答ルールを作成
GET    /api/auto-reply/[id]     # 特定の応答ルールを取得
PUT    /api/auto-reply/[id]     # 応答ルールを更新
DELETE /api/auto-reply/[id]     # 応答ルールを削除
PATCH  /api/auto-reply/[id]/toggle  # 有効/無効を切り替え
```

### Default Reply Management

```
GET    /api/auto-reply/default  # デフォルト応答を取得
PUT    /api/auto-reply/default  # デフォルト応答を更新
```

### Analytics

```
GET    /api/auto-reply/analytics      # 応答履歴の統計を取得
GET    /api/auto-reply/logs           # 応答ログ一覧を取得
GET    /api/auto-reply/[id]/logs      # 特定ルールの応答ログを取得
```

## UI Components

### Dashboard Page

```
/dashboard/auto-reply
├── 応答ルール一覧
│   ├── ルール名
│   ├── キーワード(表示は最初の3つまで)
│   ├── 優先度
│   ├── 有効/無効トグル
│   └── アクション(編集/削除)
├── 新規作成ボタン
└── デフォルト応答設定セクション
```

### Create/Edit Form

```
応答ルール設定フォーム
├── ルール名(必須)
├── キーワード(配列、最低1つ必須)
│   └── タグ入力UI(追加/削除可能)
├── マッチングタイプ(選択)
│   ├── 部分一致(デフォルト)
│   ├── 完全一致
│   ├── 前方一致
│   └── 後方一致
├── 応答メッセージ(必須、textarea)
├── 優先度(数値入力、デフォルト100)
├── 有効/無効(チェックボックス)
└── プレビュー機能
    └── テストメッセージを入力してマッチング結果を確認
```

### Analytics Page

```
/dashboard/auto-reply/analytics
├── 期間選択(日/週/月)
├── サマリーカード
│   ├── 総応答数
│   ├── 最も使用されたルール
│   ├── 応答成功率
│   └── 平均応答時間
├── ルール別使用状況(グラフ)
└── 応答ログテーブル
    ├── 日時
    ├── ユーザー
    ├── 受信メッセージ
    ├── 使用されたルール
    └── ステータス
```

## Performance Considerations

### Database Indexing

```prisma
model AutoReply {
  @@index([isActive, priority, createdAt])
}

model AutoReplyLog {
  @@index([createdAt])
  @@index([autoReplyId, createdAt])
  @@index([userId, createdAt])
}
```

### Caching Strategy

- **応答ルールのキャッシュ**: Redisに5分間キャッシュ
- **キャッシュ無効化**: ルールの作成/更新/削除時にクリア
- **ホットパスの最適化**: 頻繁に使用されるルールを優先的にキャッシュ

### Rate Limiting

- ユーザーごとに1分間に最大10回の自動応答
- 同一ユーザーに対して同じルールを連続して適用しない(クールダウン期間: 5分)

## Security Considerations

### Input Validation

- キーワードの長さ制限(最大100文字)
- 応答メッセージの長さ制限(最大5000文字、LINE制限に準拠)
- XSS対策: 入力のサニタイズ

### Authorization

- 管理UIへのアクセスは認証必須
- 応答ルールの作成/編集/削除は管理者権限が必要

### Logging

- すべての自動応答をログに記録
- 不正なパターン(過度な応答など)を検出・アラート

## Error Handling

### Webhook Processing

- 応答送信失敗時もwebhookは正常に完了(200を返す)
- エラーはログに記録し、管理画面で確認可能

### Graceful Degradation

- データベース接続エラー時は固定の応答を返す
- 応答ルールの取得エラー時はデフォルト応答にフォールバック

## Testing Strategy

### Unit Tests

- マッチングロジックのテスト(各マッチタイプ)
- 優先度順のソートのテスト
- エッジケース(空文字、特殊文字など)のテスト

### Integration Tests

- Webhook→マッチング→応答送信の一連のフロー
- データベース操作のテスト
- API エンドポイントのテスト

### E2E Tests

- 管理画面での応答ルール作成フロー
- 実際のメッセージ受信と応答のテスト

## Future Enhancements

1. **正規表現サポート**: より高度なパターンマッチング
2. **時間ベースのルール**: 営業時間や曜日による応答の切り替え
3. **A/Bテスト**: 複数の応答を試して効果測定
4. **機械学習統合**: ユーザーの意図を自動で判定
5. **マルチメディア応答**: 画像や動画を含む応答
