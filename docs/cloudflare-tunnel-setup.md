# Cloudflare Tunnel セットアップガイド

このドキュメントでは、ローカル環境で動作しているLINE Messaging Appを、Cloudflare Tunnelを使用して公開URLでアクセス可能にする方法を説明します。

## 概要

Cloudflare Tunnelは、ローカルサーバーを安全にインターネットに公開するための無料サービスです。

### 主な利点

✅ **完全無料** - 無制限のトンネル・帯域幅
✅ **自動HTTPS** - SSL証明書が自動で提供される
✅ **LINE Webhook対応** - LINEが要求するHTTPSエンドポイントを即座に提供
✅ **DDoS保護** - Cloudflareのセキュリティ機能が自動適用
✅ **コード変更不要** - 既存のアプリケーションに透過的に動作

## セットアップ方法

### オプション1: クイックトンネル（テスト用）

最も簡単な方法。すぐにテストできますが、URLが再起動のたびに変わります。

```bash
# 1. cloudflaredをインストール
brew install cloudflared

# 2. Next.js開発サーバーを起動（別ターミナル）
npm run dev

# 3. トンネルを起動
npm run tunnel:quick
# または
cloudflared tunnel --url http://localhost:3000
```

**出力例:**
```
2024-01-15 10:00:00 INF +--------------------------------------------------------------------------------------------+
2024-01-15 10:00:00 INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2024-01-15 10:00:00 INF |  https://abc-def-123.trycloudflare.com                                                    |
2024-01-15 10:00:00 INF +--------------------------------------------------------------------------------------------+
```

このURLを使ってすぐにテストできます。

**注意:** URLは毎回変わるため、LINE Webhook設定には不向きです。

---

### オプション2: 名前付きトンネル（本番推奨）★

永続的なURLを取得できます。LINE Webhook設定に最適です。

#### ステップ1: cloudflaredのインストール

```bash
brew install cloudflared
cloudflared --version
```

#### ステップ2: Cloudflareアカウントにログイン

```bash
cloudflared tunnel login
```

ブラウザが開き、Cloudflareアカウントでログインします。認証が完了すると、`~/.cloudflared/cert.pem` が作成されます。

#### ステップ3: トンネルを作成

```bash
cloudflared tunnel create line-messaging-app
```

**出力例:**
```
Tunnel credentials written to /Users/hiraoku.shinichi/.cloudflared/12345678-abcd-efgh-ijkl-mnopqrstuvwx.json
Created tunnel line-messaging-app with id 12345678-abcd-efgh-ijkl-mnopqrstuvwx
```

このTunnel IDをメモしておきます。

#### ステップ4: 設定ファイルを作成

`~/.cloudflared/config.yml` を作成します：

```yaml
tunnel: 12345678-abcd-efgh-ijkl-mnopqrstuvwx  # ステップ3で取得したID
credentials-file: /Users/hiraoku.shinichi/.cloudflared/12345678-abcd-efgh-ijkl-mnopqrstuvwx.json

ingress:
  # メインアプリケーション
  - hostname: line-app.yourdomain.com
    service: http://localhost:3000
    originRequest:
      connectTimeout: 30s

  # Webhookエンドポイント（オプション：別サブドメインで分離する場合）
  # - hostname: webhook.line-app.yourdomain.com
  #   path: /api/line/webhook
  #   service: http://localhost:3000

  # 必須: キャッチオール
  - service: http_status:404
```

**ファイル作成コマンド:**
```bash
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: YOUR-TUNNEL-ID
credentials-file: /Users/hiraoku.shinichi/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  - hostname: line-app.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF
```

`YOUR-TUNNEL-ID` を実際のIDに置き換えてください。

#### ステップ5: DNS設定

**方法A: コマンドで自動設定（推奨）**

```bash
cloudflared tunnel route dns line-messaging-app line-app.yourdomain.com
```

**方法B: Cloudflareダッシュボードで手動設定**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 使用するドメインを選択
3. DNS → Records → Add record
   - Type: `CNAME`
   - Name: `line-app`（サブドメイン部分）
   - Target: `12345678-abcd-efgh-ijkl-mnopqrstuvwx.cfargotunnel.com`
   - Proxy status: Proxied（オレンジクラウド）

#### ステップ6: トンネルを起動

```bash
# package.jsonのスクリプトを使用
npm run tunnel

# または直接実行
cloudflared tunnel run line-messaging-app
```

**成功すると:**
```
2024-01-15 10:00:00 INF Starting tunnel tunnelID=12345678-abcd-efgh-ijkl-mnopqrstuvwx
2024-01-15 10:00:01 INF Connection registered connIndex=0 location=NRT
2024-01-15 10:00:01 INF Connection registered connIndex=1 location=NRT
2024-01-15 10:00:01 INF Connection registered connIndex=2 location=NRT
2024-01-15 10:00:01 INF Connection registered connIndex=3 location=NRT
```

これで `https://line-app.yourdomain.com` でアプリケーションにアクセスできます！

---

## 環境変数の設定

`.env.local` ファイルに以下を追加します：

```bash
# Cloudflare Tunnel settings
NEXT_PUBLIC_BASE_URL=https://line-app.yourdomain.com
WEBHOOK_URL=https://line-app.yourdomain.com/api/line/webhook

# オプション: トンネルメタデータ
CLOUDFLARE_TUNNEL_ID=12345678-abcd-efgh-ijkl-mnopqrstuvwx
CLOUDFLARE_TUNNEL_NAME=line-messaging-app
```

---

## LINE Webhook設定

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. チャネルを選択
3. **Messaging API設定** タブ
4. **Webhook設定** セクション
   - Webhook URL: `https://line-app.yourdomain.com/api/line/webhook`
   - Use webhook: **有効**
5. **検証** ボタンをクリックして接続を確認

**成功メッセージ:**
```
Success
Webhook URL is valid and reachable.
```

---

## トンネルの運用

### トンネル情報の確認

```bash
# トンネル情報を表示
npm run tunnel:info

# または
cloudflared tunnel info line-messaging-app
```

### トンネルの停止

トンネルを起動したターミナルで `Ctrl+C` を押します。

### バックグラウンド実行（macOS）

システムサービスとして常時起動する場合：

```bash
# サービスとしてインストール
sudo cloudflared service install

# サービスを起動
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# サービスを停止
sudo launchctl unload /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

### 開発ワークフロー

**ターミナル1: Next.js開発サーバー**
```bash
npm run dev
```

**ターミナル2: Cloudflare Tunnel**
```bash
npm run tunnel
```

両方を起動しておけば、ローカルで開発しながらLINE Webhookを受信できます。

---

## トラブルシューティング

### トンネルは動作しているが、アプリにアクセスできない

**原因:** Next.js開発サーバーが起動していない

**解決策:**
```bash
# 別ターミナルで
npm run dev
```

### `Error 1033: Argo Tunnel error`

**原因:** DNS設定が正しくない、またはトンネルIDが間違っている

**解決策:**
1. `~/.cloudflared/config.yml` のトンネルIDを確認
2. DNS CNAMEレコードが正しく設定されているか確認
3. トンネルを再起動

### LINE Webhook検証が失敗する

**原因:**
- トンネルが起動していない
- Next.jsサーバーが起動していない
- Webhook URLが間違っている

**解決策:**
1. トンネルが起動しているか確認: `npm run tunnel:info`
2. Next.jsサーバーが起動しているか確認: `curl http://localhost:3000`
3. Webhook URLをブラウザで直接アクセスして確認

### 署名検証エラー（Signature validation failed）

**原因:** LINE Channel Secretが正しくない

**解決策:**
1. `.env.local` の `LINE_CHANNEL_SECRET` を確認
2. LINE Developers ConsoleのChannel Secretと一致しているか確認
3. データベースに正しいChannel Secretが登録されているか確認

---

## セキュリティのベストプラクティス

### 1. 署名検証（実装済み）✓

アプリケーションは既にLINEの署名検証を実装しています（`src/app/api/line/webhook/route.ts`）。

### 2. HTTPS強制

Cloudflare Tunnelは自動的にHTTPSを提供します。HTTPアクセスは自動的にHTTPSにリダイレクトされます。

### 3. レート制限

Cloudflareダッシュボードでレート制限ルールを設定できます：

1. Security → WAF → Rate limiting rules
2. ルールを作成:
   - **Path**: `/api/line/webhook`
   - **Limit**: 100 requests per minute
   - **Action**: Block

### 4. IP制限（オプション）

LINE Webhookは特定のIPアドレスから送信されます。Cloudflare Firewallで制限できます：

1. Security → WAF → Firewall rules
2. Create rule:
   - **Field**: IP Source Address
   - **Operator**: is in
   - **Value**: LINE WebhookのIPレンジ
   - **Action**: Allow

---

## FAQ

### Q: トンネルは無料ですか？

**A:** はい、Cloudflare Tunnelは完全無料です。帯域幅、トンネル数、接続数に制限はありません。

### Q: 複数のトンネルを作成できますか？

**A:** はい、無制限にトンネルを作成できます。開発環境、ステージング環境ごとに別のトンネルを作成できます。

### Q: 独自ドメインが必要ですか？

**A:**
- **クイックトンネル**: 不要（`*.trycloudflare.com`が自動生成）
- **名前付きトンネル**: 推奨（Cloudflare DNSで管理されているドメイン）

無料のCloudflareアカウントでドメインを管理できます。

### Q: ngrokとの違いは？

**A:**

| 機能 | Cloudflare Tunnel | ngrok |
|-----|------------------|-------|
| 価格 | 完全無料 | 無料版は制限あり、有料$8-39/月 |
| カスタムドメイン | 無料 | 有料プランのみ |
| 帯域幅 | 無制限 | 無制限 |
| リクエスト検査 | 基本 | 詳細UI |
| セキュリティ | DDoS保護付き | 有料で追加 |

### Q: トンネルが切断されたらどうなりますか？

**A:** Cloudflare Tunnelは自動的に再接続を試みます。一時的な切断でも問題ありません。

---

## 参考リンク

- [Cloudflare Tunnel公式ドキュメント](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [LINE Messaging API Webhook仕様](https://developers.line.biz/ja/reference/messaging-api/#webhooks)
- [Cloudflareダッシュボード](https://dash.cloudflare.com/)

---

## サポート

問題が発生した場合は、以下を確認してください：

1. **トンネルステータス**: `npm run tunnel:info`
2. **Next.jsログ**: ターミナルで開発サーバーのログを確認
3. **Cloudflareログ**: トンネル起動ターミナルのログを確認
4. **Webhookログ**: アプリケーション内の `/api/line/webhook` のログを確認
