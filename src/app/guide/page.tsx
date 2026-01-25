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
    <main className="min-h-screen bg-[#e8f5e9]">
      <div id="top" className="mx-auto max-w-6xl px-6 py-14">
        {/* ヘッダー */}
        <h1
          data-testid="guide-main-heading"
          className={`text-4xl sm:text-5xl font-black tracking-tight mb-8 ${syne.className}`}
        >
          利用ガイド (メニュー別)
        </h1>
        <p className={`text-gray-700 max-w-3xl mb-10 leading-relaxed ${ibmPlexSans.className}`}>
          このページではダッシュボードの各メニューで「何ができるか / 最短でどう操作するか」を章立てで整理しています。初めて触る人が迷わず運用を開始できるよう、必須ステップと確認ポイントのみを厳選して記載しました。
        </p>

        {/* 目次 */}
        <nav
          aria-label="目次"
          className="mb-14 rounded-2xl bg-white/70 p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300"
          data-testid="guide-toc"
        >
          <h2 className={`text-xl font-bold mb-4 ${syne.className}`}>目次</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700 hover:text-[#00B900] transition-all duration-300"
                >
                  <span className="h-2 w-2 rounded-full bg-gray-700" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* コンテンツ */}
        <div className="space-y-24">
          <Section id="dashboard" title="ダッシュボード">
            <p className="mb-6">
              ダッシュボードはシステムの「健康状態」を一目で把握するための起点です。毎日の運用開始時に確認し、異常の早期発見と迅速な対応を実現します。
            </p>
            <h3 className="text-xl font-bold mb-4">画面構成</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>メッセージ送信数:</strong> 過去24時間 / 7日間 / 30日間の送信実績を集計表示</li>
              <li><strong>配信成功率:</strong> 成功/失敗の比率をパーセンテージとグラフで可視化</li>
              <li><strong>自動返信ヒット数:</strong> ルール別の発火回数トップ5をリスト表示</li>
              <li><strong>アクティブユーザー:</strong> フォロー中 / ブロック済み / 最近アクティブの内訳</li>
              <li><strong>失敗ジョブ一覧:</strong> 直近のエラーを時系列で表示、再送ボタン付き</li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4">日次チェックリスト</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>
                <strong>配信成功率を確認:</strong> 95% 以上が正常。90% 以下なら LINE API トークン / ネットワーク / レート制限を疑う。
              </li>
              <li>
                <strong>失敗ジョブの再送:</strong> 一時的なネットワークエラーは再送で解決。根本原因が不明なら Webhook 診断へ。
              </li>
              <li>
                <strong>自動返信の精度確認:</strong> 意図しないキーワードで高頻度発火していたらルール見直し。
              </li>
              <li>
                <strong>ユーザー離脱率:</strong> ブロック率が急増している場合はメッセージ頻度 / 内容を調整。
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">アクション例</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>失敗ジョブカードをクリック → 詳細モーダルで失敗理由を確認 → 再送または削除</li>
              <li>自動返信ヒット数をクリック → 該当ルールの編集画面へ遷移</li>
              <li>送信数グラフの異常な落ち込み → 過去の配信履歴と照合しキャンペーン終了などを確認</li>
            </ul>

            <Tips items={[
              '色コード: 緑=正常 / 黄=注意 / 赤=即対応必要',
              'カードをクリックすると該当データへフィルタ遷移',
              '週次で過去7日間の成功率をスプレッドシート記録推奨',
              '自動返信の誤爆が多い場合は「部分一致」を「前方一致」へ変更'
            ]} />
          </Section>

          <Section id="messages" title="メッセージ">
            <p className="mb-6">
              個別またはグループ向けにメッセージを作成・送信する機能です。テキスト・画像・カードなど多様な形式に対応し、プレビューと確認ダイアログで誤送信を防ぎます。
            </p>

            <h3 className="text-xl font-bold mb-4">送信フロー</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <strong>メッセージタイプ選択</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>テキスト:</strong> 最大 5,000 文字。改行・絵文字対応。文字数カウンタで残量を確認。</li>
                  <li><strong>画像:</strong> JPEG/PNG 推奨。1024x1024 以上で鮮明表示。</li>
                  <li><strong>カード (Flex Message):</strong> ボタン・画像・テキストを組み合わせたリッチレイアウト。</li>
                  <li><strong>スタンプ:</strong> LINE 公式スタンプ ID を指定。</li>
                </ul>
              </li>
              <li>
                <strong>内容編集</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>プレースホルダ挿入: <code>{'{'}name{'}'}</code> でユーザー名を自動差し込み</li>
                  <li>絵文字ピッカー: 頻繁に使う絵文字を検索して挿入</li>
                  <li>プレビュー: PC / モバイル表示を切り替えて崩れを確認</li>
                </ul>
              </li>
              <li>
                <strong>宛先指定</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>全体配信:</strong> フォロー中の全ユーザー (レート制限に注意)</li>
                  <li><strong>タグ別:</strong> 「新規」「VIP」などセグメント別に配信</li>
                  <li><strong>個別指定:</strong> ユーザー ID または表示名で検索して選択</li>
                  <li><strong>条件フィルタ:</strong> フォロー状態 / 最終アクティブ日 / タグの組み合わせ</li>
                </ul>
              </li>
              <li>
                <strong>送信確認</strong>
                <p className="mt-2">差分表示ダイアログで対象件数・内容を最終確認 → 実行ボタン。送信後は成功/失敗件数を Toast 表示。</p>
              </li>
              <li>
                <strong>履歴と分析</strong>
                <p className="mt-2">送信履歴画面で配信ステータス・開封率 (実装時) ・クリック率を後追い分析。低反応メッセージは文面改善の対象に。</p>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">よくある使い方</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>キャンペーン告知:</strong> 画像 + テキストのカードメッセージで視覚的にアピール</li>
              <li><strong>定期お知らせ:</strong> テンプレートから呼び出し日付のみ変更</li>
              <li><strong>個別フォロー:</strong> VIP タグ付きユーザーへ限定クーポン配信</li>
              <li><strong>テスト配信:</strong> 本番前に「test」タグへ1件送信して表示崩れを確認</li>
            </ul>

            <InlineBest label="推奨プラクティス" items={[
              '大量送信前に必ずテストタグへ試験送信',
              '再利用想定の文面は作成時点でテンプレート保存',
              '改行位置をモバイルプレビューで確認 (PC と表示が異なる)',
              '深夜帯配信は避ける (ブロック率上昇の原因)',
              '配信頻度は週1〜2回が目安 (過多はユーザー離脱を招く)'
            ]} />
          </Section>

          <Section id="broadcasts" title="一斉送信 / ジョブ">
            <p className="mb-6">
              大量のユーザーへ一度に配信するためのバッチジョブ機能です。即時配信またはスケジュール予約が可能で、進捗と成功率をリアルタイム監視できます。
            </p>

            <h3 className="text-xl font-bold mb-4">ジョブ作成手順</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <strong>配信名とメッセージ紐付け</strong>
                <p className="mt-2">分かりやすい名前 (例: 「2025年新春キャンペーン_全体」) を設定し、既存メッセージまたはテンプレートを選択。</p>
              </li>
              <li>
                <strong>対象フィルタ設定</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>全体 / 特定タグ / カスタム条件 (フォロー日, 最終アクティブ日)</li>
                  <li>プレビューで推定配信件数を確認</li>
                </ul>
              </li>
              <li>
                <strong>スケジュール選択</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>即時実行:</strong> 保存後すぐに配信開始</li>
                  <li><strong>指定時刻:</strong> 日時を指定 (深夜帯は警告表示)</li>
                </ul>
              </li>
              <li>
                <strong>実行と監視</strong>
                <p className="mt-2">ジョブ一覧で進捗バー・成功率・失敗件数をリアルタイム表示。レート制限による待機時間も可視化。</p>
              </li>
              <li>
                <strong>再送処理</strong>
                <p className="mt-2">部分失敗したジョブは「失敗分のみ再送」ボタンで効率的にリトライ。全体再送は重複配信リスクがあるため注意。</p>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">レート制限対策</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>バッチサイズ:</strong> 一度に 500 件ずつ送信し、インターバル 1 秒を挟む</li>
              <li><strong>同時ジョブ制限:</strong> 並行実行は最大 2 ジョブまで (競合を回避)</li>
              <li><strong>エラーハンドリング:</strong> 429 エラー時は指数バックオフで自動再試行</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">運用シナリオ例</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>新商品告知:</strong> 全体向けに午前 10 時配信予約</li>
              <li><strong>セグメント別配信:</strong> 新規ユーザーと既存ユーザーで異なるメッセージを同時ジョブ実行</li>
              <li><strong>緊急通知:</strong> システムメンテナンス案内を即時実行</li>
            </ul>

            <Tips items={[
              '同時ジョブは少数に抑えレート制限回避',
              '配信名に目的+日付を含めると後から検索しやすい',
              '大規模配信 (1万件以上) は深夜帯を避け営業時間内に実施',
              '失敗が多い場合は Webhook 診断で署名・URL を確認'
            ]} />
          </Section>

          <Section id="templates" title="テンプレート">
            <p className="mb-6">
              頻繁に使うメッセージ文面を保存し、変数で柔軟にカスタマイズできる機能です。定型業務の効率化と表記ゆれ防止に有効です。
            </p>

            <h3 className="text-xl font-bold mb-4">テンプレート作成手順</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <strong>種別選択</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>テキスト:</strong> 挨拶文・FAQ 回答・定期お知らせ</li>
                  <li><strong>画像:</strong> キャンペーンバナー・商品画像</li>
                  <li><strong>カード:</strong> ボタン付きリッチメッセージ</li>
                </ul>
              </li>
              <li>
                <strong>変数埋め込み</strong>
                <p className="mt-2">
                  文面中に <code>{'{'}name{'}'}</code> <code>{'{'}date{'}'}</code> <code>{'{'}coupon_code{'}'}</code> などを記述。送信時に実データで置換されます。
                </p>
                <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <p className="font-mono text-sm">
                    こんにちは、<code>{'{'}name{'}'}</code> さん！<br />
                    本日 <code>{'{'}date{'}'}</code> 限定で特別クーポン <code>{'{'}coupon_code{'}'}</code> をプレゼント🎁
                  </p>
                </div>
              </li>
              <li>
                <strong>カテゴリ分類</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>キャンペーン / 定期連絡 / FAQ / 緊急通知 など</li>
                  <li>カテゴリで絞り込んで目的のテンプレートを素早く検索</li>
                </ul>
              </li>
              <li>
                <strong>プレビューと保存</strong>
                <p className="mt-2">変数にダミー値を入れてプレビュー表示 → 問題なければ保存して有効化。</p>
              </li>
              <li>
                <strong>メッセージ画面で利用</strong>
                <p className="mt-2">メッセージ作成時にテンプレート選択 → 変数部分のみ編集 → 送信。</p>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">変数管理のベストプラクティス</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>命名規則:</strong> snake_case (例: <code>user_name</code>, <code>event_date</code>)</li>
              <li><strong>デフォルト値:</strong> 変数が空の場合の代替表示を設定 (例: 「お客様」)</li>
              <li><strong>バリデーション:</strong> 日付形式・数値範囲などを事前チェック</li>
              <li><strong>ドキュメント:</strong> テンプレートに説明欄を設け変数の意味を記載</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">実用例</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-semibold mb-2">例1: 誕生日メッセージ</p>
                <p className="text-sm">
                  「<code>{'{'}name{'}'}</code> さん、お誕生日おめでとうございます🎂 特別クーポン <code>{'{'}coupon{'}'}</code> をプレゼント！」
                </p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <p className="font-semibold mb-2">例2: 予約確認</p>
                <p className="text-sm">
                  「ご予約ありがとうございます。<code>{'{'}date{'}'}</code> <code>{'{'}time{'}'}</code> にお待ちしております。」
                </p>
              </div>
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                <p className="font-semibold mb-2">例3: キャンペーン終了通知</p>
                <p className="text-sm">
                  「<code>{'{'}campaign_name{'}'}</code> は <code>{'{'}end_date{'}'}</code> で終了します。お見逃しなく！」
                </p>
              </div>
            </div>

            <InlineBest label="注意事項" items={[
              '変数名は英数字とアンダースコアのみ (スペース・記号禁止)',
              '長文テンプレートは冒頭に要約コメントを記載',
              '未使用テンプレートは定期的にアーカイブ',
              'カテゴリは5〜10種類程度に抑え分類を明確に'
            ]} />
          </Section>

          <Section id="auto-reply" title="自動返信">
            <p className="mb-6">
              ユーザーからのメッセージに対して条件に応じた自動応答を設定できる機能です。FAQ 対応・営業時間外案内・キーワードキャンペーンなど幅広く活用できます。
            </p>

            <h3 className="text-xl font-bold mb-4">ルール作成の基本</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <strong>マッチタイプ選択</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>完全一致:</strong> 「営業時間」など厳密なキーワードのみ反応</li>
                  <li><strong>部分一致:</strong> 「営業」が含まれるすべてに反応 (柔軟だが誤爆注意)</li>
                  <li><strong>前方一致:</strong> 「こんにちは」で始まるメッセージに反応</li>
                  <li><strong>正規表現:</strong> 複雑なパターンマッチ (例: 電話番号形式の検出)</li>
                </ul>
              </li>
              <li>
                <strong>キーワード設定</strong>
                <p className="mt-2">複数キーワードを登録可能 (OR 条件)。例: 「営業時間」「何時まで」「開店時間」</p>
              </li>
              <li>
                <strong>返信内容</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>固定テキスト or テンプレート選択</li>
                  <li>複数候補を登録してランダム返信 (バリエーション効果)</li>
                  <li>画像・カード・スタンプも設定可能</li>
                </ul>
              </li>
              <li>
                <strong>優先度調整</strong>
                <p className="mt-2">数字が小さいほど優先。複数ルールがマッチした場合は最優先のみ実行。</p>
              </li>
              <li>
                <strong>有効化とログ確認</strong>
                <p className="mt-2">スイッチ ON で即時反映。実行ログで発火頻度・ヒット率を分析。</p>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">実用的なルール例</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <p className="font-semibold mb-2">例1: 営業時間 FAQ</p>
                <p className="text-sm mb-2"><strong>キーワード:</strong> 「営業時間」「何時まで」「開店」</p>
                <p className="text-sm mb-2"><strong>マッチタイプ:</strong> 部分一致</p>
                <p className="text-sm"><strong>返信:</strong> 「営業時間は平日 10:00〜19:00 です。土日祝は休業しております。」</p>
              </div>
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <p className="font-semibold mb-2">例2: 緊急時の自動案内</p>
                <p className="text-sm mb-2"><strong>キーワード:</strong> 「緊急」「至急」「トラブル」</p>
                <p className="text-sm mb-2"><strong>優先度:</strong> 1 (最優先)</p>
                <p className="text-sm"><strong>返信:</strong> 「緊急のお問い合わせは 0120-XXX-XXX までお電話ください。」</p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <p className="font-semibold mb-2">例3: キャンペーン自動参加</p>
                <p className="text-sm mb-2"><strong>キーワード:</strong> 「キャンペーン」</p>
                <p className="text-sm mb-2"><strong>返信:</strong> 「キャンペーン参加ありがとうございます！抽選結果は後日お知らせします🎁」</p>
                <p className="text-sm"><strong>追加アクション:</strong> 自動的に「campaign_2025」タグを付与 (計画中)</p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">正規表現の活用例</h3>
            <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
              <p className="font-mono text-sm">
                <strong>電話番号検出:</strong> <code>^\d{'{'}2,4{'}'}-\d{'{'}2,4{'}'}-\d{'{'}4{'}'}$</code>
              </p>
              <p className="font-mono text-sm">
                <strong>メールアドレス:</strong> <code>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{'{'}2,{'}'}$</code>
              </p>
              <p className="font-mono text-sm">
                <strong>郵便番号:</strong> <code>^\d{'{'}3{'}'}-\d{'{'}4{'}'}$</code>
              </p>
            </div>

            <h3 className="text-xl font-bold mb-4 mt-6">運用上の注意点</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>過剰マッチ防止:</strong> 部分一致は範囲が広すぎて意図しない発火を招く。前方一致や完全一致を優先。</li>
              <li><strong>優先度設計:</strong> 汎用ルールは優先度を低く、緊急・特定ルールを高く設定。</li>
              <li><strong>ログ分析:</strong> 週次でヒット数トップ 10 を確認し、誤爆ルールを修正。</li>
              <li><strong>テスト環境:</strong> 本番適用前にテストユーザーで動作確認。</li>
            </ul>

            <InlineBest label="避けるべきパターン" items={[
              '巨大な汎用正規表現 (パフォーマンス低下)',
              '重複キーワードを持つ複数ルール (競合して不安定)',
              '「ありがとう」など頻出ワードへの単純一致 (すべてに反応)',
              '優先度を設定せず多数のルールを並列運用'
            ]} />
          </Section>

          <Section id="users" title="ユーザー管理">
            <p className="mb-6">
              フォロワーの状態管理・タグ付けセグメント・アクティビティ履歴の確認を一元化。ターゲット配信やユーザー分析の基盤となる機能です。
            </p>

            <h3 className="text-xl font-bold mb-4">主な機能</h3>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                <strong>ユーザー一覧:</strong> フォロー状態・最終アクティブ日・タグでフィルタ検索
              </li>
              <li>
                <strong>詳細ビュー:</strong> 個別ユーザーの受信/送信履歴・タグ編集・メモ機能
              </li>
              <li>
                <strong>タグ管理:</strong> 「VIP」「新規」「休眠」などセグメント作成と一括付与
              </li>
              <li>
                <strong>離脱分析:</strong> ブロック済みユーザーの抽出と再活性化施策
              </li>
            </ul>

            <h3 className="text-xl font-bold mb-4">タグ運用のベストプラクティス</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="font-semibold mb-2">命名規則</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><code>segment_新規</code> <code>segment_VIP</code> のように prefix 統一</li>
                  <li><code>campaign_2025春</code> など一時的なタグは期間明記</li>
                  <li><code>behavior_高頻度購入</code> で行動特性を分類</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 border-l-4 border-green-500">
                <p className="font-semibold mb-2">自動タグ付け (計画)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>初回フォロー時に「新規」タグ自動付与</li>
                  <li>30日間未反応なら「休眠」タグ</li>
                  <li>購入履歴連携で「購入済み」タグ</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">一括操作の手順</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>検索・フィルタで対象ユーザーを絞り込み</li>
              <li>チェックボックスで複数選択 (全選択も可能)</li>
              <li>「タグ一括付与」または「一括メッセージ送信」を実行</li>
              <li>確認ダイアログで対象件数と内容を最終チェック</li>
            </ol>

            <h3 className="text-xl font-bold mb-4">休眠ユーザー再活性化</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>「最終アクティブ 30 日以上前」でフィルタ</li>
              <li>抽出ユーザーに「休眠」タグ付与</li>
              <li>特別クーポン付きメッセージを配信</li>
              <li>反応したユーザーは「再アクティブ」タグへ移動</li>
              <li>週次で再活性化率を測定し施策改善</li>
            </ol>

            <Tips items={[
              'タグは segment_ / campaign_ / behavior_ で prefix 統一',
              '週次で有効フォロー率 (ブロック率) を記録しトレンド把握',
              'VIP タグは購入金額・頻度などの明確基準を設定',
              '休眠ユーザーへの過度な配信はブロック率上昇のリスク'
            ]} />
          </Section>

          <Section id="richmenu" title="リッチメニュー">
            <p className="mb-6">
              LINE トーク画面下部に常駐するタップ可能なメニューです。画像とアクション領域を組み合わせて、ユーザーの導線を最適化します。
            </p>

            <h3 className="text-xl font-bold mb-4">作成の流れ</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <strong>画像準備</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>推奨解像度: 幅 2500px × 高さ 1686px または 843px (大/小サイズ)</li>
                  <li>形式: PNG または JPEG</li>
                  <li>デザイン: 各領域に明確なラベル文字を配置 (タップ可能と視認)</li>
                </ul>
              </li>
              <li>
                <strong>画像アップロード</strong>
                <p className="mt-2">ドラッグ&ドロップまたはファイル選択でアップロード。自動的に Cloudinary へ保存され公開 URL を取得。</p>
              </li>
              <li>
                <strong>領域定義</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>キャンバス上でドラッグして矩形領域を作成</li>
                  <li>最小サイズ (幅・高さ 100px 以上) 未満は警告表示</li>
                  <li>各領域に名前とアクションを設定</li>
                </ul>
              </li>
              <li>
                <strong>アクション設定</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>URL:</strong> 外部サイトや EC サイトへ遷移</li>
                  <li><strong>メッセージ送信:</strong> 特定テキストを bot へ自動送信 (予約・問い合わせ等)</li>
                  <li><strong>Postback:</strong> システム側でイベント処理 (カート追加など)</li>
                </ul>
              </li>
              <li>
                <strong>プレビュー</strong>
                <p className="mt-2">PC とモバイル表示を切り替えて文字潰れ・領域サイズを確認。特にスマホ縦持ち時の視認性に注意。</p>
              </li>
              <li>
                <strong>適用</strong>
                <p className="mt-2">保存後、全体適用または特定タグのみに配信。複数バージョンを AB テスト可能。</p>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-4">デザインのコツ</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>余白均等:</strong> 領域間のスペースを均一にし誤タップを防止</li>
              <li><strong>重要領域の配置:</strong> 中央〜下部は指が届きやすく反応率が高い</li>
              <li><strong>色使い:</strong> CTA ボタンは高彩度色で目立たせる</li>
              <li><strong>文字サイズ:</strong> 最小 16px 以上で視認性確保</li>
              <li><strong>シンプル構成:</strong> 領域数は 3〜6 個が理想 (多すぎると選択疲れ)</li>
            </ul>

            <h3 className="text-xl font-bold mb-4">実用例</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500">
                <p className="font-semibold mb-2">例1: EC サイト導線</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>「新商品」→ 商品一覧ページ URL</li>
                  <li>「セール」→ セール特設ページ URL</li>
                  <li>「お問い合わせ」→ 「問い合わせ内容を入力してください」メッセージ送信</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 border-l-4 border-green-500">
                <p className="font-semibold mb-2">例2: 予約受付</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>「今すぐ予約」→ 予約フォーム URL</li>
                  <li>「空き状況」→ 「空き状況」メッセージ送信 → 自動返信で空席情報</li>
                  <li>「キャンセル」→ キャンセルフォーム URL</li>
                </ul>
              </div>
            </div>

            <InlineBest label="ヒント" items={[
              '画像は Figma / Canva で作成し PNG 書き出し',
              '領域編集時は Esc で選択解除、Delete で削除',
              'A/B テストで異なるデザインの反応率を比較',
              '季節・キャンペーンごとにメニューを切り替え'
            ]} />
          </Section>

          <Section id="analytics" title="分析 / 可視化">
            <p className="mb-6">
              配信データとユーザーアクティビティを可視化し、施策の効果測定と改善点の発見を支援します。KPI ダッシュボードで定量的な意思決定が可能に。
            </p>

            <h3 className="text-xl font-bold mb-4">主要指標</h3>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                <strong>メッセージ送信数:</strong> 期間別 (日/週/月) の送信総数と成功率
              </li>
              <li>
                <strong>配信成功率:</strong> 成功/失敗の比率。90% 以下は要調査。
              </li>
              <li>
                <strong>反応率 (計画中):</strong> 送信後のユーザー返信率・リンククリック率
              </li>
              <li>
                <strong>自動返信ヒット数:</strong> ルール別の発火頻度ランキング
              </li>
              <li>
                <strong>ユーザー増減:</strong> 新規フォロー / ブロック / 再フォローの推移
              </li>
            </ul>

            <h3 className="text-xl font-bold mb-4">時間帯別ヒートマップ</h3>
            <p className="mb-4">
              曜日 × 時間帯のマトリクスでユーザーアクティビティを可視化。最も反応率が高い配信タイミングを特定できます。
            </p>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 mb-6">
              <p className="font-semibold mb-2">活用例</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>平日 12:00〜13:00 (昼休み) と 20:00〜21:00 (帰宅後) が最高反応</li>
                <li>土日午前は反応率が低い → 配信を平日夜にシフト</li>
                <li>深夜配信はブロック率上昇 → 避けるべき時間帯として記録</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold mb-4">テンプレート効果測定</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>期間選択で特定キャンペーンのメッセージを抽出</li>
              <li>テンプレート別に送信数・反応率を比較</li>
              <li>低反応テンプレートに「要改善」フラグを付与</li>
              <li>A/B テスト: 2 バージョンを同条件で配信し効果比較</li>
              <li>勝利パターンを標準テンプレートとして登録</li>
            </ol>

            <h3 className="text-xl font-bold mb-4">レポート出力 (計画)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>週次/月次レポートを PDF または CSV でエクスポート</li>
              <li>経営層向けサマリー (フォロー数推移・ROI 概算)</li>
              <li>運用担当向け詳細 (ルール別ヒット率・失敗原因内訳)</li>
            </ul>

            <Tips items={[
              '週次で主要 KPI をスクリーンショット保管',
              '反応率変動は施策開始/終了日と紐付けて記録',
              'ヒートマップで最適配信時刻を特定し自動スケジュール化',
              '低反応テンプレートは 3 回改善しても効果なければ廃止'
            ]} />
          </Section>

          <Section id="webhook-check" title="Webhook 診断">
            <p className="mb-6">
              LINE からのイベント受信が正常に動作しているか確認するための診断ツールです。署名検証・URL 設定・ネットワーク疎通を一括チェック。
            </p>

            <h3 className="text-xl font-bold mb-4">診断項目</h3>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                <strong>公開 URL 設定:</strong> NEXT_PUBLIC_BASE_URL が正しく環境変数に設定されているか
              </li>
              <li>
                <strong>署名検証:</strong> x-line-signature ヘッダーと Channel Secret の一致を確認
              </li>
              <li>
                <strong>受信テスト:</strong> ダミーイベントを送信してサーバー応答を検証
              </li>
              <li>
                <strong>イベントログ:</strong> 直近 100 件の受信イベントを時系列表示
              </li>
            </ul>

            <h3 className="text-xl font-bold mb-4">トラブル別対処法</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-semibold mb-2">署名検証失敗 (400 エラー)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Channel Secret が間違っている → 設定画面で再確認</li>
                  <li>リクエストボディが改変されている → プロキシ設定を確認</li>
                  <li>UTF-8 エンコーディング問題 → サーバーの charset 設定</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">イベント受信ゼロ</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Webhook URL が LINE Developers に未登録 → 登録して保存</li>
                  <li>トンネル (cloudflared) が停止 → ターミナルで再起動</li>
                  <li>ファイアウォールでブロック → 許可設定追加</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="font-semibold mb-2">遅延が大きい (5秒以上)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>データベース接続が遅い → インデックス追加・クエリ最適化</li>
                  <li>外部 API 呼び出しで待機 → 非同期処理へ移行</li>
                  <li>ネットワーク帯域不足 → サーバースペック見直し</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Cloudflare Tunnel 利用時の注意</h3>
            <ol className="list-decimal pl-6 space-y-2 mb-6">
              <li>トンネル起動時に表示される URL をコピー</li>
              <li><code>NEXT_PUBLIC_BASE_URL</code> へ設定し再起動</li>
              <li>LINE Developers の Webhook URL を更新</li>
              <li>「検証」ボタンで疎通確認</li>
              <li>トンネル URL は起動ごとに変わるため都度更新必要</li>
            </ol>

            <InlineBest label="チェックリスト" items={[
              'x-line-signature ヘッダーが存在するか',
              'Webhook URL が https:// で始まるか (http 不可)',
              'Channel Secret に余分なスペース・改行が混入していないか',
              'トンネルプロセスが起動中か (ps aux | grep cloudflared)'
            ]} />
          </Section>

          <Section id="settings" title="設定">
            <p className="mb-6">
              LINE チャネル情報・通知設定・外部連携の一元管理画面です。初期セットアップと定期的なトークンローテーションに使用。
            </p>

            <h3 className="text-xl font-bold mb-4">設定項目</h3>
            <ul className="list-disc pl-6 space-y-3 mb-6">
              <li>
                <strong>LINE チャネル情報</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Channel ID: LINE Developers コンソールからコピー</li>
                  <li>Channel Secret: 署名検証に使用</li>
                  <li>Channel Access Token: メッセージ送信 API に必要</li>
                </ul>
              </li>
              <li>
                <strong>公開 BASE_URL:</strong> Webhook / Imagemap で使用する HTTPS URL
              </li>
              <li>
                <strong>通知設定</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>失敗ジョブの通知: Slack / メール連携</li>
                  <li>エラー閾値: 10 件/時間を超えたらアラート</li>
                </ul>
              </li>
              <li>
                <strong>外部サービス (オプション)</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Cloudinary: 画像ストレージ</li>
                  <li>Sentry: エラー監視</li>
                  <li>Upstash Redis: キャッシュ・セッション</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-xl font-bold mb-4">トークンローテーション手順</h3>
            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li>LINE Developers で新しい Channel Access Token を発行</li>
              <li>設定画面で新トークンを入力 → 保存</li>
              <li>Webhook 診断で疎通確認</li>
              <li>問題なければ旧トークンを無効化</li>
              <li>変更履歴にローテーション日を記録</li>
            </ol>

            <h3 className="text-xl font-bold mb-4">環境別設定管理</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 mb-6">
              <p className="font-semibold mb-2">開発環境</p>
              <ul className="list-disc pl-5 space-y-1 text-sm mb-3">
                <li><code>.env.local</code> に開発用 Channel 情報</li>
                <li>Cloudflare Tunnel で一時公開 URL</li>
              </ul>
              <p className="font-semibold mb-2">本番環境</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Vercel / AWS 等の環境変数に本番 Channel 情報</li>
                <li>固定ドメイン (例: https://line-bot.example.com)</li>
              </ul>
            </div>

            <Tips items={[
              '本番と開発で Channel を分離しテスト配信事故を防止',
              '権限変更後は必ず Webhook 再テスト',
              'Channel Secret は Git にコミットしない (.env.local のみ)',
              'トークンローテーションは四半期ごと推奨'
            ]} />
          </Section>

          <Section id="troubleshooting" title="トラブルシュート">
            <p className="mb-6">
              よくある問題と解決策をまとめたリファレンスです。問い合わせ前にこのセクションを確認してください。
            </p>

            <h3 className="text-xl font-bold mb-4">メッセージ送信</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-semibold mb-2">送信失敗 (401 Unauthorized)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>原因:</strong> Access Token が無効または期限切れ</li>
                  <li><strong>対処:</strong> 設定画面でトークン再発行・再設定</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">送信成功だが届かない</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>原因:</strong> ユーザーがブロック済み</li>
                  <li><strong>対処:</strong> ユーザー一覧でフォロー状態を確認</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="font-semibold mb-2">画像が表示されない</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>原因:</strong> 画像 URL が https でない / アクセス制限</li>
                  <li><strong>対処:</strong> Cloudinary 等の公開ストレージを使用</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">自動返信</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-semibold mb-2">ルールが発火しない</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>ルールのステータスが OFF → ON に変更</li>
                  <li>優先度が低く他のルールに上書きされている → 優先度調整</li>
                  <li>キーワードに余分なスペース → 前後トリム確認</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">意図しないメッセージで発火</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>部分一致の範囲が広すぎる → 前方一致または完全一致へ変更</li>
                  <li>正規表現が曖昧 → パターンを厳密化</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Webhook</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-semibold mb-2">イベントが受信できない</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Webhook URL が LINE Developers に未登録 → 登録・保存</li>
                  <li>トンネルが停止 → <code>cloudflared</code> 再起動</li>
                  <li>署名検証失敗 → Secret 再確認</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">画像・リッチメニュー</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">画像が劣化・ぼやける</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>原因:</strong> 元画像解像度不足</li>
                  <li><strong>対処:</strong> 幅 1024px 以上で再アップロード</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="font-semibold mb-2">領域が選択・移動できない</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>キャンバス外をクリックして再選択</li>
                  <li>ブラウザ拡張 (広告ブロック等) を無効化</li>
                </ul>
              </div>
            </div>

            <InlineBest label="問い合わせ前の確認事項" items={[
              '設定値が最新か (トークン・URL)',
              '直近のデプロイ・設定変更有無',
              'エラーログで具体的なエラー型を特定',
              'Webhook 診断で疎通確認済みか'
            ]} />
          </Section>
        </div>

        {/* フッターナビ */}
        <div className="mt-28 flex flex-wrap gap-6">
          <Link
            href="/"
            className="rounded-xl bg-[#00B900] text-white font-mono text-xs px-6 py-3 font-bold tracking-[0.15em] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:opacity-90 transition-all duration-300"
          >
            トップへ戻る →
          </Link>
          <Link
            href="/docs/system-design"
            className="rounded-xl bg-white/70 text-gray-800 font-mono text-xs px-6 py-3 font-bold tracking-[0.15em] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:bg-[#e8f5e9] transition-all duration-300"
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
      <div className={`space-y-6 leading-relaxed text-gray-700 ${ibmPlexSans.className}`}>{children}</div>
    </section>
  );
}

function Tips({ items }: { items: string[] }) {
  return (
    <div className="mt-6 rounded-xl bg-[#F6FFE9]/80 p-4 text-sm space-y-2 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
      <p className="font-semibold text-gray-800">Tips</p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function InlineBest({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-6 rounded-xl bg-[#FFFBEA]/80 p-4 text-xs space-y-2 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
      <p className="font-semibold text-gray-800">{label}</p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
