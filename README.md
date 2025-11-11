# LINE Messaging App

LINE Messaging API を活用した統合メッセージング管理アプリ（プロトタイプアプリ）。

ダッシュボードから個別送信/ブロードキャスト、Webhook 受信、ユーザー/テンプレート管理をシンプルに検証できます。

**主な機能**

- LINE 送信（個別/ブロードキャスト）と履歴の永続化
- Webhook 署名検証とフォロー/テキストイベントの保存
- ユーザー一覧・詳細、タグ更新 API
- テンプレート作成/一覧 API
- チャネル設定（ID/シークレット）は UI から保存（アクセストークンは自動発行）
- 最小リアルタイム通知（EventEmitter + Upstash Redis publish）

---

**目次**

- 使い方（クイックスタート）
- 環境変数
- データベースと Prisma
- 認証（なし）
- Webhook のセットアップ
- メッセージ送信の試験（UI/CLI）
- API リファレンス（サンプル付き）
- 開発コマンド
- テスト
- ディレクトリ構成
- トラブルシュート
- セキュリティ注意事項

---

## 使い方（クイックスタート）

前提: Node.js 20+、Docker が利用可能。

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数ファイルを作成し必須値を設定

```bash
# どちらでも可（推奨は .env.local を Git で除外）
cp .env.example .env
# もしくは
# cp .env.example .env.local
# .env / .env.local を編集（下記「環境変数」を参照）
```

3. データベースを起動（ローカル Postgres）

```bash
npm run db:up
```

4. Prisma マイグレーションとクライアント生成

```bash
npx prisma migrate dev
npx prisma generate
```

5. 開発サーバーを起動

```bash
npm run dev
# <http://localhost:3000> を開く
```

6. チャネル情報の登録（画面から）

- ダッシュボード → 設定 → 「チャネル情報の保存」で以下を入力し保存
  - チャネル ID（LINE Developers で確認）
  - チャネルシークレット
  - チャネルアクセストークンの入力は不要（本アプリが自動発行します）

7. 動作確認（任意）

- ダッシュボード: <http://localhost:3000/dashboard>
- 送信フォーム: <http://localhost:3000/dashboard/messages>
- 設定（読み取り）: <http://localhost:3000/dashboard/settings>

---

## 環境変数（.env / .env.local）

最低限必要な値（ローカル検証）

- `DATABASE_URL` 例: `postgresql://postgres:postgres@localhost:5432/line_app?schema=public`

オプション（機能別に必要）

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - リアルタイムイベント通知を使う場合に必要
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - **画像メッセージ送信**または**リッチメニュー作成**を使う場合に必須
  - 無料プランで開始可能（詳細は後述）
- `SENTRY_DSN` ほか監視系
  - エラー監視を使う場合に必要

注意

- 本 POC は「チャネル設定（チャネル ID/シークレット）は 画面（設定 → チャネル情報）から保存」します。アクセストークンは保存せず、送信時に自動発行（OAuth2 Client Credentials）しメモリにキャッシュします。

---

## Cloudinary セットアップ（画像機能を使う場合）

Cloudinaryは画像のアップロード・保存・配信を行うクラウドサービスです。

### 必要な機能

以下の機能を使う場合、Cloudinaryの設定が必須です：

- **画像メッセージの送信** (`/dashboard/messages/image`)
- **リッチメニューの作成** (`/dashboard/richmenu/new`)

### セットアップ手順

1. **アカウント作成（無料）**
   - https://cloudinary.com/ にアクセス
   - 「Sign up for free」をクリック
   - メールアドレスで登録（Googleアカウントでも可）

2. **APIキーの取得**
   - ログイン後、ダッシュボードに表示される以下の情報をコピー：
     - **Cloud Name** (例: `dxxxxxxxxxxxxx`)
     - **API Key** (例: `123456789012345`)
     - **API Secret** (例: `abcdefghijklmnopqrstuvwxyz123`)

3. **環境変数に設定**

`.env`ファイルに以下を追加：

```env
# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=あなたのcloud_name
CLOUDINARY_API_KEY=あなたのapi_key
CLOUDINARY_API_SECRET=あなたのapi_secret
```

4. **開発サーバーを再起動**

```bash
# 停止して再起動
npm run dev
```

### 料金について

- **無料プラン**: 月25クレジット、25GB ストレージ、25GB 帯域幅
  - 開発・テスト環境には十分です
- 有料プランは必要に応じてアップグレード可能

### 代替手段

Cloudinaryを使わない場合、以下の選択肢があります：

- **AWS S3**: Amazon Web Servicesのストレージサービス
- **Supabase Storage**: オープンソースのストレージサービス
- **ローカルストレージ**: 開発環境のみ（本番環境には非推奨）

これらを使う場合は、`/api/upload/richmenu-image/route.ts` と `/api/uploads/image/route.ts` の実装を変更する必要があります。

---

## データベースと Prisma

- 起動: `npm run db:up`
- マイグレーション/生成: `npx prisma migrate dev && npx prisma generate`
- ログ: `npm run db:logs`
- psql: `npm run db:psql`
- リセット: `npm run db:reset`
- **Prisma Studio（GUI）**: `npx prisma studio`
  - ブラウザベースのデータベース管理ツール
  - http://localhost:5555 で起動
  - テーブルデータの閲覧・作成・編集・削除が可能

主要モデル（抜粋）

- `User`（`lineUserId`, `displayName`, `isFollowing`）
- `Message`（`type`, `content`, `direction`, `userId`, `deliveryStatus`）
- `Template` / `Broadcast` / `Tag` / `UserTag`

---

## 認証

この POC にはアプリ内認証は含めていません（デモ用途）。公開環境では必ずリバースプロキシや社内 VPN 等でアクセス制御してください。

---

## Webhook のセットアップ（Messaging API）

Cloudflare Tunnel（Quick Tunnels）を使ってローカルを公開する前提です。

1. cloudflared を用意

- macOS（Homebrew）: `brew install cloudflare/cloudflare/cloudflared`
- 公式バイナリ（任意）: https://github.com/cloudflare/cloudflared/releases

2. トンネルを起動（別ターミナル）

```bash
cloudflared tunnel --config /dev/null --no-autoupdate --url http://localhost:3000
```

- 数秒後、`https://xxxx-xxxx.trycloudflare.com` のような URL が表示されます
- URL だけ抽出したい場合（任意）:

```bash
cloudflared tunnel --config /dev/null --no-autoupdate --url http://localhost:3000 \
  2>&1 | sed -nE 's/.*(https:\/\/[a-z0-9-]+\.trycloudflare\.com).*/\1/p' | tail -n1
```

3. LINE Developers → 対象チャネルの Webhook 設定

- Webhook URL: `https://<上で出たURL>/api/line/webhook`
- 「Webhook を利用する」をオン
- 「検証」ボタンで 200 OK を確認

4. 署名検証と注意

- 本アプリは DB に保存されたチャネルシークレットで `x-line-signature` を検証します（未設定/不一致は 400）
- Quick Tunnels は再起動で URL が変わります。cloudflared を再起動したら Webhook URL も更新してください

5. アクセストークンについて

- 送信時はチャネル ID/シークレットから OAuth2 Client Credentials でチャネルアクセストークンを自動発行し、メモリにキャッシュします（期限前に自動更新）

### Webhook の自己診断（Selftest）

- 画面: `/dashboard/dev` → 「Webhook チェック」
- ローカルに送る: アプリ内で `/api/line/webhook` に署名付きで自己呼び出し（200 ならアプリ実装と署名検証は OK）
- 公開 URL に送る: Cloudflare Tunnel の URL を入力して実行（ドメインのみ or `/api/line/webhook` までの完全 URL のどちらでも可）
  - 200: トンネル経由も OK（LINE → 公開 URL → アプリ の流れと同等）
  - 400: 署名不一致/シークレット未設定など。`/dashboard/settings` の値を再確認
  - ERR: fetch 失敗。URL のミスやトンネル停止を確認

Selftest の結果はボタン下に表示され、ページ下部の DebugPanel に raw の `url/status/body` も表示されます。

### 友だち追加リンク／QR の表示

- `/dashboard/settings` に「ベーシック ID（@なし推奨）」または「友だち追加 URL（lin.ee 等）」を保存
- `/dashboard/dev` に「友だち追加 QR」とリンクが表示されます（コピー可）

### E2E 動作確認のチェックリスト

1. 友だち追加 QR からボットを追加し、ブロックしていないことを確認
2. あなたの LINE からボットに「こんにちは」等のテキストを送信
   - 期待: すぐに「メッセージありがとうございます！」と自動返信
   - `/dashboard/messages` に IN（受信）が 1 件追加
   - `/dashboard/users` にユーザーが表示（最終メッセージ時刻も更新）
3. こちらからの送信確認
   - `/dashboard/messages` で `lineUserId` と本文を入力 → 送信
   - 期待: OUT（送信）が表示され、相手の LINE に届く

うまくいかない場合

- Selftest（ローカル/公開）を再度実行して 200 を確認（トンネル URL が変わると LINE 側 URL も更新が必要）
- 友だち追加・ブロック状態を確認
- 署名検証（チャネルシークレット）が一致しているか `/dashboard/settings` の値と LINE Developers の値を照合

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

- `npm run dev` 開発サーバー起動（<http://localhost:3000>）
- `npm run build` 本番ビルド / `npm start` 起動
- `npm run lint` ESLint（Next core-web-vitals + TS）
- `npm test` / `npm run test:watch` テスト実行
- DB: `npm run db:up | db:down | db:logs | db:psql | db:reset`
- Prisma Studio: `npx prisma studio` ブラウザでデータベースを管理（http://localhost:5555）

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

- `.env` または `.env.local` に秘密情報を置き、Git にコミットしない（`.gitignore` は両方を除外）
- アクセストークン/シークレットは定期ローテーション
- ログに個人情報やトークンを出力しない
- 本 POC のエラーハンドリングは簡易実装。運用時は監視/通知を追加

---

## ライセンス

MIT
