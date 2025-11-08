# LINE Messaging App POC

LINE Messaging API を活用した統合メッセージング管理システムの概念実装（POC）

## セットアップ

1. 依存関係をインストール
```bash
npm install
```

2. 環境変数を設定
```bash
cp .env.example .env.local
# .env.local に必要な値を設定
```

3. データベースをセットアップ（Prisma）
```bash
npx prisma migrate dev
npx prisma generate
```

4. テストを実行
```bash
npm test
```

5. 開発サーバーを起動
```bash
npm run dev
```

## 技術スタック

- フロントエンド: Next.js 16 (App Router + Turbopack), React 19, TypeScript 5.6+
- UI: Tailwind CSS 4.0-alpha, shadcn/ui
- 状態管理: Jotai 2.10+
- データフェッチ: TanStack Query v5
- バックエンド: Next.js API Routes, @line/bot-sdk
- 認証: NextAuth.js v5 (Auth.js)
- データベース: PostgreSQL + Prisma 5
- キャッシュ: Redis (Upstash)
- リアルタイム: WebSocket (Socket.io)
- ホスティング: Vercel
- 監視: Sentry, Vercel Analytics

## プロジェクト構成

```
src/
  app/
    (dashboard)/
      messages/
      users/
      broadcasts/
      templates/
      analytics/
    api/
      line/
      users/
      messages/
      templates/
  lib/
    line/
    prisma/
    auth/
    redis/
  providers/
  state/
    message/
    user/
    template/
    ui/
```

## 開発フェーズ

- Phase 1: 基盤構築（Week 1-2）
- Phase 2: コア機能（Week 3-4）
- Phase 3: 拡張機能（Week 5-6）
- Phase 4: 最適化（Week 7-8）

## ドキュメント

- [システム設計書](./docs/system-design.md)
- [テストガイド](#テスト)

## ライセンス

MIT

## テスト

Vitest と Testing Library を利用した単体テスト環境を用意しています。

- 全テスト実行: `npm test`
- ウォッチモード: `npm run test:watch`
- 設定ファイル: `vitest.config.ts`
- セットアップ: `vitest.setup.ts`

## 簡易メッセージ送信の試験

1. `.env.local` に以下の値を設定しアプリを再起動します。
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ID`（NextAuth の LINE プロバイダで使用）
2. ダッシュボード `/dashboard/messages` にアクセスします。
3. 「LINE ユーザー ID」と送信したいテキストを入力し、`送信` を押すと `/api/line/send` 経由でメッセージが送られます。
   - 成功時は画面に「メッセージを送信しました。」と表示されます。
   - エラー時はレスポンス内容に応じたメッセージが表示されます。

## 認証について

本リポジトリは NextAuth v5 で LINE ログインを前提にしています。Prisma の `User` モデルは v5 の PrismaAdapter に合わせて `name` / `image` / `emailVerified` を追加済みです。既存 DB がある場合は `npx prisma migrate dev` を実行してください。

## 設定（チャネル情報）

ランタイムで使用するチャネル情報は環境変数をソース・オブ・トゥルースとしています。

- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`

ダッシュボードの設定画面は現在、環境変数の設定状況を参照する読み取り専用 UI です。値の更新は `.env.local` を編集し、サーバー再起動後に反映されます。
