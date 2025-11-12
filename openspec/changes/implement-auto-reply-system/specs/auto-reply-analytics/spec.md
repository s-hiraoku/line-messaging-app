# Spec: Auto-Reply Analytics

## Overview

自動応答の使用状況を記録し、分析できる機能を提供します。管理者はどのルールがいつ、どのくらい使用されたかを把握できます。

## ADDED Requirements

### Requirement: 応答履歴の一覧表示

システムは管理者が自動応答の履歴を一覧で確認できるようにしなければならない (MUST)。

#### Scenario: 基本的な履歴一覧の表示

**Given** 複数の自動応答ログが記録されている
**When** 管理者が応答履歴ページにアクセスする
**Then** 以下の情報が表示される:
- 日時
- ユーザー名(displayName)
- 受信メッセージ(最初の50文字)
- 使用された応答ルール名
- マッチしたキーワード
- ステータス(成功/失敗)

**And** ログは新しい順にソートされている

#### Scenario: 履歴の詳細表示

**Given** 応答履歴一覧が表示されている
**When** 管理者が特定のログをクリックする
**Then** 詳細情報が表示される:
- ユーザー情報(名前、LINE ID、プロフィール画像)
- 受信メッセージ全文
- 使用された応答ルール詳細(名前、キーワード、マッチタイプ)
- 送信された応答メッセージ
- マッチしたキーワード
- 実行結果(成功/失敗)
- エラーメッセージ(失敗した場合)
- タイムスタンプ

### Requirement: 期間によるフィルタリング

システムは管理者が期間を指定して応答履歴を絞り込めるようにしなければならない (MUST)。

#### Scenario: 日付範囲でのフィルタリング

**Given** 過去1ヶ月の応答履歴が存在する
**When** 管理者が"過去7日間"のフィルターを適用する
**Then**
- 過去7日間のログのみが表示される
- 合計件数が更新される
- グラフも同じ期間で表示される

#### Scenario: カスタム期間の指定

**Given** 管理者が履歴ページにいる
**When** 開始日"2025-01-01"と終了日"2025-01-31"を指定する
**Then**
- 指定した期間内のログのみが表示される
- 期間外のログは表示されない

### Requirement: ルールごとの使用統計

システムは管理者が各応答ルールの使用状況を確認できるようにしなければならない (MUST)。

#### Scenario: ルール別使用回数の表示

**Given** 複数の応答ルールが使用されている
**When** 管理者が統計ページにアクセスする
**Then** 各ルールについて以下の情報が表示される:
- ルール名
- 使用回数
- 成功率(成功回数 / 総使用回数)
- 最終使用日時
- トレンド(前期間と比較して増減)

#### Scenario: 最も使用されたルールの表示

**Given** 複数の応答ルールが使用されている
**When** 管理者が統計ページにアクセスする
**Then**
- 使用回数が最も多いトップ5のルールが強調表示される
- 各ルールの使用回数と全体に占める割合が表示される

### Requirement: 時系列グラフの表示

システムは管理者が応答の使用状況を時系列で視覚的に確認できるようにしなければならない (MUST)。

#### Scenario: 日別の応答数グラフ

**Given** 過去30日間の応答履歴が存在する
**When** 管理者が"日別"グラフを表示する
**Then**
- 横軸: 日付
- 縦軸: 応答回数
- 各日の応答回数が棒グラフで表示される
- 成功と失敗が色分けされている

#### Scenario: ルール別の使用推移

**Given** 複数の応答ルールが使用されている
**When** 管理者が"ルール別推移"グラフを表示する
**Then**
- 横軸: 日付
- 縦軸: 応答回数
- 各ルールが異なる色の線グラフで表示される
- 凡例でルール名が表示される
- 最大5つのルールが表示される(使用回数上位)

### Requirement: サマリー情報の表示

システムは管理者が応答システムの全体的な使用状況を一目で把握できるようにしなければならない (MUST)。

#### Scenario: 主要メトリクスの表示

**Given** 応答履歴が存在する
**When** 管理者が統計ページにアクセスする
**Then** 以下のサマリーカードが表示される:

**総応答数**
- 選択した期間の総応答回数
- 前期間との比較(増減率)

**応答成功率**
- 成功した応答の割合(%)
- 前期間との比較

**アクティブルール数**
- 現在有効になっている応答ルールの数
- 全ルール数

**平均応答時間**
- メッセージ受信から応答送信までの平均時間
- 前期間との比較

#### Scenario: ユニークユーザー数の表示

**Given** 複数のユーザーが自動応答を受け取っている
**When** 管理者が統計ページにアクセスする
**Then**
- 期間内に自動応答を受け取ったユニークユーザー数が表示される
- 前期間との比較が表示される

### Requirement: エラーの分析

システムは管理者が失敗した応答の詳細を確認し、問題を特定できるようにしなければならない (MUST)。

#### Scenario: エラーログの一覧表示

**Given** 失敗した応答ログが存在する
**When** 管理者が"エラーのみ表示"フィルターを適用する
**Then**
- replySent: false のログのみが表示される
- エラーメッセージが表示される
- エラー発生日時が表示される

#### Scenario: エラータイプ別の集計

**Given** 様々なタイプのエラーが発生している
**When** 管理者がエラー統計を表示する
**Then** エラータイプごとに集計される:
- ネットワークエラー
- 無効なreplyToken
- APIレート制限
- その他のエラー

**And** 各エラータイプの発生回数が表示される

### Requirement: 特定ルールの詳細分析

システムは管理者が特定の応答ルールの使用状況を詳しく分析できるようにしなければならない (MUST)。

#### Scenario: ルール別の詳細統計

**Given** 管理者が特定のルールを選択している
**When** ルール詳細ページにアクセスする
**Then** 以下の情報が表示される:
- ルールの基本情報(名前、キーワード、応答メッセージ)
- 総使用回数
- 成功率
- 平均応答時間
- 最終使用日時
- 時系列グラフ(このルールのみ)
- このルールを使用したユーザー一覧(上位10人)
- マッチしたキーワードの内訳

#### Scenario: キーワード別のマッチング統計

**Given** ルールに複数のキーワードが設定されている
**When** 管理者がルール詳細ページを表示する
**Then** 各キーワードについて:
- キーワード
- マッチング回数
- 全体に占める割合

### Requirement: データのエクスポート

システムは管理者が応答履歴データをエクスポートできるようにしなければならない (MUST)。

#### Scenario: CSV形式でのエクスポート

**Given** 管理者が応答履歴ページにいる
**When** "CSVエクスポート"ボタンをクリックする
**Then**
- 現在表示されているフィルター条件に基づいたデータがCSVでダウンロードされる
- CSVには以下の列が含まれる:
  - 日時
  - ユーザーID
  - ユーザー名
  - 受信メッセージ
  - ルール名
  - マッチしたキーワード
  - 応答メッセージ
  - ステータス
  - エラーメッセージ

### Requirement: リアルタイム更新

システムは管理者が新しい応答が発生したときにリアルタイムで確認できるようにしなければならない (MUST)。

#### Scenario: 新しいログのリアルタイム表示

**Given** 管理者が応答履歴ページを開いている
**When** 新しい自動応答が実行される
**Then**
- ページが自動的に更新される(WebSocketまたはポーリング)
- 新しいログが一覧の先頭に追加される
- 通知バッジまたはトースト通知が表示される

## Technical Details

### API Endpoints

#### GET /api/auto-reply/analytics

応答履歴の統計情報を取得します。

**Query Parameters:**
- `startDate` (optional): ISO 8601形式の開始日時
- `endDate` (optional): ISO 8601形式の終了日時

**Response:**
```json
{
  "summary": {
    "totalReplies": 1250,
    "successRate": 98.4,
    "activeRules": 15,
    "averageResponseTime": 0.42,
    "uniqueUsers": 342,
    "comparisonWithPrevious": {
      "totalReplies": 12.5,
      "successRate": 1.2,
      "uniqueUsers": 8.3
    }
  },
  "topRules": [
    {
      "id": "clxx123",
      "name": "営業時間の問い合わせ",
      "usageCount": 250,
      "successRate": 99.2,
      "percentage": 20.0
    }
  ],
  "errorsByType": {
    "networkError": 10,
    "invalidReplyToken": 5,
    "rateLimitExceeded": 3,
    "other": 2
  }
}
```

#### GET /api/auto-reply/logs

応答ログ一覧を取得します。

**Query Parameters:**
- `page` (optional): ページ番号(デフォルト: 1)
- `limit` (optional): 1ページあたりの件数(デフォルト: 50)
- `startDate` (optional): 開始日時
- `endDate` (optional): 終了日時
- `autoReplyId` (optional): 特定ルールでフィルタ
- `userId` (optional): 特定ユーザーでフィルタ
- `replySent` (optional): 成功/失敗でフィルタ(true/false)

**Response:**
```json
{
  "logs": [
    {
      "id": "clxx789",
      "autoReply": {
        "id": "clxx123",
        "name": "営業時間の問い合わせ"
      },
      "user": {
        "id": "clxx456",
        "displayName": "山田太郎",
        "lineUserId": "U1234567890"
      },
      "inboundMessage": "営業時間を教えてください",
      "matchedKeyword": "営業時間",
      "replySent": true,
      "errorMessage": null,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 25,
    "totalItems": 1250,
    "itemsPerPage": 50
  }
}
```

#### GET /api/auto-reply/[id]/logs

特定ルールの応答ログを取得します。

**Query Parameters:**
- `page` (optional): ページ番号
- `limit` (optional): 1ページあたりの件数
- `startDate` (optional): 開始日時
- `endDate` (optional): 終了日時

**Response:**
```json
{
  "autoReply": {
    "id": "clxx123",
    "name": "営業時間の問い合わせ",
    "keywords": ["営業時間", "何時まで"],
    "replyText": "営業時間は平日9:00-18:00です"
  },
  "statistics": {
    "totalUsage": 250,
    "successRate": 99.2,
    "averageResponseTime": 0.38,
    "lastUsed": "2025-01-15T10:30:00Z",
    "keywordBreakdown": [
      {
        "keyword": "営業時間",
        "count": 180,
        "percentage": 72.0
      },
      {
        "keyword": "何時まで",
        "count": 70,
        "percentage": 28.0
      }
    ]
  },
  "logs": [
    {
      "id": "clxx789",
      "user": {
        "id": "clxx456",
        "displayName": "山田太郎"
      },
      "inboundMessage": "営業時間を教えてください",
      "matchedKeyword": "営業時間",
      "replySent": true,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 250,
    "itemsPerPage": 50
  }
}
```

#### GET /api/auto-reply/analytics/timeseries

時系列データを取得します。

**Query Parameters:**
- `startDate` (required): 開始日時
- `endDate` (required): 終了日時
- `granularity` (optional): hour/day/week/month (デフォルト: day)
- `autoReplyId` (optional): 特定ルールに絞り込み

**Response:**
```json
{
  "timeseries": [
    {
      "date": "2025-01-01",
      "totalReplies": 42,
      "successfulReplies": 41,
      "failedReplies": 1,
      "uniqueUsers": 28
    },
    {
      "date": "2025-01-02",
      "totalReplies": 38,
      "successfulReplies": 38,
      "failedReplies": 0,
      "uniqueUsers": 25
    }
  ],
  "ruleBreakdown": [
    {
      "autoReplyId": "clxx123",
      "name": "営業時間の問い合わせ",
      "data": [
        {"date": "2025-01-01", "count": 15},
        {"date": "2025-01-02", "count": 12}
      ]
    }
  ]
}
```

#### GET /api/auto-reply/logs/export

応答ログをCSV形式でエクスポートします。

**Query Parameters:**
- `startDate` (optional): 開始日時
- `endDate` (optional): 終了日時
- `autoReplyId` (optional): 特定ルールでフィルタ
- `replySent` (optional): 成功/失敗でフィルタ

**Response:**
- Content-Type: text/csv
- ファイル名: auto-reply-logs-{timestamp}.csv

### Database Queries

#### 統計情報の取得

```typescript
// 総応答数
const totalReplies = await prisma.autoReplyLog.count({
  where: { createdAt: { gte: startDate, lte: endDate } }
});

// 成功率
const successfulReplies = await prisma.autoReplyLog.count({
  where: {
    createdAt: { gte: startDate, lte: endDate },
    replySent: true
  }
});
const successRate = (successfulReplies / totalReplies) * 100;

// ルール別使用回数(トップ5)
const topRules = await prisma.autoReplyLog.groupBy({
  by: ['autoReplyId'],
  where: { createdAt: { gte: startDate, lte: endDate } },
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
  take: 5
});

// ユニークユーザー数
const uniqueUsers = await prisma.autoReplyLog.findMany({
  where: { createdAt: { gte: startDate, lte: endDate } },
  distinct: ['userId']
});
```

### UI Components

#### Analytics Dashboard Layout

```
/dashboard/auto-reply/analytics
├── Header
│   └── 期間選択コントロール
├── Summary Cards (Grid 2x2)
│   ├── 総応答数
│   ├── 応答成功率
│   ├── アクティブルール数
│   └── ユニークユーザー数
├── Charts Section
│   ├── 時系列グラフ(日別応答数)
│   └── ルール別使用状況(円グラフ)
└── Logs Table
    ├── フィルターコントロール
    ├── ログ一覧テーブル
    └── ページネーション
```

### Performance Considerations

- **Pagination**: ログ一覧は常にページネーションを使用
- **Aggregation**: 統計情報はデータベースレベルで集計
- **Caching**: サマリー情報は5分間キャッシュ
- **Indexing**: createdAt, autoReplyId, userIdにインデックスを設定

### Real-time Updates

- **WebSocket**: Socket.ioを使用したリアルタイム通知
- **Event**: `auto-reply:executed`イベントをブロードキャスト
- **Fallback**: WebSocket非対応の場合は30秒ごとにポーリング
