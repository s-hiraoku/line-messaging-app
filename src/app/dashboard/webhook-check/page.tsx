'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WebhookCheckPage() {
  const [localTest, setLocalTest] = useState<boolean | null>(null);
  const [dbRulesCount, setDbRulesCount] = useState<number | null>(null);
  const [channelConfig, setChannelConfig] = useState<{
    channelId?: string;
    channelSecretConfigured?: boolean;
  } | null>(null);

  useEffect(() => {
    checkLocal();
    checkDbRules();
    checkChannelConfig();
  }, []);

  const checkLocal = async () => {
    try {
      const response = await fetch('/api/line/webhook/test');
      setLocalTest(response.ok);
    } catch {
      setLocalTest(false);
    }
  };

  const checkDbRules = async () => {
    try {
      const response = await fetch('/api/auto-reply');
      const data = await response.json();
      setDbRulesCount(data.autoReplies?.length || 0);
    } catch {
      setDbRulesCount(null);
    }
  };

  const checkChannelConfig = async () => {
    try {
      const response = await fetch('/api/settings/channel');
      const data = await response.json();
      setChannelConfig(data);
    } catch {
      setChannelConfig(null);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <span className="text-slate-500">⏳</span>;
    return status ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Webhook診断</h1>
        <p className="text-sm text-slate-400">
          自動応答が動作しない場合、この画面で設定を確認してください。
        </p>
      </header>

      {/* アプリケーション側のチェック */}
      <section className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">1. アプリケーション設定</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StatusIcon status={localTest} />
            <div className="flex-1">
              <div className="text-slate-200">Webhookエンドポイント</div>
              <div className="text-xs text-slate-400">
                /api/line/webhook/test にアクセス可能か
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={channelConfig?.channelSecretConfigured || false} />
            <div className="flex-1">
              <div className="text-slate-200">チャネルシークレット</div>
              <div className="text-xs text-slate-400">
                {channelConfig?.channelSecretConfigured
                  ? '設定済み'
                  : '未設定（設定画面で登録してください）'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={dbRulesCount !== null && dbRulesCount > 0} />
            <div className="flex-1">
              <div className="text-slate-200">自動応答ルール</div>
              <div className="text-xs text-slate-400">
                {dbRulesCount !== null ? `${dbRulesCount}件のルールが登録済み` : '確認中...'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            設定画面を開く
          </Link>
          <Link
            href="/dashboard/auto-reply"
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 text-sm"
          >
            ルール一覧
          </Link>
        </div>
      </section>

      {/* LINE側のチェック */}
      <section className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">2. LINE Developers設定（最重要）</h2>

        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-md p-4 mb-4">
          <div className="text-yellow-400 font-semibold mb-2">
            ⚠️ ローカルテストはOKだがLINEからメッセージが届かない場合
          </div>
          <div className="text-sm text-slate-300">
            以下のLINE Developers設定を確認してください：
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-slate-700 rounded-md p-4">
            <div className="font-semibold text-white mb-2">
              <a
                href="https://developers.line.biz/console/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                LINE Developers Console →
              </a>
            </div>

            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-slate-500 font-mono">1.</span>
                <div>
                  <div className="text-slate-200">Messaging APIチャネルを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-slate-500 font-mono">2.</span>
                <div>
                  <div className="text-slate-200">「Messaging API設定」タブを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-red-400 font-mono">★</span>
                <div>
                  <div className="text-white font-semibold">
                    「Webhookの利用」を<span className="text-green-400">オン（緑色）</span>にする
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    オフ（灰色）だとWebhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-red-400 font-mono">★</span>
                <div>
                  <div className="text-white font-semibold">
                    「応答メッセージ」を<span className="text-slate-400">オフ</span>にする
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    オンだとLINEの自動応答が優先され、Webhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-slate-500 font-mono">3.</span>
                <div>
                  <div className="text-slate-200">Webhook URLを設定</div>
                  <div className="text-xs text-slate-400 mt-1">
                    ローカル: Cloudflare Tunnelなどで公開URLを取得<br />
                    本番: https://your-domain.com/api/line/webhook
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-slate-500 font-mono">4.</span>
                <div>
                  <div className="text-slate-200">設定を保存</div>
                  <div className="text-xs text-slate-400 mt-1">
                    「更新」ボタンをクリックして設定を確定
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Cloudflare Tunnel */}
      <section className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">3. ローカル開発用の公開URL</h2>

        <div className="space-y-3">
          <div className="text-sm text-slate-300">
            ローカル開発の場合、LINEがアクセスできる公開URLが必要です：
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-md p-4">
            <div className="text-xs text-slate-400 mb-2">ターミナルで実行:</div>
            <code className="text-sm text-green-400">
              cloudflared tunnel --url http://localhost:3000
            </code>
          </div>

          <div className="text-xs text-slate-400">
            表示されたURL（https://xxxx.trycloudflare.com）に /api/line/webhook を付けて、
            LINE DevelopersのWebhook URLに設定してください。
          </div>
        </div>
      </section>

      {/* テスト手順 */}
      <section className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">4. テスト手順</h2>

        <ol className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="text-slate-500">1.</span>
            <span>上記の設定をすべて完了させる</span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-500">2.</span>
            <span>
              <Link href="/dashboard/dev" className="text-blue-400 hover:text-blue-300">
                開発者ページ
              </Link>
              を開く（ログを確認するため）
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-500">3.</span>
            <span>LINEでボットにメッセージを送信</span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-500">4.</span>
            <span>開発者ページに webhook:received, auto-reply:processing などのログが表示される</span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-500">5.</span>
            <span>LINEで自動応答が返ってくる</span>
          </li>
        </ol>
      </section>

      {/* リンク */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/dev"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          開発者ページでログを確認
        </Link>
        <Link
          href="/dashboard/auto-reply"
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
        >
          自動応答ルール
        </Link>
      </div>
    </div>
  );
}
