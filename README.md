# LINE Messaging App

LINE Messaging API を活用した統合メッセージング管理アプリケーション。

ダッシュボードから個別送信/ブロードキャスト、Webhook 受信、ユーザー/テンプレート管理、自動応答システムをシンプルに検証・運用できます。

## 主な機能

- **メッセージ送信**
  - 個別送信（テキスト・画像）
  - ブロードキャスト配信
  - メッセージ履歴の永続化

- **自動応答システム** ⭐ NEW
  - キーワードマッチング（完全一致・部分一致・前方一致・正規表現）
  - 自動応答ルールの作成・編集・削除
  - 実行ログとアナリティクス
  - ルールの有効化/無効化

- **Webhook 処理**
  - 署名検証とイベント処理
  - フォロー/アンフォローの追跡
  - メッセージの自動保存

- **ユーザー管理**
  - ユーザー一覧・詳細
  - タグ管理
  - フォロー状態の追跡

- **テンプレート管理**
  - メッセージテンプレートの作成
  - カテゴリ分類
  - 変数サポート

- **リッチメニュー**
  - ビジュアルエディタ
  - 画像アップロード（Cloudinary）
  - リンク設定

- **開発ツール**
  - Webhook 診断ページ
  - リアルタイムログ表示
  - デバッグパネル

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **状態管理**: Jotai
- **キャッシュ/リアルタイム**: Upstash Redis
- **画像ストレージ**: Cloudinary
- **テスト**: Vitest + Testing Library
- **LINE**: Messaging API + Bot SDK

---

## 目次

- [クイックスタート](#クイックスタート)
- [環境変数](#環境変数)
- [Cloudinary セットアップ](#cloudinary-セットアップ画像機能を使う場合)
- [データベースと Prisma](#データベースと-prisma)
- [Webhook のセットアップ](#webhook-のセットアップmessaging-api)
- [自動応答システム](#自動応答システム)
- [メッセージ送信の試験](#メッセージ送信の試験)
- [API リファレンス](#api-リファレンス抜粋)
- [開発コマンド](#開発コマンド)
- [テスト](#テスト)
- [ディレクトリ構成](#ディレクトリ構成)
- [トラブルシュート](#トラブルシュート)
- [セキュリティ注意事項](#セキュリティ注意事項)

---

## クイックスタート

**前提条件**: Node.js 20+、Docker が利用可能。

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数ファイルを作成

```bash
cp .env.example .env
# または .env.local を使用（Git で除外されます）
# cp .env.example .env.local
```

`.env` ファイルを編集し、必須項目を設定してください（詳細は「環境変数」セクションを参照）。

### 3. データベースを起動

```bash
npm run db:up
```

### 4. Prisma マイグレーションとクライアント生成

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. シードデータを投入（オプション）

```bash
npx tsx prisma/seed.ts
```

### 6. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 を開く

### 7. チャネル情報の登録

1. ダッシュボード → 設定 → 「チャネル情報の保存」
2. 以下を入力して保存：
   - チャネル ID（LINE Developers Console で確認）
   - チャネルシークレット
   - チャネルアクセストークン（自動発行されるため入力不要）

### 8. 動作確認

- ダッシュボード: http://localhost:3000/dashboard
- メッセージ送信: http://localhost:3000/dashboard/messages
- 自動応答: http://localhost:3000/dashboard/auto-reply
- 設定: http://localhost:3000/dashboard/settings
- Webhook 診断: http://localhost:3000/dashboard/webhook-check

---

## 環境変数

### 必須項目

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/line_app?schema=public
```

### オプション項目

```env
# Upstash Redis (リアルタイムイベント通知)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Cloudinary (画像メッセージ・リッチメニュー)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Sentry (エラー監視)
SENTRY_DSN=your_sentry_dsn
```

### 注意事項

- チャネル設定（チャネル ID/シークレット）は画面（設定 → チャネル情報）から保存します
- アクセストークンは保存せず、送信時に OAuth2 Client Credentials で自動発行してメモリにキャッシュします
- `.env` と `.env.local` は Git にコミットしないでください（`.gitignore` で除外済み）

---

## Cloudinary セットアップ（画像機能を使う場合）

Cloudinary は画像のアップロード・保存・配信を行うクラウドサービスです。

### 必要な機能

以下の機能を使う場合、Cloudinary の設定が必須です：

- 画像メッセージの送信 (`/dashboard/messages/image`)
- リッチメニューの作成 (`/dashboard/richmenu/new`)

### セットアップ手順

1. **アカウント作成（無料）**
   - https://cloudinary.com/ にアクセス
   - 「Sign up for free」をクリック
   - メールアドレスで登録（Google アカウントでも可）

2. **API キーの取得**
   - ログイン後、ダッシュボードに表示される以下の情報をコピー：
     - **Cloud Name** (例: `dxxxxxxxxxxxxx`)
     - **API Key** (例: `123456789012345`)
     - **API Secret** (例: `abcdefghijklmnopqrstuvwxyz123`)

3. **環境変数に設定**

   `.env` ファイルに以下を追加：

   ```env
   CLOUDINARY_CLOUD_NAME=あなたのcloud_name
   CLOUDINARY_API_KEY=あなたのapi_key
   CLOUDINARY_API_SECRET=あなたのapi_secret
   ```

4. **開発サーバーを再起動**

   ```bash
   npm run dev
   ```

### 料金について

- **無料プラン**: 月 25 クレジット、25GB ストレージ、25GB 帯域幅
  - 開発・テスト環境には十分です
- 有料プランは必要に応じてアップグレード可能

### 代替手段

Cloudinary を使わない場合、以下の選択肢があります：

- **AWS S3**: Amazon Web Services のストレージサービス
- **Supabase Storage**: オープンソースのストレージサービス
- **ローカルストレージ**: 開発環境のみ（本番環境には非推奨）

これらを使う場合は、`/api/upload/richmenu-image/route.ts` と `/api/uploads/image/route.ts` の実装を変更する必要があります。

---

## データベースと Prisma

### コマンド

- 起動: `npm run db:up`
- 停止: `npm run db:down`
- マイグレーション: `npx prisma migrate dev`
- クライアント生成: `npx prisma generate`
- ログ: `npm run db:logs`
- psql: `npm run db:psql`
- リセット: `npm run db:reset`
- **Prisma Studio（GUI）**: `npx prisma studio`
  - ブラウザベースのデータベース管理ツール
  - http://localhost:5555 で起動
  - テーブルデータの閲覧・作成・編集・削除が可能

### 主要モデル

- `User` - LINE ユーザー情報
- `Message` - メッセージ履歴（送受信）
- `Template` - メッセージテンプレート
- `Broadcast` - ブロードキャスト配信
- `Tag` / `UserTag` - ユーザータグ管理
- `AutoReply` - 自動応答ルール ⭐ NEW
- `AutoReplyLog` - 自動応答実行ログ ⭐ NEW
- `ChannelConfig` - チャネル設定

---

## Webhook のセットアップ（Messaging API）

### 前提条件

Cloudflare Tunnel（Quick Tunnels）を使ってローカル環境を公開します。

### 1. cloudflared をインストール

- **macOS（Homebrew）**:
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```
- **その他**: https://github.com/cloudflare/cloudflared/releases

### 2. トンネルを起動

**重要**: HTTP/2 プロトコルを指定してください（QUIC プロトコルは接続に失敗する場合があります）

```bash
cloudflared tunnel --protocol http2 --url http://localhost:3000
```

数秒後、以下のような URL が表示されます：

```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

この URL をコピーしてください。

### 3. LINE Developers Console で設定

1. https://developers.line.biz/console/ にアクセス
2. 対象のチャネルを選択
3. **「Messaging API 設定」** タブを開く
4. **Webhook URL** に以下を設定：
   ```
   https://xxxx-xxxx-xxxx.trycloudflare.com/api/line/webhook
   ```
5. **「Webhook の利用」** をオンに設定
6. **「応答メッセージ」** をオフに設定
7. **「更新」** ボタンをクリック

### 4. LINE Official Account Manager で設定

**重要**: LINE Developers Console とは別の管理画面です。

1. https://manager.line.biz/ にアクセス
2. 該当の LINE 公式アカウントを選択
3. **「設定」→「応答設定」** を開く
4. **「応答モード」** を **「チャット」** に設定（「Bot」ではない）
5. **「応答メッセージ」** を **「オフ」** に設定
6. **「Webhook」** を **「オン」** に設定
7. 設定を保存

### 5. 署名検証と注意事項

- 本アプリは DB に保存されたチャネルシークレットで `x-line-signature` を検証します
- Quick Tunnels は再起動で URL が変わります。cloudflared を再起動したら Webhook URL も更新してください

### 6. Webhook 診断ページ

http://localhost:3000/dashboard/webhook-check にアクセスして、Webhook の設定状態を確認できます。

このページでは：
- アプリケーション設定の確認
- LINE 設定のチェックリスト
- Cloudflare Tunnel のセットアップ手順
- テスト手順

が表示されます。

---

## 自動応答システム

### 概要

ユーザーから受信したメッセージのキーワードに基づいて、自動的に応答メッセージを送信する機能です。

### 機能

- **キーワードマッチング**
  - 完全一致: メッセージ全体が一致
  - 部分一致: メッセージ内にキーワードが含まれる
  - 前方一致: メッセージの先頭がキーワードで始まる
  - 正規表現: 高度なパターンマッチング

- **優先順位制御**
  - 複数のルールがマッチした場合、優先順位の高いものを実行
  - 同じ優先順位の場合は作成日時が新しいものを優先

- **アナリティクス**
  - 実行回数の集計
  - 実行ログの表示
  - 日別の実行統計

### 使い方

1. **ルールの作成**
   - http://localhost:3000/dashboard/auto-reply/new にアクセス
   - ルール名、キーワード、マッチタイプ、応答メッセージ、優先順位を設定
   - 保存

2. **ルールの管理**
   - http://localhost:3000/dashboard/auto-reply で一覧表示
   - 有効化/無効化の切り替え
   - 編集・削除

3. **実行ログの確認**
   - http://localhost:3000/dashboard/auto-reply/analytics でアナリティクスを表示
   - 各ルールの実行ログを確認

### データベーススキーマ

```prisma
model AutoReply {
  id          String   @id @default(cuid())
  name        String
  keywords    String[]
  matchType   String   // EXACT, PARTIAL, PREFIX, REGEX
  replyText   String
  priority    Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  logs        AutoReplyLog[]
}

model AutoReplyLog {
  id           String     @id @default(cuid())
  autoReplyId  String
  autoReply    AutoReply  @relation(fields: [autoReplyId], references: [id])
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  messageText  String
  matched      Boolean
  executedAt   DateTime   @default(now())
}
```

---

## メッセージ送信の試験

### UI から

- `/dashboard/messages` で LINE ユーザー ID とテキストを入力 → 送信

### CLI から（個別送信）

```bash
curl -X POST http://localhost:3000/api/line/send \
  -H 'Content-Type: application/json' \
  -d '{"to":"Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","message":"こんにちは！"}'
```

### CLI から（ブロードキャスト）

```bash
curl -X POST http://localhost:3000/api/line/broadcast \
  -H 'Content-Type: application/json' \
  -d '{"name":"test","message":"一斉送信テスト"}'
```

---

## API リファレンス（抜粋）

### メッセージ送信

- **POST `/api/line/send`**
  - Body: `{ to: string, message: string }`
  - Response: `{ status: "sent" }`

- **POST `/api/line/broadcast`**
  - Body: `{ name?: string, message: string }`
  - Response: `{ status: "sent" }`

### Webhook

- **POST `/api/line/webhook`**（LINE からの呼び出し）
  - Header: `x-line-signature` 必須
  - 処理: follow/unfollow/message イベントを永続化、自動応答を実行

### 自動応答

- **GET `/api/auto-reply`**
  - Query: `filter=active|inactive|all` (デフォルト: all)
  - Response: `{ items: AutoReply[] }`

- **POST `/api/auto-reply`**
  - Body: `{ name, keywords, matchType, replyText, priority?, isActive? }`
  - Response: `{ item: AutoReply }`

- **GET `/api/auto-reply/:id`**
  - Response: `AutoReply`

- **PUT `/api/auto-reply/:id`**
  - Body: `{ name?, keywords?, matchType?, replyText?, priority?, isActive? }`
  - Response: `{ item: AutoReply }`

- **DELETE `/api/auto-reply/:id`**
  - Response: `{ success: true }`

- **PATCH `/api/auto-reply/:id/toggle`**
  - Response: `{ item: AutoReply }`

- **GET `/api/auto-reply/:id/logs`**
  - Query: `days=7`
  - Response: `{ logs: AutoReplyLog[] }`

### ユーザー

- **GET `/api/users`**
  - Query: `q=&take=`
  - Response: `{ items: User[] }`

- **GET `/api/users/:id`**
  - Response: `{ id, lineUserId, displayName, pictureUrl, isFollowing, tags, createdAt }`

- **PUT `/api/users/:id/tags`**
  - Body: `{ tags: string[] }`
  - Response: `{ id, tags: string[] }`

### メッセージ

- **GET `/api/messages`**
  - Query: `take=&cursor=`
  - Response: `{ items: MessageWithUser[], nextCursor: string | null }`

### テンプレート

- **GET `/api/templates`**
  - Response: `{ items: Template[] }`

- **POST `/api/templates`**
  - Body: `{ name, type, content, variables?, category?, isActive? }`
  - Response: `{ item: Template }`

### 設定

- **GET `/api/settings/channel`**
  - Response: `{ channelId: string, channelSecretConfigured: boolean }`

---

## 開発コマンド

### サーバー起動

- `npm run dev` - 開発サーバー起動（http://localhost:3000）
- `npm run build` - 本番ビルド
- `npm start` - 本番サーバー起動

### コード品質

- `npm run lint` - ESLint（Next core-web-vitals + TypeScript）
- `npm test` - テスト実行
- `npm run test:watch` - テスト（watch モード）

### データベース

- `npm run db:up` - PostgreSQL 起動（Docker）
- `npm run db:down` - PostgreSQL 停止
- `npm run db:logs` - ログ表示
- `npm run db:psql` - psql 接続
- `npm run db:reset` - データベースリセット
- `npx prisma studio` - Prisma Studio 起動（http://localhost:5555）
- `npx prisma migrate dev` - マイグレーション適用
- `npx prisma generate` - クライアント生成

### その他

- `npx tsx prisma/seed.ts` - シードデータ投入

---

## テスト

- **フレームワーク**: Vitest + Testing Library（jsdom）
- **実行**: `npm test`
- **Watch モード**: `npm run test:watch`
- **設定**: `vitest.config.ts`
- **セットアップ**: `vitest.setup.ts`

### テスト例

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## ディレクトリ構成

```
src/
  app/
    dashboard/              # ダッシュボード UI
      auto-reply/           # 自動応答管理 ⭐ NEW
      messages/             # メッセージ送信
      users/                # ユーザー管理
      broadcast/            # ブロードキャスト
      richmenu/             # リッチメニュー
      settings/             # 設定
      webhook-check/        # Webhook 診断 ⭐ NEW
    api/                    # API Routes
      line/                 # LINE API
        send/               # メッセージ送信
        broadcast/          # ブロードキャスト
        webhook/            # Webhook エンドポイント
      auto-reply/           # 自動応答 API ⭐ NEW
      users/                # ユーザー API
      messages/             # メッセージ API
      templates/            # テンプレート API
  lib/
    line/                   # LINE SDK クライアント
      client.ts             # LINE クライアント
      message-persister.ts  # メッセージ永続化
      message-schemas.ts    # メッセージスキーマ
      payload-normalizer.ts # ペイロード正規化
    auto-reply/             # 自動応答システム ⭐ NEW
      executor.ts           # 自動応答実行
      matcher.ts            # キーワードマッチング
    prisma/                 # Prisma クライアント
    auth/                   # 認証（NextAuth v5）
    redis/                  # Upstash ラッパー
    realtime/               # リアルタイムイベントバス
    dev/                    # 開発ツール
  components/
    auto-reply/             # 自動応答コンポーネント ⭐ NEW
      KeywordInput.tsx
      MatchTypeSelect.tsx
  providers/                # アプリケーションプロバイダー
  state/                    # Jotai atoms
    message/
    user/
    template/
    ui/
  types/                    # TypeScript 型定義
prisma/
  schema.prisma             # データベーススキーマ
  migrations/               # マイグレーション履歴
  seed.ts                   # シードデータ
```

---

## トラブルシュート

### Webhook が動作しない

**症状**: LINE からメッセージを送っても応答がない、ログが出ない

**原因と対処法**:

1. **Cloudflare Tunnel が起動していない**
   - `ps aux | grep cloudflared` で確認
   - HTTP/2 プロトコルで起動: `cloudflared tunnel --protocol http2 --url http://localhost:3000`

2. **QUIC プロトコルで接続失敗**
   - エラー: `Failed to dial a quic connection`
   - 対処: HTTP/2 プロトコルで再起動（上記コマンド）

3. **Webhook URL が古い**
   - Cloudflare Tunnel を再起動すると URL が変わります
   - LINE Developers Console で Webhook URL を更新してください

4. **LINE Official Account Manager の設定ミス**
   - https://manager.line.biz/ にアクセス
   - 「応答設定」→「応答モード」を **「チャット」** に設定（「Bot」ではない）
   - 「応答メッセージ」を **「オフ」** に設定

5. **チャネルシークレット未設定**
   - `/dashboard/settings` でチャネルシークレットを設定
   - LINE Developers Console の値と一致していることを確認

**診断ツール**:
- http://localhost:3000/dashboard/webhook-check で設定状態を確認できます

### 自動応答が動作しない

**症状**: キーワードを送っても自動応答が返ってこない

**確認事項**:

1. **ルールが有効化されているか**
   - `/dashboard/auto-reply` で該当ルールが「有効」になっているか確認

2. **キーワードとマッチタイプが正しいか**
   - 完全一致: メッセージ全体が一致する必要があります
   - 部分一致: メッセージ内にキーワードが含まれていれば OK
   - 前方一致: メッセージの先頭がキーワードで始まる必要があります

3. **Webhook が動作しているか**
   - `/dashboard/dev` でログを確認
   - `webhook:received` ログが出ているか確認

4. **データベースにルールが保存されているか**
   - `npx prisma studio` でデータを確認

### API エラー

- **400 Invalid request**
  - リクエストボディの必須項目不足（zod バリデーション）
  - レスポンスのエラーメッセージを確認

- **400 Invalid LINE signature（Webhook）**
  - チャネルシークレット不一致
  - `/dashboard/settings` と LINE Developers Console の値を照合

- **500 Internal Server Error**
  - サーバーログを確認（ターミナル）
  - データベース接続を確認
  - 環境変数が正しく設定されているか確認

### Prisma エラー

- **Migration failed**
  - `DATABASE_URL` が正しいか確認
  - PostgreSQL が起動しているか確認: `npm run db:logs`

- **Prisma Client not found**
  - `npx prisma generate` を実行

### Next.js 16 の params 問題

Next.js 16 では動的ルートの `params` は Promise になります。

```typescript
// ✅ 正しい
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}

// ❌ 間違い（Next.js 15 以前）
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // エラー
  // ...
}
```

---

## セキュリティ注意事項

### 秘密情報の管理

- `.env` または `.env.local` に秘密情報を置く
- Git にコミットしない（`.gitignore` で除外済み）
- アクセストークン/シークレットは定期的にローテーション

### ログ出力

- 個人情報やトークンをログに出力しない
- 本番環境では適切なログレベルを設定

### 認証

- この POC にはアプリ内認証は含まれていません（デモ用途）
- 公開環境では必ずリバースプロキシや社内 VPN 等でアクセス制御してください
- NextAuth v5 の実装例は `/lib/auth/` にあります

### エラーハンドリング

- 本 POC のエラーハンドリングは簡易実装です
- 運用時は監視/通知を追加してください（Sentry など）

### Webhook 署名検証

- すべての Webhook リクエストで署名検証を実施
- 署名が無効な場合は 400 エラーを返す
- チャネルシークレットは厳重に管理

---

## ライセンス

MIT

---

## サポート・フィードバック

問題が発生した場合や改善提案がある場合は、GitHub Issues でお知らせください。

---

## 更新履歴

### 2025-11-12
- 自動応答システムを追加
- Webhook 診断ページを追加
- Cloudflare Tunnel の HTTP/2 プロトコル対応
- README を大幅に更新

### 2025-01-XX
- 初回リリース
