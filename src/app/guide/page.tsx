import Link from 'next/link';
import { Syne, IBM_Plex_Sans } from 'next/font/google';

// フォント設定
const syne = Syne({ weight: '800', subsets: ['latin'], display: 'swap' });
const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// ダッシュボード上の主要メニュー(章構成)
const sections = [
  { id: 'dashboard', title: 'ダッシュボード' },
  { id: 'messages', title: 'メッセージ' },
  { id: 'broadcasts', title: '一斉送信 / ジョブ' },
  { id: 'templates', title: 'テンプレート' },
  { id: 'auto-reply', title: '自動返信' },
  { id: 'users', title: 'ユーザー管理' },
  { id: 'richmenu', title: 'リッチメニュー' },
  { id: 'analytics', title: '分析 / 可視化' },
  { id: 'webhook-check', title: 'Webhook 診断' },
  { id: 'settings', title: '設定' },
  { id: 'troubleshooting', title: 'トラブルシュート' },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#FFFEF5]">
      <div id="top" className="mx-auto max-w-6xl px-6 py-14">
        {/* ヘッダー */}
        <h1
          data-testid="guide-main-heading"
          className={`text-4xl sm:text-5xl font-black tracking-tight mb-8 ${syne.className}`}
        >
          利用ガイド (メニュー別)
        </h1>
        <p className={`text-black/80 max-w-3xl mb-10 leading-relaxed ${ibmPlexSans.className}`}>
          このページではダッシュボードの各メニューで「何ができるか / 最短でどう操作するか」を章立てで整理しています。初めて触る人が迷わず運用を開始できるよう、必須ステップと確認ポイントのみを厳選して記載しました。
        </p>

        {/* 目次 */}
        <nav
          aria-label="目次"
          className="mb-14 rounded-lg border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
          data-testid="guide-toc"
        >
          <h2 className={`text-xl font-bold mb-4 ${syne.className}`}>目次</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] hover:text-[#00B900]"
                >
                  <span className="h-2 w-2 rounded-full bg-black" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* コンテンツ */}
        <div className="space-y-24">
          <Section id="dashboard" title="ダッシュボード">
            <ol className="list-decimal pl-6 space-y-3">
              <li>概要パネルで <strong>最近送信・自動返信ヒット数・失敗ジョブ</strong> を確認。</li>
              <li>異常検知 (失敗率上昇) は赤ラベル → 詳細へ遷移し原因特定。</li>
              <li>朝一の推奨作業: 失敗ジョブ再送 / 高頻度キーワードのテンプレ登録。</li>
            </ol>
            <Tips items={['色: 緑=正常, 黄=注意, 赤=要対応', 'カードクリックで該当一覧へフィルタ遷移']} />
          </Section>

          <Section id="messages" title="メッセージ">
            <ol className="list-decimal pl-6 space-y-3">
              <li><strong>タイプ選択:</strong> テキスト / 画像 / カード / リッチ。</li>
              <li><strong>内容入力:</strong> 文字数カウンタ・プレビューで崩れを確認。</li>
              <li><strong>宛先指定:</strong> 全体 / タグ / 条件 (フォロー状態等)。</li>
              <li><strong>送信確認:</strong> 差分表示ダイアログ → 実行。</li>
              <li><strong>履歴:</strong> 成功/失敗と後追い分析 (クリック率等)。</li>
            </ol>
            <InlineBest label="推奨" items={['大量送信前にテストタグへ試験送信', '再利用文面は作成時点でテンプレ化']} />
          </Section>

          <Section id="broadcasts" title="一斉送信 / ジョブ">
            <ol className="list-decimal pl-6 space-y-3">
              <li>ジョブ作成: 配信名 / 対象フィルタ / メッセージ紐付け。</li>
              <li>スケジュール: 即時 or 指定時刻 (深夜帯は警告表示)。</li>
              <li>監視: 進捗バー / 成功率 / レート制限待機。</li>
              <li>再送: 部分失敗のみ対象に限定再送。</li>
            </ol>
            <Tips items={['同時ジョブは少数でレート制限回避', '名称に目的+日付で検索性向上']} />
          </Section>

          <Section id="templates" title="テンプレート">
            <ol className="list-decimal pl-6 space-y-3">
              <li>新規作成 → 種別選択 (テキスト / 画像 / カード)。</li>
              <li>変数 {{name}} 形式を文面へ埋め込み → 送信時差し込み。</li>
              <li>カテゴリ付与で一覧絞り込み効率化。</li>
              <li>プレビューでダミー展開確認 → 保存。</li>
              <li>メッセージ画面で呼び出して微調整可能。</li>
            </ol>
            <InlineBest label="注意" items={['変数名は英数字_のみ', '長文は冒頭に要約コメント']} />
          </Section>

          <Section id="auto-reply" title="自動返信">
            <ol className="list-decimal pl-6 space-y-3">
              <li>ルール追加 → マッチタイプ (完全 / 部分 / 前方 / 正規表現) 選択。</li>
              <li>返信文単一 or 複数 (ランダム)。</li>
              <li>優先度で競合解消 (小さい値が先)。</li>
              <li>有効化スイッチ ON → 即時反映。</li>
              <li>ログでヒット頻度を確認し過剰なら条件具体化。</li>
            </ol>
            <InlineBest label="避ける" items={['巨大な汎用正規表現', '重複キーワードルール']} />
          </Section>

          <Section id="users" title="ユーザー管理">
            <ol className="list-decimal pl-6 space-y-3">
              <li>検索 / フィルタ (フォロー状態 / タグ)。</li>
              <li>詳細: 最近の受信/送信履歴 & タグ編集。</li>
              <li>一括操作: チェック選択 → タグ付与。</li>
              <li>離脱ユーザー抽出 → 再フォローメッセージ施策。</li>
            </ol>
            <Tips items={['タグ命名は segment_ 前置で統一', '週次で有効フォロー率を記録']} />
          </Section>

          <Section id="richmenu" title="リッチメニュー">
            <ol className="list-decimal pl-6 space-y-3">
              <li>画像アップロード (推奨幅 2500px PNG)。</li>
              <li>領域ドラッグ生成 → 最小サイズ警告で調整。</li>
              <li>アクション: URL / メッセージ送信 / テンプレ展開。</li>
              <li>プレビューで文字潰れ確認 (縮小表示)。</li>
              <li>保存 → 適用対象 (全体 / タグ) 選択し有効化。</li>
            </ol>
            <InlineBest label="ヒント" items={['余白均等でタップ誤り減少', '重要領域は中央〜下部配置']} />
          </Section>

          <Section id="analytics" title="分析 / 可視化">
            <ol className="list-decimal pl-6 space-y-3">
              <li>期間選択 → 送信数 / 反応率 / 自動返信ヒット数を取得。</li>
              <li>時間帯ヒートマップで最適配信タイミング決定。</li>
              <li>低反応テンプレートは改善フラグ → AB テスト実施。</li>
            </ol>
            <Tips items={['週次 KPI をスクショ保管', '反応率変動は施策開始/終了と紐付け記録']} />
          </Section>

          <Section id="webhook-check" title="Webhook 診断">
            <ol className="list-decimal pl-6 space-y-3">
              <li>公開トンネル URL 設定 → 受信テスト。</li>
              <li>署名検証失敗: Secret 再確認。</li>
              <li>イベント一覧: type / timestamp / userId 表示。</li>
              <li>遅延時: tunnel / outbound ネットワーク状態確認。</li>
            </ol>
            <InlineBest label="チェック" items={['x-line-signature 必須', 'トンネル URL 更新忘れ注意']} />
          </Section>

          <Section id="settings" title="設定">
            <ol className="list-decimal pl-6 space-y-3">
              <li>チャネル ID / Secret / Access Token 入力 → 保存。</li>
              <li>BASE_URL (Webhook / Imagemap 用) 更新。</li>
              <li>通知 (失敗ジョブ / エラー閾値) 設定。</li>
              <li>不要トークン再発行でローテーション。</li>
            </ol>
            <Tips items={['本番・開発で .env 分離', '権限変更後は必ず Webhook 再テスト']} />
          </Section>

          <Section id="troubleshooting" title="トラブルシュート">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>送信失敗:</strong> トークン期限切れ → 設定から再発行。</li>
              <li><strong>自動返信未発火:</strong> 優先度/重複/ステータスを確認。</li>
              <li><strong>画像劣化:</strong> 元解像度不足 → 幅 1024px 以上で再アップ。</li>
              <li><strong>Webhook 無反応:</strong> 公開 URL / 署名ログ / HTTP ステータス。</li>
              <li><strong>レート制限:</strong> ジョブ分割 + バックオフ再送。</li>
            </ul>
            <InlineBest label="問い合わせ前チェック" items={['設定最新か', '直近デプロイ有無', 'ログのエラー型']} />
          </Section>
        </div>

        {/* フッターナビ */}
        <div className="mt-28 flex flex-wrap gap-6">
          <Link
            href="/"
            className="border-2 border-black bg-[#00B900] text-white font-mono text-xs px-6 py-3 font-bold tracking-[0.15em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:opacity-90"
          >
            トップへ戻る →
          </Link>
          <Link
            href="/docs/system-design"
            className="border-2 border-black bg-white text-black font-mono text-xs px-6 py-3 font-bold tracking-[0.15em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFEF5]"
          >
            設計仕様 ↗
          </Link>
        </div>
      </div>
    </main>
  );
}

// セクション汎用コンポーネント
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={`mb-6 text-3xl font-black ${syne.className}`}>
        {title}
      </h2>
      <div className={`space-y-6 leading-relaxed text-black/80 ${ibmPlexSans.className}`}>{children}</div>
    </section>
  );
}

function Tips({ items }: { items: string[] }) {
  return (
    <div className="mt-6 rounded-md border border-black/10 bg-[#F6FFE9] p-4 text-sm space-y-2">
      <p className="font-semibold">Tips</p>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function InlineBest({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-6 rounded-md border border-black/10 bg-[#FFFBEA] p-4 text-xs space-y-2">
      <p className="font-semibold">{label}</p>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
