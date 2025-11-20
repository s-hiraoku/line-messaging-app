import Link from "next/link";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({ weight: "800", subsets: ["latin"], display: "swap" });
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = { title: "設計仕様 (全体) | LINE Messaging App" };

// 設計仕様セクション (体系的に整理・拡充)
const sections: { id: string; title: string; subsections?: { title: string; items: string[] }[] }[] = [
  {
    id: "goal-scope",
    title: "ゴール / スコープ",
    subsections: [
      {
        title: "プロジェクト目的",
        items: [
          "LINE Messaging API を中心とした統合メッセージング運用基盤の PoC 開発",
          "個別送信 / ブロードキャスト / テンプレート / 自動応答 / Webhook 受信の一元管理",
          "開発速度・拡張性・検証容易性を重視した技術選定 (Next.js App Router + Prisma + Jotai)",
        ],
      },
      {
        title: "MVP スコープ",
        items: [
          "基本メッセージ送信 (テキスト / 画像 / スタンプ)",
          "ユーザー・タグ管理と絞り込み配信",
          "自動返信ルール (キーワード / 正規表現)",
          "Webhook 受信と署名検証",
          "リッチメニュー作成 (Imagemap エディタ)",
          "開発支援ツール (Webhook 診断 / ログ表示)",
        ],
      },
      {
        title: "将来拡張計画",
        items: [
          "マルチチャネル対応 (複数 LINE アカウント管理)",
          "役割ベース権限 (管理者 / 運用担当 / 閲覧のみ)",
          "高度なセグメント (複合条件 / 行動履歴フィルタ)",
          "A/B テストとテンプレート効果測定",
          "バックグラウンドジョブ (大量配信キュー / 分析集計)",
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "アーキテクチャ",
    subsections: [
      {
        title: "技術スタック",
        items: [
          "フロントエンド: Next.js 16 (App Router) + React + TypeScript + Tailwind CSS",
          "状態管理: Jotai (atom ベース) + 将来 TanStack Query でサーバー状態",
          "バックエンド: Next.js API Routes + LINE Bot SDK",
          "データベース: PostgreSQL + Prisma ORM",
          "キャッシュ: Upstash Redis (セッション / レート制限)",
          "リアルタイム (計画): Socket.io + Redis Pub/Sub",
          "画像ストレージ: Cloudinary",
          "監視: Sentry (エラー追跡 / パフォーマンス)",
          "開発環境: Cloudflare Tunnel (Webhook 公開)",
        ],
      },
      {
        title: "レイヤー構成",
        items: [
          "Presentation: Next.js pages + React components (UI)",
          "Application: Server Actions / API route handlers (ビジネスロジック)",
          "Domain / State: Jotai atoms + React Query caches (状態管理)",
          "Integration: LINE SDK / Prisma / Redis / Socket.io (外部連携)",
          "Infrastructure: PostgreSQL / Redis / CDN / Sentry (インフラ)",
        ],
      },
      {
        title: "データフロー",
        items: [
          "Inbound: LINE Webhook → 署名検証 → イベント処理 → DB 永続化 → Socket.io 配信",
          "Outbound: UI 操作 → Server Action → LINE API 送信 → DB 永続化 → ステータス更新",
          "Real-time: Redis Pub/Sub → Socket.io → クライアント再取得 (React Query invalidation)",
        ],
      },
    ],
  },
  {
    id: "data-model",
    title: "データモデル",
    subsections: [
      {
        title: "主要エンティティ",
        items: [
          "User: LINE ユーザー情報 (lineUserId / displayName / pictureUrl / isFollowing)",
          "Message: 送受信メッセージ (type / content / direction / deliveryStatus)",
          "Template: 再利用テンプレート (name / type / content / variables / category / isActive)",
          "Broadcast: 一斉送信ジョブ (name / content / scheduledAt / status / audience)",
          "Tag: ユーザー分類ラベル (name / color / description)",
          "UserTag: User と Tag の多対多関連 (userId / tagId)",
          "AutoReply: 自動返信ルール (name / keywords / matchType / priority / isActive / replyText)",
          "AutoReplyLog: 実行履歴 (userId / autoReplyId / matchedKeyword / executedAt)",
          "ChannelConfig: LINE チャネル設定 (channelId / channelSecret / channelAccessToken)",
        ],
      },
      {
        title: "列挙型",
        items: [
          "MessageDirection: INBOUND / OUTBOUND",
          "MessageType: TEXT / IMAGE / VIDEO / AUDIO / LOCATION / STICKER / IMAGEMAP / FLEX / TEMPLATE / COUPON",
          "BroadcastStatus: DRAFT / SCHEDULED / SENDING / SENT / FAILED",
          "MatchType (AutoReply): EXACT / PARTIAL / PREFIX / REGEX",
        ],
      },
      {
        title: "リレーション",
        items: [
          "User ← messages (1:N)",
          "User ← tags via UserTag (M:N)",
          "User ← broadcasts via Broadcast audience (M:N)",
          "Message → user (N:1)",
          "Message → template (N:1, optional)",
          "Template ← messages (1:N)",
          "AutoReply ← logs (1:N)",
        ],
      },
      {
        title: "インデックス戦略",
        items: [
          "User(lineUserId) UNIQUE",
          "Message(userId, createdAt DESC) 履歴取得高速化",
          "Tag(name) UNIQUE",
          "Broadcast(status, scheduledAt) ジョブキュー検索",
          "AutoReply(isActive, priority) ルール評価順序",
          "AutoReplyLog(userId, executedAt DESC) ユーザー別ログ",
        ],
      },
    ],
  },
  {
    id: "core-features",
    title: "主要機能詳細",
    subsections: [
      {
        title: "メッセージ送信",
        items: [
          "個別送信: ユーザー ID 指定で 1:1 配信",
          "ブロードキャスト: 全体 / タグ別 / 条件フィルタで一斉配信",
          "メッセージタイプ: テキスト / 画像 / スタンプ / カード / Imagemap / Flex",
          "プレビュー機能: 送信前に表示崩れを確認",
          "配信ステータス追跡: 成功 / 失敗 / 保留の可視化",
          "履歴管理: 送受信ログの永続化と検索",
        ],
      },
      {
        title: "自動応答システム",
        items: [
          "マッチタイプ: 完全一致 / 部分一致 / 前方一致 / 正規表現",
          "優先度制御: 複数ルールマッチ時は優先度順で最初のみ実行",
          "有効化/無効化: ルール単位で ON/OFF 切り替え",
          "返信バリエーション: 複数候補をランダム選択",
          "実行ログ: ヒット回数 / マッチキーワード / ユーザー / 実行日時",
          "統計ダッシュボード: ルール別ヒット率 / 誤爆検出",
        ],
      },
      {
        title: "Webhook 処理",
        items: [
          "署名検証: X-Line-Signature ヘッダーと Channel Secret で HMAC 検証",
          "イベント分類: follow / unfollow / message / postback",
          "ユーザー同期: フォロー時に User レコード作成 / アンフォロー時に isFollowing 更新",
          "メッセージ永続化: 受信メッセージを Message テーブルへ保存",
          "自動返信トリガー: メッセージ受信時にルール評価 → 返信送信",
          "エラーハンドリング: 署名検証失敗は 400 / 処理失敗は 500 (リトライ考慮)",
        ],
      },
      {
        title: "ユーザー・タグ管理",
        items: [
          "ユーザー一覧: フォロー状態 / タグ / 最終アクティブ日でフィルタ",
          "詳細ビュー: 個別ユーザーの送受信履歴 / タグ編集",
          "タグ一括付与: チェックボックス選択 → タグ追加/削除",
          "セグメント配信: タグを条件に絞り込んでメッセージ送信",
          "離脱分析: ブロック済みユーザーの抽出と再活性化施策",
        ],
      },
      {
        title: "テンプレート管理",
        items: [
          "テンプレート作成: 種別 (テキスト / 画像 / カード) + 変数埋め込み",
          "変数置換: {{name}} {{date}} 等のプレースホルダを送信時に実データで差し込み",
          "カテゴリ分類: キャンペーン / 定期連絡 / FAQ / 緊急通知",
          "有効化管理: 不要テンプレートを無効化して一覧から隠蔽",
          "再利用: メッセージ作成時にテンプレート選択 → 微調整可能",
        ],
      },
      {
        title: "リッチメニュー (Imagemap)",
        items: [
          "画像アップロード: Cloudinary 経由で公開 URL 取得",
          "ビジュアルエディタ: ドラッグで矩形領域作成 + アクション設定",
          "アクションタイプ: URL 遷移 / メッセージ送信 / Postback",
          "プレビュー: PC / モバイル表示切り替え",
          "適用管理: 全体 or 特定タグのユーザーへ配信",
        ],
      },
      {
        title: "開発支援ツール",
        items: [
          "Webhook 診断: 署名検証 / URL 疎通 / イベント受信テスト",
          "リアルタイムログ: 送受信イベントをダッシュボードへ即時表示",
          "Cloudflare Tunnel 連携: ローカル開発環境を公開 URL 化",
          "デバッグパネル: 環境変数 / 設定値の可視化",
        ],
      },
    ],
  },
  {
    id: "directories",
    title: "ディレクトリ構成",
    subsections: [
      {
        title: "src/app (Pages & API)",
        items: [
          "dashboard/*: 運用 UI (messages / users / broadcasts / templates / auto-reply / richmenu / analytics / settings / webhook-check)",
          "api/line/*: LINE API 連携 (send / broadcast / webhook)",
          "api/users/*: ユーザー CRUD",
          "api/messages/*: メッセージ履歴取得",
          "api/templates/*: テンプレート CRUD",
          "api/auto-reply/*: 自動返信ルール CRUD",
          "api/broadcasts/*: ブロードキャストジョブ管理",
        ],
      },
      {
        title: "src/lib (Services & Utils)",
        items: [
          "line/: LINE SDK ラッパー (client.ts / webhook.ts / imagemap.ts)",
          "auto-reply/: マッチング / 実行ロジック (matcher.ts / executor.ts)",
          "prisma/: Prisma client helper",
          "auth/: 認証 (将来 NextAuth 統合)",
          "redis/: Redis 接続 (キャッシュ / レート制限)",
          "realtime/: Socket.io サーバー (計画)",
          "cloudinary/: 画像アップロード",
          "utils/: 汎用ヘルパー (validation / format / error)",
        ],
      },
      {
        title: "src/state (Jotai Atoms)",
        items: [
          "message/: メッセージ関連 atoms (selectedMessage / filters)",
          "user/: ユーザー関連 atoms (selectedUsers / tagFilters)",
          "template/: テンプレート atoms (selectedTemplate / category)",
          "ui/: UI 状態 (sidebarOpen / modal / toast)",
          "broadcast/: ブロードキャストジョブ atoms",
        ],
      },
      {
        title: "src/components",
        items: [
          "layout/: Header / Sidebar / Footer",
          "ui/: 再利用コンポーネント (Button / Input / Modal / Toast / Card)",
          "message/: メッセージ UI (MessageCard / MessageForm / PreviewPanel)",
          "user/: ユーザー UI (UserList / UserDetail / TagEditor)",
          "richmenu/: リッチメニューエディタ (Canvas / AreaEditor / ActionSelector)",
        ],
      },
      {
        title: "prisma/",
        items: [
          "schema.prisma: データモデル定義",
          "migrations/: マイグレーション履歴",
          "seed.ts: 開発用初期データ投入",
        ],
      },
    ],
  },
  {
    id: "api-reference",
    title: "API リファレンス",
    subsections: [
      {
        title: "メッセージ送信",
        items: [
          "POST /api/line/send: 個別送信 { to: string, message: object }",
          "POST /api/line/broadcast: 一斉送信 { name?: string, message: object, filters?: object }",
          "GET /api/messages: メッセージ履歴取得 ?take=20&cursor=xxx",
        ],
      },
      {
        title: "ユーザー管理",
        items: [
          "GET /api/users: ユーザー一覧 ?q=keyword&tags=tag1,tag2&take=50",
          "GET /api/users/[id]: ユーザー詳細",
          "PATCH /api/users/[id]: ユーザー情報更新",
          "POST /api/users/[id]/tags: タグ追加 { tagIds: string[] }",
          "DELETE /api/users/[id]/tags: タグ削除 { tagIds: string[] }",
        ],
      },
      {
        title: "テンプレート",
        items: [
          "GET /api/templates: テンプレート一覧 ?category=xxx&isActive=true",
          "POST /api/templates: テンプレート作成 { name, type, content, variables, category }",
          "PATCH /api/templates/[id]: テンプレート更新",
          "DELETE /api/templates/[id]: テンプレート削除",
        ],
      },
      {
        title: "自動返信",
        items: [
          "GET /api/auto-reply: ルール一覧",
          "POST /api/auto-reply: ルール作成 { name, keywords[], matchType, priority, replyText }",
          "PATCH /api/auto-reply/[id]: ルール更新",
          "DELETE /api/auto-reply/[id]: ルール削除",
          "GET /api/auto-reply/[id]/logs: 実行ログ ?from=date&to=date",
        ],
      },
      {
        title: "ブロードキャスト",
        items: [
          "GET /api/broadcasts: ジョブ一覧 ?status=SENDING",
          "POST /api/broadcasts: ジョブ作成 { name, content, scheduledAt?, audienceFilter }",
          "PATCH /api/broadcasts/[id]: ジョブ更新 (スケジュール変更等)",
          "POST /api/broadcasts/[id]/execute: ジョブ実行",
          "DELETE /api/broadcasts/[id]: ジョブ削除",
        ],
      },
      {
        title: "Webhook",
        items: [
          "POST /api/line/webhook: LINE イベント受信 (X-Line-Signature 必須)",
        ],
      },
    ],
  },
  {
    id: "state-management",
    title: "状態管理戦略",
    subsections: [
      {
        title: "Jotai Atoms パターン",
        items: [
          "Primitive atoms: ユーザー ID / フィルタ条件など基本値",
          "Derived atoms: selectedUsers = users.filter(filters) など計算値",
          "Async atoms: API fetch を内包 (将来 TanStack Query へ移行)",
          "UI atoms: modal / toast / sidebar 状態",
        ],
      },
      {
        title: "React Query 統合 (計画)",
        items: [
          "GET 系: useQuery でキャッシュファースト + 30-60秒 refetch",
          "POST/PATCH: useMutation + optimistic update",
          "Invalidation: 成功時に関連クエリを invalidate",
          "Prefetch: 遷移前にデータ先読み (UX 向上)",
        ],
      },
      {
        title: "データアクセスパターン",
        items: [
          "Read-heavy: React Query でキャッシュ",
          "Write: Server Action → DB 更新 → invalidate",
          "Real-time: Socket.io でイベント受信 → Query refetch",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "セキュリティ",
    subsections: [
      {
        title: "認証・認可",
        items: [
          "NextAuth (計画): LINE OAuth / Email provider",
          "Session: httpOnly secure cookies + 8h 有効期限 + rolling refresh",
          "Server Action: getServerSession で認証チェック",
          "役割ベース (将来): ADMIN / OPERATOR / VIEWER",
        ],
      },
      {
        title: "Webhook セキュリティ",
        items: [
          "署名検証: X-Line-Signature と Channel Secret で HMAC-SHA256 検証",
          "早期 return: 検証失敗は即 400 応答",
          "リプレイ攻撃対策 (計画): timestamp チェック + Redis で重複防止",
        ],
      },
      {
        title: "レート制限",
        items: [
          "Redis token bucket: 送信 API は 100req/min/IP",
          "Broadcast: 同時ジョブ 2 個まで",
          "LINE API 制限: 公式制限に準拠 (500msg/sec 等)",
        ],
      },
      {
        title: "データ保護",
        items: [
          "環境変数: .env.local に秘匿情報 (Git 除外)",
          "PII ログ除外: ユーザー名 / メッセージ内容はログに出さない",
          "SQL Injection: Prisma ORM でパラメータ化クエリ",
          "XSS: React の自動エスケープ + DOMPurify (リッチテキスト時)",
        ],
      },
    ],
  },
  {
    id: "monitoring",
    title: "監視・運用",
    subsections: [
      {
        title: "ログ戦略",
        items: [
          "開発: console.log でシンプル出力",
          "本番: 構造化 JSON ログ (timestamp / level / userId / traceId)",
          "ログレベル: DEBUG / INFO / WARN / ERROR",
          "PII 除外: ユーザー名は ID ハッシュで記録",
        ],
      },
      {
        title: "エラー追跡",
        items: [
          "Sentry: フロント・API エラーを自動捕捉",
          "Source maps: ビルド時アップロードで本番スタックトレース解析",
          "Context 付与: userId / requestId / 環境情報",
        ],
      },
      {
        title: "パフォーマンス監視",
        items: [
          "Sentry Performance: API レスポンスタイム / フロント LCP/FID",
          "Next.js Analytics: Vercel 提供の標準分析",
          "Custom metrics (計画): メッセージ送信成功率 / Webhook 遅延",
        ],
      },
      {
        title: "アラート",
        items: [
          "Sentry アラート: エラー率 > 5% / 応答時間 > 3秒",
          "カスタム通知 (計画): Slack 連携で失敗ジョブ即通知",
        ],
      },
    ],
  },
  {
    id: "test-strategy",
    title: "テスト戦略",
    subsections: [
      {
        title: "単体テスト",
        items: [
          "Vitest: lib/ ユーティリティ / バリデーション",
          "Testing Library: コンポーネント (振る舞い重視)",
          "カバレッジ目標: 80% (重要ロジックのみ)",
        ],
      },
      {
        title: "統合テスト",
        items: [
          "API Route テスト: Vitest + supertest 風 fetch mock",
          "DB テスト: テスト DB への Prisma マイグレーション適用",
          "Webhook シミュレーション: 署名付きリクエスト送信",
        ],
      },
      {
        title: "E2E テスト (計画)",
        items: [
          "Playwright: メッセージ送信 / Webhook 受信フロー",
          "ビジュアルリグレッション: Percy / Chromatic",
        ],
      },
      {
        title: "負荷テスト (将来)",
        items: [
          "k6: Broadcast API / Webhook 同時受信",
          "目標: 1000 req/sec / P95 < 500ms",
        ],
      },
    ],
  },
  {
    id: "dev-commands",
    title: "開発コマンド",
    subsections: [
      {
        title: "基本コマンド",
        items: [
          "npm run dev: 開発サーバー起動 (http://localhost:3000)",
          "npm run build: 本番ビルド",
          "npm start: ビルド済みアプリ起動",
          "npm run lint: ESLint 実行",
          "npm test: Vitest 実行",
          "npm run test:watch: テスト監視モード",
        ],
      },
      {
        title: "データベース",
        items: [
          "npm run db:up: Docker で PostgreSQL 起動",
          "npm run db:down: PostgreSQL 停止",
          "npx prisma migrate dev: マイグレーション適用",
          "npx prisma generate: Prisma Client 生成",
          "npx prisma studio: DB GUI ブラウザ起動",
          "npx tsx prisma/seed.ts: 初期データ投入",
        ],
      },
      {
        title: "Webhook 公開",
        items: [
          "npm run tunnel:quick: Cloudflare Tunnel 起動 (簡易)",
          "cloudflared tunnel --url http://localhost:3000: 手動起動",
        ],
      },
    ],
  },
  {
    id: "external-services",
    title: "外部サービス連携",
    subsections: [
      {
        title: "LINE Developers",
        items: [
          "Channel ID / Secret / Access Token を取得",
          "Webhook URL を登録 (https://xxx.trycloudflare.com/api/line/webhook)",
          "Messaging API 有効化",
        ],
      },
      {
        title: "Cloudinary",
        items: [
          "Cloud Name / API Key / API Secret を取得",
          "環境変数 CLOUDINARY_* に設定",
          "画像アップロード時に公開 URL 自動取得",
        ],
      },
      {
        title: "Upstash Redis",
        items: [
          "REST API URL / Token を取得",
          "環境変数 UPSTASH_REDIS_* に設定",
          "キャッシュ / レート制限に使用",
        ],
      },
      {
        title: "Sentry",
        items: [
          "DSN を取得 → 環境変数 SENTRY_DSN",
          "Next.js SDK 統合",
          "Source maps 自動アップロード",
        ],
      },
    ],
  },
  {
    id: "future-work",
    title: "将来の機能拡張",
    subsections: [
      {
        title: "Phase 2 (3-6ヶ月)",
        items: [
          "マルチチャネル: 複数 LINE アカウント管理",
          "役割ベース権限: ADMIN / OPERATOR / VIEWER",
          "高度セグメント: 複合条件 (AND/OR) + 行動履歴フィルタ",
          "A/B テスト: テンプレート variant の効果測定",
          "Background jobs: Bull / QStash でジョブキュー",
        ],
      },
      {
        title: "Phase 3 (6-12ヶ月)",
        items: [
          "分析ダッシュボード: 配信ファネル / ユーザー retention チャート",
          "Visual Template Builder: Flex Message のドラッグ＆ドロップエディタ",
          "Webhook リトライ: 失敗イベントの自動再処理",
          "Multi-region: データセンター複数配置",
          "Message table パーティション: 時間範囲で分割 (50M+ rows)",
        ],
      },
    ],
  },
];

export default function ProjectDesignSpec() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFEF5]">
      {/* Background */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.12] blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[350px] w-[350px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.10] blur-[90px]" />

      <div id="top" className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="inline-block -rotate-2 border-2 border-black bg-[#FFE500] px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Design Specification
          </span>
        </div>

        <h1
          className={`mt-12 mb-10 text-5xl font-black leading-[1.1] tracking-tight text-black sm:text-6xl lg:text-7xl ${syne.className}`}
        >
          <span className="relative inline-block ml-2">
            <span className="relative z-10 text-[#00B900]">設計仕様</span>
            <svg className="absolute -bottom-1 left-0 z-0 w-full" height="30" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0 28 Q 12.5 18, 25 24 Q 37.5 30, 50 26 Q 62.5 22, 75 24 Q 87.5 26, 100 22 Q 112.5 18, 125 20 Q 137.5 22, 150 18 Q 162.5 14, 175 16 Q 187.5 18, 200 14" stroke="#FF6B9D" strokeWidth="20" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <br />
          <span className="relative inline-block mt-4">
            <span className="relative z-10">全体アーキテクチャ要約</span>
            <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-[#2fc5c8]" />
          </span>
        </h1>

        <p className={`max-w-3xl text-lg leading-relaxed text-black/80 sm:text-xl ${ibmPlexSans.className}`}>
          README / system-design / AGENTS から抽出した PoC の包括的設計仕様。目的・機能・データ・ワークフロー・品質・拡張計画を一望し、実装/レビュー/合意形成の基盤を提供します。
        </p>

        {/* TOC */}
        <nav aria-label="目次" className="mt-12 mb-20 rounded-lg border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className={`mb-4 text-2xl font-bold text-black ${syne.className}`}>目次</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={`toc-${s.id}`}>
                <a href={`#${s.id}`} className="group inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.15em] text-black hover:text-[#00B900]">
                  <span className="inline-block h-2 w-2 rounded-full bg-black transition-colors group-hover:bg-[#00B900]" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content + Side nav */}
        <div className="flex flex-col gap-20 lg:flex-row">
          <aside className="order-last lg:order-first lg:w-72 lg:shrink-0">
            <nav className="sticky top-28 hidden lg:block rounded-lg border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <h2 className={`mb-3 text-lg font-black text-black ${syne.className}`}>セクション</h2>
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={`side-${s.id}`}>
                    <a href={`#${s.id}`} className="group flex items-center gap-2 rounded px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-black hover:bg-[#00B900]/10 hover:text-[#00B900]">
                      <span className="h-2 w-2 rounded-sm bg-black transition-colors group-hover:bg-[#00B900]" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-black/10">
                <a href="#top" className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:text-[#00B900]">
                  ↑ Top
                </a>
              </div>
            </nav>
          </aside>

          <div className="flex-1 space-y-24">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="relative">
                <h2 id={`${s.id}-heading`} className={`mb-6 text-3xl font-black text-black sm:text-4xl ${syne.className}`}>
                  {s.title}
                </h2>
                <div className={`space-y-8 text-black/80 leading-relaxed ${ibmPlexSans.className}`}>
                  {s.subsections ? (
                    s.subsections.map((sub, subIdx) => (
                      <div key={`${s.id}-sub-${subIdx}`} className="space-y-4">
                        <h3 className="text-xl font-bold text-black">{sub.title}</h3>
                        <ul className="list-disc space-y-2 pl-6">
                          {sub.items.map((item, itemIdx) => (
                            <li key={`${s.id}-sub-${subIdx}-item-${itemIdx}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 flex flex-wrap items-center gap-6">
          <Link href="/" className="border-[3px] border-black bg-[#00B900] px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:opacity-90">
            トップページへ戻る →
          </Link>
          <Link href="/guide" className="border-[3px] border-black bg-white px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFEF5]">
            利用ガイド ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
