# Spec: Auto-Reply Management

## Overview

管理者が自動応答ルールを作成、編集、削除、管理できる機能を提供します。ルールにはキーワード、マッチングタイプ、優先度、応答メッセージなどを設定できます。

## ADDED Requirements

### Requirement: 応答ルールの作成

システムは管理者が新しい自動応答ルールを作成できるようにしなければならない (MUST)。

#### Scenario: 基本的な応答ルールの作成

**Given** 管理者が応答ルール作成画面にアクセスしている
**When** 以下の情報を入力して保存する:
- ルール名: "営業時間の問い合わせ"
- キーワード: ["営業時間", "何時まで", "いつまで"]
- マッチングタイプ: "部分一致"
- 応答メッセージ: "営業時間は平日9:00-18:00です"
- 優先度: 100
- 有効/無効: 有効

**Then**
- ルールがデータベースに保存される
- 一覧画面に新しいルールが表示される
- 成功メッセージが表示される

#### Scenario: 必須項目のバリデーション

**Given** 管理者が応答ルール作成画面にアクセスしている
**When** ルール名を空欄のまま保存しようとする
**Then**
- バリデーションエラーが表示される
- "ルール名は必須です"というメッセージが表示される
- データは保存されない

#### Scenario: キーワードの複数登録

**Given** 管理者が応答ルール作成画面にアクセスしている
**When** キーワードフィールドに複数のキーワードを追加する:
- "営業時間"
- "何時から"
- "何時まで"

**Then**
- 全てのキーワードがタグ形式で表示される
- 各キーワードに削除ボタンが表示される
- 最低1つのキーワードが必須である

### Requirement: 応答ルールの編集

システムは管理者が既存の自動応答ルールを編集できるようにしなければならない (MUST)。

#### Scenario: ルールの内容変更

**Given** 既存の応答ルール"営業時間の問い合わせ"がある
**When** 管理者がルールを編集して以下を変更する:
- 応答メッセージを"営業時間は平日9:00-18:00、土曜日9:00-15:00です"に更新

**Then**
- 更新された内容がデータベースに保存される
- 一覧画面に反映される
- 既存のログデータには影響しない

#### Scenario: 優先度の変更

**Given** 複数の応答ルールが存在する
**When** 管理者がルールの優先度を50に変更する
**Then**
- 優先度が更新される
- 一覧画面で優先度順にソートされる
- 次回のマッチング時に新しい優先度が適用される

### Requirement: 応答ルールの削除

システムは管理者が不要な自動応答ルールを削除できるようにしなければならない (MUST)。

#### Scenario: ルールの削除

**Given** 応答ルール"営業時間の問い合わせ"が存在する
**When** 管理者が削除ボタンをクリックして確認する
**Then**
- 確認ダイアログが表示される
- 確認後、ルールがデータベースから削除される
- 一覧画面から削除される
- 関連するログは保持される(履歴として)

#### Scenario: 削除のキャンセル

**Given** 応答ルール"営業時間の問い合わせ"が存在する
**When** 管理者が削除ボタンをクリックしてキャンセルする
**Then**
- 確認ダイアログが閉じる
- ルールは削除されない
- 一覧画面に引き続き表示される

### Requirement: 応答ルールの有効/無効切り替え

システムは管理者が応答ルールを削除せずに一時的に無効化できるようにしなければならない (MUST)。

#### Scenario: ルールの無効化

**Given** 有効な応答ルール"営業時間の問い合わせ"が存在する
**When** 管理者が有効/無効トグルをクリックする
**Then**
- ルールが無効状態になる
- 一覧画面で無効であることが視覚的に示される(グレーアウトなど)
- 無効なルールはマッチング処理で使用されない

#### Scenario: ルールの再有効化

**Given** 無効な応答ルール"営業時間の問い合わせ"が存在する
**When** 管理者が有効/無効トグルをクリックする
**Then**
- ルールが有効状態になる
- 一覧画面で通常の表示に戻る
- マッチング処理で使用されるようになる

### Requirement: 応答ルール一覧の表示

システムは管理者が全ての応答ルールを一覧で確認できるようにしなければならない (MUST)。

#### Scenario: 一覧の基本表示

**Given** 複数の応答ルールが存在する
**When** 管理者が応答ルール一覧ページにアクセスする
**Then**
- 全てのルールが表示される
- 各ルールに以下の情報が表示される:
  - ルール名
  - キーワード(最初の3つまで、それ以上は"...他N個"と表示)
  - 優先度
  - 有効/無効ステータス
  - 最終更新日時
- 優先度順(昇順)にソートされている

#### Scenario: ルールのフィルタリング

**Given** 有効なルールと無効なルールが混在している
**When** 管理者が"有効なルールのみ表示"フィルターを適用する
**Then**
- 有効なルールのみが表示される
- 無効なルールは非表示になる

### Requirement: デフォルト応答の設定

システムは管理者がどのルールにもマッチしない場合のデフォルト応答を設定できるようにしなければならない (MUST)。

#### Scenario: デフォルト応答の有効化

**Given** デフォルト応答が設定されていない
**When** 管理者がデフォルト応答を設定する:
- 応答メッセージ: "お問い合わせありがとうございます。担当者が確認次第ご返信いたします。"
- 有効/無効: 有効

**Then**
- デフォルト応答が保存される
- マッチするルールがない場合にこのメッセージが使用される

#### Scenario: デフォルト応答の無効化

**Given** デフォルト応答が有効になっている
**When** 管理者がデフォルト応答を無効にする
**Then**
- デフォルト応答が無効状態になる
- マッチするルールがない場合、応答が送信されない

### Requirement: プレビュー機能

システムは管理者が応答ルールを保存する前に、テストメッセージでマッチング結果を確認できるようにしなければならない (MUST)。

#### Scenario: マッチング結果のプレビュー

**Given** 管理者が応答ルール作成/編集画面にいる
**And** キーワード"営業時間"、マッチタイプ"部分一致"が設定されている
**When** テストメッセージ"営業時間を教えてください"を入力してプレビューする
**Then**
- "このメッセージはマッチします"と表示される
- マッチしたキーワード"営業時間"が強調表示される
- 送信される応答メッセージが表示される

#### Scenario: マッチしない場合のプレビュー

**Given** 管理者が応答ルール作成/編集画面にいる
**And** キーワード"営業時間"、マッチタイプ"完全一致"が設定されている
**When** テストメッセージ"営業時間を教えてください"を入力してプレビューする
**Then**
- "このメッセージはマッチしません"と表示される
- マッチしない理由が説明される

## Technical Details

### Data Model

```prisma
model AutoReply {
  id          String    @id @default(cuid())
  name        String
  keywords    String[]
  replyText   String
  priority    Int       @default(100)
  isActive    Boolean   @default(true)
  matchType   MatchType @default(CONTAINS)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  logs        AutoReplyLog[]

  @@index([isActive, priority, createdAt])
}

enum MatchType {
  EXACT       // 完全一致
  CONTAINS    // 部分一致
  STARTS_WITH // 前方一致
  ENDS_WITH   // 後方一致
}

model DefaultAutoReply {
  id        String   @id @default("default")
  replyText String?
  isActive  Boolean  @default(false)
  updatedAt DateTime @updatedAt
}
```

### API Endpoints

#### GET /api/auto-reply

応答ルール一覧を取得します。

**Query Parameters:**
- `isActive` (optional): boolean - 有効/無効でフィルタリング

**Response:**
```json
{
  "autoReplies": [
    {
      "id": "clxx123",
      "name": "営業時間の問い合わせ",
      "keywords": ["営業時間", "何時まで"],
      "replyText": "営業時間は平日9:00-18:00です",
      "priority": 100,
      "isActive": true,
      "matchType": "CONTAINS",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/auto-reply

新しい応答ルールを作成します。

**Request Body:**
```json
{
  "name": "営業時間の問い合わせ",
  "keywords": ["営業時間", "何時まで"],
  "replyText": "営業時間は平日9:00-18:00です",
  "priority": 100,
  "isActive": true,
  "matchType": "CONTAINS"
}
```

**Response:**
```json
{
  "autoReply": {
    "id": "clxx123",
    "name": "営業時間の問い合わせ",
    "keywords": ["営業時間", "何時まで"],
    "replyText": "営業時間は平日9:00-18:00です",
    "priority": 100,
    "isActive": true,
    "matchType": "CONTAINS",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/auto-reply/[id]

特定の応答ルールを取得します。

**Response:**
```json
{
  "autoReply": {
    "id": "clxx123",
    "name": "営業時間の問い合わせ",
    "keywords": ["営業時間", "何時まで"],
    "replyText": "営業時間は平日9:00-18:00です",
    "priority": 100,
    "isActive": true,
    "matchType": "CONTAINS",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /api/auto-reply/[id]

応答ルールを更新します。

**Request Body:**
```json
{
  "name": "営業時間の問い合わせ(更新)",
  "keywords": ["営業時間", "何時から", "何時まで"],
  "replyText": "営業時間は平日9:00-18:00、土曜日9:00-15:00です",
  "priority": 50,
  "isActive": true,
  "matchType": "CONTAINS"
}
```

**Response:**
```json
{
  "autoReply": {
    "id": "clxx123",
    "name": "営業時間の問い合わせ(更新)",
    "keywords": ["営業時間", "何時から", "何時まで"],
    "replyText": "営業時間は平日9:00-18:00、土曜日9:00-15:00です",
    "priority": 50,
    "isActive": true,
    "matchType": "CONTAINS",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/auto-reply/[id]

応答ルールを削除します。

**Response:**
```json
{
  "message": "Auto-reply rule deleted successfully",
  "deletedId": "clxx123"
}
```

#### PATCH /api/auto-reply/[id]/toggle

応答ルールの有効/無効を切り替えます。

**Response:**
```json
{
  "autoReply": {
    "id": "clxx123",
    "isActive": false,
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

#### GET /api/auto-reply/default

デフォルト応答を取得します。

**Response:**
```json
{
  "defaultReply": {
    "id": "default",
    "replyText": "お問い合わせありがとうございます。",
    "isActive": true,
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /api/auto-reply/default

デフォルト応答を更新します。

**Request Body:**
```json
{
  "replyText": "お問い合わせありがとうございます。担当者が確認次第ご返信いたします。",
  "isActive": true
}
```

**Response:**
```json
{
  "defaultReply": {
    "id": "default",
    "replyText": "お問い合わせありがとうございます。担当者が確認次第ご返信いたします。",
    "isActive": true,
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

### Validation Rules

- **name**: 必須、1-100文字
- **keywords**: 必須、最低1つ、各キーワードは1-100文字
- **replyText**: 必須、1-5000文字(LINE制限に準拠)
- **priority**: 0-9999の整数
- **matchType**: EXACT, CONTAINS, STARTS_WITH, ENDS_WITHのいずれか

### UI Routes

- `/dashboard/auto-reply` - 応答ルール一覧ページ
- `/dashboard/auto-reply/new` - 新規作成ページ
- `/dashboard/auto-reply/[id]/edit` - 編集ページ
