# LINE Messaging App POC

LINE Messaging API を活用した統合メッセージング管理アプリ（POC）。

ダッシュボードから個別送信/ブロードキャスト、Webhook 受信、ユーザー/テンプレート管理をシンプルに検証できます。

**主な機能**
- LINE 送信（個別/ブロードキャスト）と履歴の永続化
- Webhook 署名検証とフォロー/テキストイベントの保存
- ユーザー一覧・詳細、タグ更新 API
- テンプレート作成/一覧 API
- NextAuth v5 + PrismaAdapter によるログイン土台（LINE ログイン）
- 環境変数ベースのチャネル設定（UI は読み取り専用）
- 最小リアルタイム通知（EventEmitter + Upstash Redis publish）

---

**目次**
- 使い方（クイックスタート）
- 環境変数
- データベースと Prisma
- 認証（NextAuth v5 / LINE）
- Webhook のセットアップ
- メッセージ送信の試験（UI/CLI）
- API リファレンス（サンプル付き）
- 開発コマンド
- テスト
- ディレクトリ構成
- トラブルシュート
- セキュリティ注意事項
 - アクセス制御（middleware）

---

## 使い方（クイックスタート）

前提: Node.js 20+、Docker が利用可能。

1) 依存関係をインストール

```bash
npm install
```

2) 環境変数ファイルを作成し必須値を設定

```bash
cp .env.example .env.local
# .env.local を編集（下記「環境変数」を参照）
```

3) データベースを起動（ローカル Postgres）

```bash
npm run db:up
```

4) Prisma マイグレーションとクライアント生成

```bash
npx prisma migrate dev
npx prisma generate
```

5) 開発サーバーを起動

```bash
npm run dev
# http://localhost:3000 を開く
```

6) 動作確認（任意）

- ダッシュボード: http://localhost:3000/dashboard
- 送信フォーム: http://localhost:3000/dashboard/messages
- 設定（読み取り）: http://localhost:3000/dashboard/settings

---

## 環境変数（.env.local）

最低限必要な値（ローカル検証）
- `DATABASE_URL` 例: `postgresql://postgres:postgres@localhost:5432/line_app?schema=public`
- `NEXTAUTH_SECRET` ランダム長文字列
- `NEXTAUTH_URL` `http://localhost:3000`
- `LINE_CHANNEL_ID` LINE のチャネル ID（本リポでは NextAuth/LINE ログインでも使用）
- `LINE_CHANNEL_SECRET` LINE のチャネルシークレット（署名検証・ログイン）
- `LINE_CHANNEL_ACCESS_TOKEN` LINE Messaging API のチャネルアクセストークン（送信/ブロードキャスト）

オプション
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`（設定するとリアルタイムイベントを publish）
- `CLOUDINARY_*`（将来のメディア管理用）
- `SENTRY_DSN` ほか監視系

注意
- 本 POC は「チャネル設定は環境変数がソース・オブ・トゥルース」です。ダッシュボード設定画面は読み取り専用で、値の更新は `.env.local` 編集＋再起動で反映されます。
- 実運用では「ログイン用 LINE チャネル」と「Messaging API チャネル」を分けることが多いです。現状は同一の `LINE_CHANNEL_ID/SECRET` を利用する前提です（分離する場合はコード/ENV を調整してください）。

---

## データベースと Prisma

- 起動: `npm run db:up`
- マイグレーション/生成: `npx prisma migrate dev && npx prisma generate`
- ログ: `npm run db:logs`
- psql: `npm run db:psql`
- リセット: `npm run db:reset`

主要モデル（抜粋）
- `User`（`lineUserId`, `displayName`, `isFollowing`）
- `Message`（`type`, `content`, `direction`, `userId`, `deliveryStatus`）
- `Template` / `Broadcast` / `Tag` / `UserTag`
- NextAuth: `Account`, `Session`, `VerificationToken`

---

## 認証（NextAuth v5 / LINE）

- 実装: `src/lib/auth/auth.ts`（App Router ハンドラ）
- Adapter: PrismaAdapter（`User` に `name`/`image`/`emailVerified` を追加済み）
- 事前準備
  - `LINE_CHANNEL_ID` と `LINE_CHANNEL_SECRET` を設定
  - LINE Developers の Callback URL に `http://localhost:3000/api/auth/callback/line` を登録
  - `.env.local` に `NEXTAUTH_URL`, `NEXTAUTH_SECRET` を設定

### アクセス制御（middleware）

- `middleware.ts` により以下のパスはサインインが必須です。
  - `/dashboard/*`
  - `/api/users/*`, `/api/messages`, `/api/templates/*`
  - `/api/line/send`, `/api/line/broadcast`, `/api/events`
  - Webhook `/api/line/webhook` は公開（署名検証あり）

---

## Webhook のセットアップ（Messaging API）

1) 公開 URL を用意（ngrok 等）

```bash
# 別ターミナルで
npx ngrok http 3000
# 例: https://abcd-xx-xx-xx-xx.ngrok.io
```

2) LINE Developers → 対象チャネルの Webhook 設定
- Webhook URL: `https://<公開ドメイン>/api/line/webhook`
- Webhook 有効化をオン
- 「検証」ボタンで 200 OK を確認

3) 署名検証
- 本アプリは `LINE_CHANNEL_SECRET` を用い `x-line-signature` を検証します
- 値が不一致だと 400 になります

---

## メッセージ送信の試験

UI から
- `/dashboard/messages` で LINE ユーザー ID とテキストを入力 → 送信

CLI から（個別送信）

```bash
curl -X POST http://localhost:3000/api/line/send \
  -H 'Content-Type: application/json' \
  -d '{"to":"Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","message":"こんにちは！"}'
```

CLI から（ブロードキャスト）

```bash
curl -X POST http://localhost:3000/api/line/broadcast \
  -H 'Content-Type: application/json' \
  -d '{"name":"test","message":"一斉送信テスト"}'
```

---

## API リファレンス（抜粋）

- POST `/api/line/send`
  - body: `{ to: string, message: string }`
  - 返却: `{ status: "sent" }`

- POST `/api/line/broadcast`
  - body: `{ name?: string, message: string }`
  - 返却: `{ status: "sent" }`

- POST `/api/line/webhook`（LINE からの呼び出し）
  - 署名ヘッダ: `x-line-signature` 必須
  - follow/unfollow/text を永続化、テキストは自動返信

- GET `/api/users?q=&take=`
  - 返却: `{ items: User[] }`

- GET `/api/users/:id`
  - 返却: `{ id, lineUserId, displayName, pictureUrl, isFollowing, tags, createdAt }`

- PUT `/api/users/:id/tags`
  - body: `{ tags: string[] }`
  - 返却: `{ id, tags: string[] }`

- GET `/api/messages?take=&cursor=`
  - 返却: `{ items: MessageWithUser[], nextCursor: string | null }`

- GET `/api/templates`
  - 返却: `{ items: Template[] }`

- POST `/api/templates`
  - body: `{ name, type, content, variables?, category?, isActive? }`
  - 返却: `{ item: Template }`

- GET `/api/settings/channel`
  - 返却: `{ channelId: string, channelSecretConfigured: boolean }`（env を参照）
  - PUT は 405（UI は案内のみ）

---

## 開発コマンド

- `npm run dev` 開発サーバー起動（http://localhost:3000）
- `npm run build` 本番ビルド / `npm start` 起動
- `npm run lint` ESLint（Next core-web-vitals + TS）
- `npm test` / `npm run test:watch` テスト実行
- DB: `npm run db:up | db:down | db:logs | db:psql | db:reset`

---

## テスト

- フレームワーク: Vitest + Testing Library（jsdom）
- 実行: `npm test`
- 設定: `vitest.config.ts`, セットアップ: `vitest.setup.ts`

---

## ディレクトリ構成

```
src/
  app/
    dashboard/*        # ダッシュボード UI
    api/*              # App Router API ルート
  lib/
    line/              # LINE SDK クライアント
    prisma/            # Prisma クライアント
    auth/              # NextAuth v5
    redis/             # Upstash ラッパ
    realtime/          # 最小イベントバス
  providers/           # アプリ共通プロバイダ
  state/*              # Jotai atoms（将来拡張）
  types/*              # 型拡張（next-auth など）
```

---

## トラブルシュート

- 400 Invalid request（API）
  - リクエストボディの必須項目不足（zod）
- 400 Invalid LINE signature（Webhook）
  - `LINE_CHANNEL_SECRET` 不一致。ENV を再確認
- 認証で 500/リダイレクトループ
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `LINE_CHANNEL_ID/SECRET` を再確認
- Prisma 実行時エラー
  - `DATABASE_URL` とマイグレーション実行状況を確認
- 送信は成功するが DB に保存されない
  - マイグレーション未適用 or DB 接続不良

---

## セキュリティ注意事項

- `.env.local` に秘密情報を置き、Git にコミットしない
- アクセストークン/シークレットは定期ローテーション
- ログに個人情報やトークンを出力しない
- 本 POC のエラーハンドリングは簡易実装。運用時は監視/通知を追加

---

## ライセンス

MIT
