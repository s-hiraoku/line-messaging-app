import Link from "next/link";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({ weight: "800", subsets: ["latin"], display: "swap" });
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Usage-focused section metadata (implementation-heavy sections replaced)
const sections = [
  { id: "overview", title: "概要" },
  { id: "getting-started", title: "初期セットアップ" },
  { id: "message-send", title: "メッセージ送信" },
  { id: "auto-reply", title: "自動返信設定" },
  { id: "richmenu-editor", title: "リッチメニュー編集" },
  { id: "image-crop", title: "ImageCropUploader" },
  { id: "toast", title: "Toast 通知" },
  { id: "troubleshooting", title: "トラブルシュート" },
  { id: "best-practices", title: "ベストプラクティス" },
];

export default function GuidePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFEF5]">
      {/* Background Decorative Elements (reuse style from Home) */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.12] blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[350px] w-[350px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.10] blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-[#00B900] opacity-[0.06] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        {/* Header Badge */}
        <div className="flex items-start justify-between">
          <div
            className="inline-block animate-[slideDown_0.8s_ease-out]"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <span className="inline-block -rotate-2 border-2 border-black bg-[#FFE500] px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Usage Guide
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <h1
          data-testid="guide-main-heading"
          className={`mt-12 mb-10 text-5xl font-black leading-[1.1] tracking-tight text-black sm:text-6xl lg:text-7xl animate-[slideUp_0.9s_ease-out] ${syne.className}`}
          style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
        >
          <span className="relative inline-block ml-2">
            <span className="relative z-10 text-[#00B900]">使い方を見る</span>
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
            <span className="relative z-10">統合管理ツール活用ガイド</span>
            <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-[#2fc5c8]" />
          </span>
        </h1>

        {/* Intro Paragraph */}
        <p
          className={`max-w-3xl text-lg leading-relaxed text-black/80 sm:text-xl animate-[fadeIn_0.9s_ease-out] ${ibmPlexSans.className}`}
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          このページは <strong>「何をどう操作すれば良いか」</strong>{" "}
          に焦点を当てた利用ガイドです。開発実装の詳細ではなく、日々の運用でダッシュボードを効率よく活用するためのステップ・ヒント・注意点をまとめています。
        </p>

        {/* Table of Contents (Primary) */}
        <nav
          data-testid="guide-toc"
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

        {/* Content + Sticky Aside TOC for large screens */}
        <div className="flex flex-col gap-16 lg:flex-row">
          <aside className="order-last lg:order-first lg:w-64 lg:shrink-0">
            <div className="sticky top-24 hidden lg:block rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2
                className={`mb-3 text-xl font-bold text-black ${syne.className}`}
              >
                セクション
              </h2>
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={`side-${s.id}`}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black hover:text-[#00B900]"
                    >
                      <span className="h-2 w-2 rounded-sm bg-black transition-colors group-hover:bg-[#00B900]" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 space-y-32">
            {/* Content Sections */}
            {/* Closing wrapper for content when sticky aside is present on large screens */}
          </div>
          {/* Overview */}
          <section
            id="overview"
            aria-labelledby="overview-heading"
            className="relative"
          >
            <GuideHeading id="overview-heading">概要</GuideHeading>
            <GuideBody>
              このツールは{" "}
              <strong>メッセージ運用・自動化・リッチメニュー管理</strong> を 1
              つの UI
              に統合し、日常的な手順を最短化することを目的としています。画面構成は以下の領域に分かれます:
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>ダッシュボード: 利用状況と最近のアクティビティ</li>
                <li>
                  メッセージ管理: 各種メッセージタイプの作成 /
                  テンプレート再利用
                </li>
                <li>自動返信: トリガー条件と返信内容の定義</li>
                <li>
                  リッチメニュー: 画像 + タップ領域編集 / プレビュー / 適用
                </li>
              </ul>
            </GuideBody>
          </section>

          {/* Getting Started */}
          <section
            id="getting-started"
            aria-labelledby="getting-started-heading"
            className="relative"
          >
            <GuideHeading id="getting-started-heading">
              初期セットアップ
            </GuideHeading>
            <GuideBody>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>環境変数設定:</strong> `.env.local` に LINE
                  チャネル各種キーと `DATABASE_URL` を追加。
                </li>
                <li>
                  <strong>DB 初期化:</strong> 端末で{" "}
                  <code>npx prisma migrate dev</code> を実行しスキーマを適用。
                </li>
                <li>
                  <strong>開発サーバ:</strong> <code>npm run dev</code> で起動し{" "}
                  <code>http://localhost:3000</code> を開く。
                </li>
                <li>
                  <strong>初回ログイン:</strong> 必要ならテストユーザーを seed
                  スクリプトで投入。
                </li>
              </ol>
              推奨ブラウザ: 最新 Chrome /
              Firefox。リッチメニュー編集はタッチ操作非対応 (β)。
            </GuideBody>
          </section>

          {/* Message Sending */}
          <section
            id="message-send"
            aria-labelledby="message-send-heading"
            className="relative"
          >
            <GuideHeading id="message-send-heading">
              メッセージ送信
            </GuideHeading>
            <GuideBody>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>メッセージタイプ選択:</strong> テンプレート / テキスト
                  / クーポン / スタンプなど。
                </li>
                <li>
                  <strong>内容編集:</strong> 支援入力 (プレースホルダ, 絵文字)
                  とカウンタで制限文字数を確認。
                </li>
                <li>
                  <strong>プレビュー確認:</strong> 送信前に最終表示をチェック。
                </li>
                <li>
                  <strong>送信対象選択:</strong> 全体 / タグ別 /
                  条件フィルタ。誤爆防止の確認ダイアログあり。
                </li>
                <li>
                  <strong>送信実行:</strong> 成功時は緑 Toast、失敗時は赤 Toast
                  でフィードバック。
                </li>
              </ol>
              ベストプラクティス: 大量送信前にテストユーザーへ試験送信 /
              クーポンコードはテンプレート化して再利用。
            </GuideBody>
          </section>

          {/* Auto Reply */}
          <section
            id="auto-reply"
            aria-labelledby="auto-reply-heading"
            className="relative"
          >
            <GuideHeading id="auto-reply-heading">自動返信設定</GuideHeading>
            <GuideBody>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>トリガー作成:</strong> キーワード / 正規表現 / 時間帯
                  / ユーザー属性。
                </li>
                <li>
                  <strong>返信内容設定:</strong> 定型文 or
                  テンプレート選択。複数候補をランダム化可能。
                </li>
                <li>
                  <strong>優先度調整:</strong>{" "}
                  競合する条件がある場合は並び替えで制御。
                </li>
                <li>
                  <strong>ステータス切替:</strong> 一時停止 /
                  有効化をワンクリック。
                </li>
                <li>
                  <strong>ログ確認:</strong> 適用履歴でヒット状況を分析。
                </li>
              </ol>
              注意:
              無制限な正規表現はパフォーマンス低下の恐れ。なるべく前方一致やタグ条件を活用。
            </GuideBody>
          </section>

          {/* Richmenu Editor */}
          <section
            id="richmenu-editor"
            aria-labelledby="richmenu-editor-heading"
            className="relative"
          >
            <GuideHeading id="richmenu-editor-heading">
              リッチメニュー編集
            </GuideHeading>
            <GuideBody>
              基本フロー:
              <ol className="list-decimal pl-6 space-y-3 mt-2">
                <li>
                  <strong>画像アップロード:</strong> 推奨解像度比率に沿った
                  PNG/JPEG。
                </li>
                <li>
                  <strong>領域追加:</strong>{" "}
                  キャンバス上でドラッグしてタップ領域生成。
                </li>
                <li>
                  <strong>ラベル & アクション:</strong>{" "}
                  各領域に表示名と遷移/メッセージ送信などの動作を割り当て。
                </li>
                <li>
                  <strong>プレビュー:</strong> PC /
                  モバイル表示のバランスを確認。
                </li>
                <li>
                  <strong>適用:</strong> 保存後、ユーザー対象へアクティブ化。
                </li>
              </ol>
              操作ヒント: Esc で選択解除 / Delete で領域削除 / Shift+ドラッグ
              で正方形補助 (※β)。
            </GuideBody>
          </section>

          {/* ImageCropUploader */}
          <section
            id="image-crop"
            aria-labelledby="image-crop-heading"
            className="relative"
          >
            <GuideHeading id="image-crop-heading">
              ImageCropUploader
            </GuideHeading>
            <GuideBody>
              手順:
              <ol className="list-decimal pl-6 space-y-3">
                <li>画像選択 (10MB 以下 / 最低 1024x1024 推奨)。</li>
                <li>
                  アスペクト比を選択 (SQUARE / LANDSCAPE / PORTRAIT / FREE)。
                </li>
                <li>ズームと位置を調整し不要領域を除去。</li>
                <li>保存でクロップ処理 → URL / Blob を取得。</li>
              </ol>
              <CodeBlock>{`<ImageCropUploader
  onImageUploaded={(url) => console.log('Uploaded URL', url)}
  defaultAspectRatio="SQUARE"
/>`}</CodeBlock>
              コツ: 先に意図解像度を決めてからズーム調整 /
              文字や主要要素を中央に。
            </GuideBody>
          </section>

          {/* Toast */}
          <section
            id="toast"
            aria-labelledby="toast-heading"
            className="relative"
          >
            <GuideHeading id="toast-heading">Toast 通知</GuideHeading>
            <GuideBody>
              目的: 操作結果や進行状態を即座にフィードバック。種類: 成功 / 失敗
              / 情報 / 警告 / ローディング。
              <CodeBlock>{`import { toast } from '@/lib/toast';
toast.success('保存しました');
toast.error('エラーが発生しました');
const id = toast.loading('処理中...');
// 完了後
toast.success('完了');
toast.dismiss(id);`}</CodeBlock>
              よくある使い方: フォーム送信 / バックグラウンド同期 /
              画像アップロード進捗。Undo 操作は `action` オプションで追加。
            </GuideBody>
          </section>

          {/* Troubleshooting */}
          <section
            id="troubleshooting"
            aria-labelledby="troubleshooting-heading"
            className="relative"
          >
            <GuideHeading id="troubleshooting-heading">
              トラブルシュート
            </GuideHeading>
            <GuideBody>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>画像がアップロードできない:</strong> サイズ / 形式
                  (JPEG/PNG) / 解像度を確認。
                </li>
                <li>
                  <strong>領域が動かせない:</strong>{" "}
                  キャンバス外クリックで再選択、ブラウザ拡張の干渉を無効化。
                </li>
                <li>
                  <strong>自動返信が発火しない:</strong>{" "}
                  キーワードの前後スペース / 正規表現のエスケープ有無 /
                  ステータスを再確認。
                </li>
                <li>
                  <strong>Toast が多すぎる:</strong> ローディング後に必ず
                  `dismiss`、長時間表示は `duration` 延長よりログ表示へ移行。
                </li>
              </ul>
            </GuideBody>
          </section>

          {/* Best Practices */}
          <section
            id="best-practices"
            aria-labelledby="best-practices-heading"
            className="relative"
          >
            <GuideHeading id="best-practices-heading">
              ベストプラクティス
            </GuideHeading>
            <GuideBody>
              <ul className="list-disc pl-6 space-y-2">
                <li>送信前に小規模テスト配信で内容と改行を検証。</li>
                <li>自動返信は条件を具体的にし過剰マッチを防止。</li>
                <li>リッチメニュー領域は余白を均等に揃え操作性を向上。</li>
                <li>画像クロップ時は主要要素から 5-10% の余白を確保。</li>
                <li>
                  Toast の連続表示はまとめて 1 つの状態管理 Toast へ集約。
                </li>
              </ul>
            </GuideBody>
          </section>
        </div>

        {/* Navigation Footer */}
        <div className="mt-32 flex flex-wrap items-center gap-6">
          <Link
            href="/dashboard"
            className="group relative overflow-hidden border-[3px] border-black bg-linear-to-br from-[#00FF00] via-[#00B900] to-[#008F00] px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ダッシュボードへ戻る →
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </Link>
          <Link
            href="/docs/system-design"
            className="group relative overflow-hidden border-[3px] border-black bg-white px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.15em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:bg-[#FFFEF5] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              設計仕様を見る ↗
            </span>
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-[#00B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>
      </div>
    </main>
  );
}

// Reusable heading component for guide sections
function GuideHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className={`mb-6 text-3xl font-black text-black sm:text-4xl ${syne.className}`}
    >
      {children}
    </h2>
  );
}

function GuideBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`space-y-6 text-black/80 leading-relaxed ${ibmPlexSans.className}`}
    >
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-6 overflow-x-auto rounded-md border-2 border-black bg-[#FFFBEA] p-4 text-xs leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <code>{children}</code>
    </pre>
  );
}
