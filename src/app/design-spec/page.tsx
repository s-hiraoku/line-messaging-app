import Link from "next/link";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({ weight: "800", subsets: ["latin"], display: "swap" });
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = { title: "設計仕様 (全体) | LINE Messaging App" };

// 設計仕様セクション (重複 items を整理し簡潔化)
const sections: { id: string; title: string; items: string[] }[] = [
  {
    id: "goal-scope",
    title: "ゴール / スコープ",
    items: [
      "LINE Messaging API を中心とした統合メッセージング運用基盤の PoC",
      "個別送信 / ブロードキャスト / テンプレート / 自動応答 / Webhook 受信 / ユーザー・タグ管理 / リッチメニュー作成",
      "開発速度・拡張性・検証容易性を重視 (Next.js App Router + Prisma + Jotai)",
      "本番想定: マルチチャネル / 冗長化 / 監視 / 役割ベース権限",
    ],
  },
  {
    id: "core-features",
    title: "主要機能",
    items: [
      "メッセージ送信: 個別 / ブロードキャスト / カード / Imagemap / リッチメニュー",
      "自動応答: キーワード/正規表現 + 優先度 + 有効状態 + 実行ログ/統計",
      "Webhook: 署名検証 + follow/unfollow/message 永続化 + 自動応答実行",
      "ユーザー管理: フォロー状態 / タグ付与 / 絞り込み",
      "テンプレート管理: 変数 / カテゴリ / 有効化",
      "開発支援: Webhook 診断 / リアルタイムログ / Cloudflare Tunnel 連携",
    ],
  },
  {
    id: "architecture",
    title: "アーキテクチャ概観",
    items: [
      "Next.js 16 App Router (UI + API Routes 一体)",
      "フロント: React + Tailwind CSS + Jotai (+ 将来 TanStack Query)",
      "バックエンド: Next.js API Routes + LINE Bot SDK + Prisma(PostgreSQL)",
      "リアルタイム(計画): Socket.io + Redis Pub/Sub (Upstash)",
      "外部: Cloudinary / Cloudflare Tunnel / Upstash Redis / Sentry",
    ],
  },
  {
    id: "directories",
    title: "ディレクトリ構成ポリシー",
    items: [
      "src/app: 画面 + API エンドポイント (ドメイン単位)",
      "src/lib: サービスクライアント / 汎用ロジック",
      "src/state: ドメイン別 atoms (message / user / template / ui)",
      "prisma: schema.prisma / migrations / seed.ts",
      "components: 再利用 UI / ドメイン固有 UI",
    ],
  },
  {
    id: "data-model",
    title: "データモデル (概要)",
    items: [
      "User / Message / Template / Broadcast / Tag / UserTag / AutoReply / AutoReplyLog / ChannelConfig",
      "AutoReply: keywords[] + matchType + priority + isActive",
      "Message: type + direction + deliveryStatus",
      "Broadcast: status + scheduledAt",
      "Template: variables(Json) + category + isActive + type",
    ],
  },
  {
    id: "workflow",
    title: "メッセージングワークフロー",
    items: [
      "UI 送信 → API → LINE SDK → 永続化 → ステータス更新",
      "Webhook: 署名検証 → イベント分類 → User/Message 保存 → 自動応答 → ログ",
      "Imagemap/リッチメニュー: Cloudinary アップロード → 公開 URL → LINE API",
    ],
  },
  {
    id: "auto-reply",
    title: "自動応答ロジック",
    items: [
      "優先度降順 + 作成日時で決定 (決定性保持)",
      "マッチタイプ: 完全 / 部分 / 前方 / 正規表現",
      "実行結果を AutoReplyLog に保存",
      "将来: latency / 再試行 / CTR 分析",
    ],
  },
  {
    id: "state-management",
    title: "状態管理",
    items: [
      "Jotai: 軽量局所状態。atoms はドメイン分割",
      "サーバーデータ: 現在 fetch + useEffect (将来 TanStack Query)",
      "リアルタイム更新計画: Socket.io 購読",
    ],
  },
  {
    id: "security",
    title: "認証 / セキュリティ",
    items: [
      "PoC: 最低限認証 (将来 NextAuth + RBAC)",
      "Webhook: x-line-signature 検証",
      "Secrets: .env(.local) 管理 / rotate 方針",
      "ログ: PII/トークン除外 + Sentry 任意",
    ],
  },
  {
    id: "external-services",
    title: "外部サービス利用",
    items: [
      "Cloudinary: 画像アップロード管理",
      "Cloudflare Tunnel: ローカル HTTPS 公開",
      "Upstash Redis: Pub/Sub (計画)",
      "PostgreSQL (Docker) + Prisma",
    ],
  },
  {
    id: "dev-commands",
    title: "開発 / コマンド",
    items: [
      "依存: npm install",
      "DB: npm run db:up / db:down / db:reset",
      "Prisma: migrate dev / generate / studio",
      "開発: npm run dev / ビルド: npm run build / 本番: npm start",
      "品質: npm test / npm run lint",
      "Tunnel: npm run tunnel / tunnel:quick",
    ],
  },
  {
    id: "test-strategy",
    title: "テスト戦略",
    items: [
      "Unit: Vitest + Testing Library",
      "Behavior: 画面遷移 / フォーム / 送信フロー",
      "将来: Playwright E2E / Socket.io 統合",
    ],
  },
  {
    id: "monitoring",
    title: "運用監視",
    items: [
      "Sentry DSN でエラー収集",
      "Webhook / Messaging 失敗率監視 (将来)",
      "Redis Pub/Sub イベント観測",
    ],
  },
  {
    id: "future-work",
    title: "既知の課題 / 今後の拡張",
    items: [
      "認証実装 (管理者ログイン / RBAC / 監査ログ)",
      "リアルタイム通信基盤 (Socket.io + Redis)",
      "Imagemap/リッチメニュー UI 高度化",
      "多言語対応 / 送信再試行キュー / 権限管理",
    ],
  },
  {
    title: "API / エラー / キャッシュ",
    items: [
      "API一覧: send / broadcast / messages / users / tags / templates / analytics / internal dispatch / reconcile",
      "レスポンス形式: {ok,data,error,meta.cursor}",
      "エラー分類: VALIDATION_ERROR / AUTH_REQUIRED / FORBIDDEN / NOT_FOUND / CONFLICT / RATE_LIMITED / UPSTREAM_FAILURE / TIMEOUT / INTERNAL_ERROR",
      "キャッシュ: React Query staleTime(メッセージ5s/ユーザー30s/テンプレ5m) + Redis集計TTL30s + 送信/Webhook/タグ/テンプレ操作でinvalidate",
    ],
  },
  {
    title: "レート制限 / RBAC",
    items: [
      "レート: send_single 30/分, broadcast_create 5/分, webhook 1000/分 (burst2x)",
      "RBACロール: ADMIN / OPERATOR / ANALYST / SUPPORT",
      "can(user,action) ポリシー評価",
      "権限制御: 送信/テンプレCRUD/分析閲覧/タグ編集 分離",
    ],
  },
  {
    title: "セキュリティ / プライバシー",
    items: [
      "HMAC署名検証 (LINE)",
      "CSRF: NextAuth + POSTのみ",
      "ヘッダ: HSTS/CSP/X-Frame-Options/X-Content-Type-Options",
      "PII最小化: displayName/pictureUrlのみ + 分析はハッシュ",
    ],
  },
  {
    title: "可観測性 / ログ",
    items: [
      "構造化ログ: level,event,requestId,userIdHash,latencyMs,errorCode",
      "Sentryトレース + エラーレポート",
      "info100% debug10%(LOG_DEBUGで拡張)",
      "ダッシュボード: 失敗率/レイテンシ/ブロードキャストスループット(将来)",
    ],
  },
  {
    title: "パフォーマンス / 容量計画",
    items: [
      "P95 API <250ms / Webhook <150ms",
      "LCP <2.5s / JS <300KB gzip",
      "月間メッセージ≈35万 (初期 <1GB)",
      "50M行超で月別パーティション",
    ],
  },
  {
    title: "障害シナリオ",
    items: [
      "LINE障害→PENDING_RETRY +指数バックオフ",
      "Redis停止→リアルタイム退避(in-memory)",
      "DB飽和→pgbouncer導入",
      "Webhook攻撃→署名+RateLimit即時拒否",
    ],
  },
  {
    title: "DR / バックアップ",
    items: [
      "RPO24h→Phase2で1h",
      "RTO<4h→自動化で30m",
      "手順: 検知→ブロードキャスト停止→復旧→再同期",
    ],
  },
  {
    title: "環境変数主要一覧",
    items: [
      "LINE_CHANNEL_*",
      "NEXTAUTH_SECRET/NEXTAUTH_URL",
      "DATABASE_URL",
      "UPSTASH_REDIS_*",
      "SENTRY_DSN",
      "FEATURE_RICH_MENU_EDITOR, ENABLE_SOCKET_IO, LOG_DEBUG",
    ],
  },
  {
    title: "フロント構成 / 状態",
    items: [
      "Featureモジュール + UIプリミティブ + useXxxフック",
      "深いprop drilling禁止",
      "楽観的更新 + WebSocket再整合",
      "リアルタイム: Socket.io / フォールバック: ポーリング",
    ],
  },
  {
    title: "アクセシビリティ",
    items: [
      "Tab移動全要素対応",
      "ライブリージョンで新着通知",
      "コントラスト>=4.5:1",
      "モーダルFocusトラップ",
    ],
  },
  {
    title: "i18n計画",
    items: [
      "Phase0: 日本語ハードコード",
      "Phase1: messages.ts抽出",
      "Phase2: next-intl導入",
      "Phase3: テンプレ変数多言語",
    ],
  },
  {
    title: "テンプレートシステム",
    items: [
      "JSON型: type=flex + variables[]",
      "変数検証/エスケープ",
      "将来: TemplateRevision版管理",
      "A/Bテスト + 自動昇格(将来)",
    ],
  },
  {
    title: "メッセージ配信ステータス",
    items: [
      "QUEUED→SENDING→SENT/FAILED/RETRYING→SENT/FAILED_FINAL",
      "再試行最大5回",
      "失敗ログ + UI再試行",
    ],
  },
  {
    title: "最適化テクニック",
    items: [
      "N+1回避: batched findMany",
      "react-virtualで長一覧",
      "next/image最適化",
      "Chunk送信並列+RateLimitヘッダ監視",
    ],
  },
  {
    title: "デプロイ/CI",
    items: [
      "Lint/TypeCheck→Unit/Integration→Build→Migrate(審査)→Sentryリリース→Staging→本番",
      "Schema変更は後方互換手順",
    ],
  },
  {
    title: "コスト概算(月)",
    items: [
      "Postgres $60",
      "Hosting $50±",
      "Sentry $20",
      "Redis/Cloudinary 初期$0",
      "合計≈$120-140",
    ],
  },
  {
    title: "リスク / 監査",
    items: [
      "Quota枯渇→送信バックオフ",
      "JSON肥大→10KB制限",
      "Webhook欠落→再同期ジョブ",
      "監査ログ (TEMPLATE/BROADCAST/ROLE変更) 365日",
    ],
  },
  {
    title: "データ一貫性 / Idempotency",
    items: [
      "書き込み強整合(Postgres)",
      "UIは最長2秒遅延",
      "Webhookイベントハッシュで重複排除",
    ],
  },
  {
    title: "Feature Flag",
    items: [
      "Redis key feature:<flag> 60sキャッシュ",
      "起動時envで重大機能ゲート",
      "A/B検証用ラベル拡張余地",
    ],
  },
  {
    title: "依存/アップグレード",
    items: [
      "月次 npm audit",
      "Tailwind4/Next.jsメジャーは専用ブランチ",
      "Prisma migrate diffで破壊検知",
    ],
  },
  {
    title: "既知の制限",
    items: [
      "Rich Menu CRUDなし",
      "分析遅延",
      "高度セグメント未実装",
      "単純RateLimit",
    ],
  },
  {
    title: "ロードマップ(Q)",
    items: [
      "Q1 RBAC/Queue/Analytics",
      "Q2 RichMenu/i18n/Audit",
      "Q3 Partition/Segmentation/AI",
      "Q4 Multi-region/Failover",
    ],
  },
];

export default function ProjectDesignSpec() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFEF5]">
      {/* 背景装飾 (他ページと統一) */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.15] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.12] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[#00B900] opacity-[0.08] blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        {/* バッジ */}
        <div className="flex items-start justify-between">
          <div
            className="inline-block animate-[slideDown_0.8s_ease-out]"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <span className="inline-block -rotate-2 border-2 border-black bg-[#FFE500] px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Architecture Spec
            </span>
          </div>
        </div>

        {/* Hero */}
        <h1
          className={`mt-12 mb-10 text-5xl font-black leading-[1.1] tracking-tight text-black sm:text-6xl lg:text-7xl animate-[slideUp_0.9s_ease-out] ${syne.className}`}
          style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
        >
          <span className="relative inline-block ml-2">
            <span className="relative z-10 text-[#00B900]">設計仕様</span>
            <svg
              className="absolute -bottom-1 left-0 z-0 w-full"
              height="30"
              viewBox="0 0 200 40"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 28 Q 12.5 18, 25 24 Q 37.5 30, 50 26 Q 62.5 22, 75 24 Q 87.5 26, 100 22 Q 112.5 18, 125 20 Q 137.5 22, 150 18 Q 162.5 14, 175 16 Q 187.5 18, 200 14"
                stroke="#FF6B9D"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <br />
          <span className="relative inline-block mt-4">
            <span className="relative z-10">全体アーキテクチャ要約</span>
            <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-[#2fc5c8]" />
          </span>
        </h1>

        <p
          className={`max-w-3xl text-lg leading-relaxed text-black/80 sm:text-xl animate-[fadeIn_0.9s_ease-out] ${ibmPlexSans.className}`}
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          README / system-design / AGENTS から抽出した PoC
          の包括的設計仕様。目的・機能・データ・ワークフロー・品質・拡張計画を一望し、実装/レビュー/合意形成の基盤を提供します。
        </p>

        {/* 目次 */}
        <nav
          aria-label="目次"
          className="mt-12 mb-20 rounded-lg border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-[slideUp_0.9s_ease-out]"
          style={{ animationDelay: "0.45s", animationFillMode: "backwards" }}
        >
          <h2
            className={`mb-4 text-2xl font-bold text-black ${syne.className}`}
          >
            目次
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.15em] text-black hover:text-[#00B900]"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-black transition-colors group-hover:bg-[#00B900]" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* コンテンツ + サイドナビ */}
        <div className="flex flex-col gap-20 lg:flex-row">
          {/* Sticky side navigation (large screens) */}
          <aside className="order-last lg:order-first lg:w-72 lg:shrink-0">
            <nav
              aria-label="セクションナビゲーション"
              className="sticky top-28 hidden lg:block rounded-lg border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2
                className={`mb-3 text-lg font-black text-black ${syne.className}`}
              >
                セクション
              </h2>
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={`side-${s.id}`}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-2 rounded px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-black hover:bg-[#00B900]/10 hover:text-[#00B900]"
                    >
                      <span className="h-2 w-2 rounded-sm bg-black transition-colors group-hover:bg-[#00B900]" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-black/10">
                <a
                  href="#top"
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:text-[#00B900]"
                >
                  ↑ Top
                </a>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-24">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-heading`}
                className="relative"
              >
                <h2
                  id={`${s.id}-heading`}
                  className={`mb-6 text-3xl font-black text-black sm:text-4xl ${syne.className}`}
                >
                  {s.title}
                </h2>
                <div
                  className={`space-y-4 text-black/80 leading-relaxed ${ibmPlexSans.className}`}
                >
                  <ul className="list-disc space-y-2 pl-6">
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-32 flex flex-wrap items-center gap-6">
          <Link
            href="/"
            className="group relative overflow-hidden border-[3px] border-black bg-linear-to-br from-[#00FF00] via-[#00B900] to-[#008F00] px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              トップページへ戻る →
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </Link>
          <Link
            href="/guide"
            className="group relative overflow-hidden border-[3px] border-black bg-white px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:bg-[#FFFEF5] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              使い方ガイド ↗
            </span>
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-[#00B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>

        <footer className="mt-20 flex items-center justify-center gap-6">
          <div className="h-1 w-16 bg-black" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-black/40">
            ARCH SPEC
          </span>
          <div className="h-1 w-16 bg-black" />
        </footer>
      </div>
    </main>
  );
}
