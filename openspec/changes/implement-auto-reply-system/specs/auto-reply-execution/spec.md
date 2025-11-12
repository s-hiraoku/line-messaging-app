# Spec: Auto-Reply Execution

## Overview

LINE webhookでテキストメッセージを受信した際に、設定された応答ルールに基づいて自動的に応答メッセージを送信する機能を提供します。

## ADDED Requirements

### Requirement: キーワードマッチングによる応答

システムは受信したメッセージのキーワードマッチングを行い、適切な応答を返さなければならない (MUST)。

#### Scenario: 部分一致での応答

**Given** 以下の応答ルールが設定されている:
- キーワード: ["営業時間"]
- マッチタイプ: CONTAINS(部分一致)
- 応答メッセージ: "営業時間は平日9:00-18:00です"
- 有効: true

**When** ユーザーが"営業時間を教えてください"というメッセージを送信する
**Then**
- メッセージが"営業時間"キーワードにマッチする
- 応答メッセージ"営業時間は平日9:00-18:00です"が送信される
- 応答ログが記録される

#### Scenario: 完全一致での応答

**Given** 以下の応答ルールが設定されている:
- キーワード: ["営業時間"]
- マッチタイプ: EXACT(完全一致)
- 応答メッセージ: "営業時間は平日9:00-18:00です"
- 有効: true

**When** ユーザーが"営業時間"というメッセージを送信する
**Then**
- メッセージが完全一致する
- 応答メッセージが送信される

**When** ユーザーが"営業時間を教えてください"というメッセージを送信する
**Then**
- メッセージがマッチしない
- 応答メッセージは送信されない

#### Scenario: 前方一致での応答

**Given** 以下の応答ルールが設定されている:
- キーワード: ["お問い合わせ"]
- マッチタイプ: STARTS_WITH(前方一致)
- 応答メッセージ: "お問い合わせありがとうございます"
- 有効: true

**When** ユーザーが"お問い合わせフォームはどこですか"というメッセージを送信する
**Then**
- メッセージが前方一致する
- 応答メッセージが送信される

**When** ユーザーが"これについてお問い合わせしたい"というメッセージを送信する
**Then**
- メッセージが前方一致しない
- 応答メッセージは送信されない

#### Scenario: 後方一致での応答

**Given** 以下の応答ルールが設定されている:
- キーワード: ["ありがとう"]
- マッチタイプ: ENDS_WITH(後方一致)
- 応答メッセージ: "どういたしまして"
- 有効: true

**When** ユーザーが"教えてくれてありがとう"というメッセージを送信する
**Then**
- メッセージが後方一致する
- 応答メッセージが送信される

**When** ユーザーが"ありがとうございます"というメッセージを送信する
**Then**
- メッセージが後方一致しない(完全一致でない)
- 応答メッセージは送信されない

### Requirement: 優先度に基づく応答選択

システムは複数のルールがマッチした場合、優先度が最も高いルールを使用しなければならない (MUST)。

#### Scenario: 優先度順での応答選択

**Given** 以下の応答ルールが設定されている:
1. キーワード: ["営業"], 優先度: 100, 応答: "営業に関する一般的な回答"
2. キーワード: ["営業時間"], 優先度: 50, 応答: "営業時間は平日9:00-18:00です"

**And** 両方のルールが有効である
**When** ユーザーが"営業時間を教えてください"というメッセージを送信する
**Then**
- 両方のルールがマッチする
- 優先度が高い(数値が小さい)ルール2が選択される
- 応答メッセージ"営業時間は平日9:00-18:00です"が送信される

#### Scenario: 同じ優先度の場合の処理

**Given** 以下の応答ルールが設定されている:
1. キーワード: ["営業時間"], 優先度: 100, 作成日時: 2025-01-01
2. キーワード: ["営業"], 優先度: 100, 作成日時: 2025-01-02

**And** 両方のルールが有効である
**When** ユーザーが"営業時間を教えてください"というメッセージを送信する
**Then**
- 両方のルールがマッチする
- 同じ優先度の場合、作成日時が新しいルール2が選択される
- ルール2の応答メッセージが送信される

### Requirement: デフォルト応答の処理

システムはマッチするルールがない場合のデフォルト応答を処理しなければならない (MUST)。

#### Scenario: デフォルト応答の送信

**Given** デフォルト応答が設定されている:
- 応答メッセージ: "お問い合わせありがとうございます。担当者が確認次第ご返信いたします。"
- 有効: true

**And** どの応答ルールにもマッチしない
**When** ユーザーが"こんにちは"というメッセージを送信する
**Then**
- どのルールにもマッチしない
- デフォルト応答が送信される
- 応答ログが記録される(autoReplyId: "default")

#### Scenario: デフォルト応答が無効な場合

**Given** デフォルト応答が無効になっている
**And** どの応答ルールにもマッチしない
**When** ユーザーが"こんにちは"というメッセージを送信する
**Then**
- どのルールにもマッチしない
- 応答メッセージは送信されない
- ログは記録されない

### Requirement: 無効なルールの除外

システムは無効化されたルールをマッチング処理から除外しなければならない (MUST)。

#### Scenario: 無効なルールはマッチングされない

**Given** 以下の応答ルールが設定されている:
- キーワード: ["営業時間"]
- マッチタイプ: CONTAINS
- 応答メッセージ: "営業時間は平日9:00-18:00です"
- 有効: false

**When** ユーザーが"営業時間を教えてください"というメッセージを送信する
**Then**
- ルールが無効なためマッチングされない
- 応答メッセージは送信されない
- デフォルト応答(設定されている場合)が使用される

### Requirement: 大文字小文字を区別しないマッチング

システムはキーワードマッチングを大文字小文字を区別せずに行わなければならない (MUST)。

#### Scenario: 大文字小文字の違いを無視したマッチング

**Given** 以下の応答ルールが設定されている:
- キーワード: ["hello"]
- マッチタイプ: CONTAINS
- 応答メッセージ: "Hello!"

**When** ユーザーが以下のメッセージを送信する:
- "HELLO"
- "Hello"
- "hello"
- "HeLLo"

**Then** 全てのケースで応答メッセージが送信される

### Requirement: 複数キーワードのOR条件マッチング

システムはルールに複数のキーワードが設定されている場合、いずれか1つにマッチすれば応答しなければならない (MUST)。

#### Scenario: 複数キーワードのいずれかでマッチング

**Given** 以下の応答ルールが設定されている:
- キーワード: ["営業時間", "何時まで", "何時から"]
- マッチタイプ: CONTAINS
- 応答メッセージ: "営業時間は平日9:00-18:00です"

**When** ユーザーが以下のいずれかのメッセージを送信する:
- "営業時間を教えてください"
- "何時までやっていますか"
- "何時から開いていますか"

**Then** いずれのケースでも応答メッセージが送信される

### Requirement: エラーハンドリング

システムは応答送信時のエラーを適切に処理し、webhook処理を継続しなければならない (MUST)。

#### Scenario: 応答送信失敗時の処理

**Given** 応答ルールがマッチした
**When** LINE APIへの応答送信がネットワークエラーで失敗する
**Then**
- エラーが発生してもwebhook処理は正常に完了する(200を返す)
- エラーログが記録される:
  - autoReplyId
  - userId
  - inboundMessage
  - replySent: false
  - errorMessage: エラーメッセージ

#### Scenario: 無効なreplyTokenの処理

**Given** 応答ルールがマッチした
**When** replyTokenが既に使用済みまたは無効である
**Then**
- エラーが記録される
- webhook処理は正常に完了する
- 次回のメッセージで再試行される

### Requirement: テキストメッセージのみ処理

システムは自動応答をテキストメッセージのみを対象にしなければならない (MUST)。

#### Scenario: 画像メッセージは処理しない

**Given** 応答ルールが設定されている
**When** ユーザーが画像メッセージを送信する
**Then**
- 自動応答処理は実行されない
- 画像メッセージは通常通り記録される

#### Scenario: スタンプメッセージは処理しない

**Given** 応答ルールが設定されている
**When** ユーザーがスタンプを送信する
**Then**
- 自動応答処理は実行されない
- スタンプメッセージは通常通り記録される

### Requirement: 応答ログの記録

システムは全ての自動応答実行結果をログに記録しなければならない (MUST)。

#### Scenario: 成功した応答のログ記録

**Given** 応答ルールがマッチした
**When** 応答メッセージが正常に送信される
**Then** 以下の情報がログに記録される:
- autoReplyId: マッチしたルールのID
- userId: ユーザーID
- inboundMessage: 受信したメッセージ
- matchedKeyword: マッチしたキーワード
- replySent: true
- errorMessage: null
- createdAt: ログ作成日時

#### Scenario: 失敗した応答のログ記録

**Given** 応答ルールがマッチした
**When** 応答メッセージの送信が失敗する
**Then** 以下の情報がログに記録される:
- autoReplyId: マッチしたルールのID
- userId: ユーザーID
- inboundMessage: 受信したメッセージ
- matchedKeyword: マッチしたキーワード
- replySent: false
- errorMessage: エラーの詳細
- createdAt: ログ作成日時

## Technical Details

### Data Model

```prisma
model AutoReplyLog {
  id              String    @id @default(cuid())
  autoReply       AutoReply @relation(fields: [autoReplyId], references: [id], onDelete: Cascade)
  autoReplyId     String
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  inboundMessage  String
  matchedKeyword  String?
  replySent       Boolean   @default(true)
  errorMessage    String?
  createdAt       DateTime  @default(now())

  @@index([createdAt])
  @@index([autoReplyId, createdAt])
  @@index([userId, createdAt])
}
```

### Matching Logic Flow

```
1. 受信メッセージがテキストかチェック
   └─ NO → 処理終了

2. メッセージを正規化(小文字化、トリム)

3. 有効な応答ルールを取得(優先度順、作成日時順)

4. 各ルールに対してマッチング試行
   ├─ キーワード配列をループ
   │   ├─ キーワードを正規化
   │   └─ matchTypeに応じてマッチング
   │       ├─ EXACT: message === keyword
   │       ├─ CONTAINS: message.includes(keyword)
   │       ├─ STARTS_WITH: message.startsWith(keyword)
   │       └─ ENDS_WITH: message.endsWith(keyword)
   └─ マッチした場合 → 応答送信へ

5. マッチしない場合、デフォルト応答をチェック
   ├─ デフォルト応答が有効 → 応答送信へ
   └─ 無効 → 処理終了

6. 応答送信
   ├─ LINE APIにreplyMessage
   ├─ 成功 → ログ記録(replySent: true)
   └─ 失敗 → エラーログ記録(replySent: false)

7. 処理完了(常に200を返す)
```

### Integration with Webhook

`src/app/api/line/webhook/route.ts`での統合:

```typescript
// Before (現在の実装)
case "message": {
  if (event.message.type === "text") {
    // ... ユーザー情報の取得・保存 ...

    // 固定の応答メッセージ
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: "メッセージありがとうございます!",
    });
  }
  break;
}

// After (自動応答システム統合後)
case "message": {
  if (event.message.type === "text") {
    // ... ユーザー情報の取得・保存 ...

    // 自動応答システムを実行
    await executeAutoReply(client, event, user.id);
  }
  break;
}
```

### Error Handling Strategy

1. **Graceful Degradation**: エラー発生時もwebhook処理は継続
2. **Detailed Logging**: 全てのエラーをログに記録
3. **No Retry in Webhook**: replyTokenは1回限りなので、webhookでのリトライは行わない
4. **Monitoring**: エラーログを監視し、問題を早期発見

### Performance Considerations

- **Database Query Optimization**: インデックスを活用した高速なルール取得
- **Early Exit**: マッチした時点で処理を終了
- **Caching**: 応答ルールをキャッシュ(5分間)
- **Timeout**: 応答送信は最大5秒でタイムアウト
