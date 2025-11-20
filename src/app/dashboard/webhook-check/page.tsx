'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DebugPanel, toCurl } from '../_components/debug-panel';
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function WebhookCheckPage() {
  const [localTest, setLocalTest] = useState<boolean | null>(null);
  const [dbRulesCount, setDbRulesCount] = useState<number | null>(null);
  const [channelConfig, setChannelConfig] = useState<{
    channelId?: string;
    channelSecretConfigured?: boolean;
  } | null>(null);
  const [debugResponses, setDebugResponses] = useState<{
    webhookTest?: unknown;
    autoReply?: unknown;
    channelSettings?: unknown;
  }>({});

  useEffect(() => {
    checkLocal();
    checkDbRules();
    checkChannelConfig();
  }, []);

  const checkLocal = async () => {
    try {
      const response = await fetch('/api/line/webhook/test');
      const data = await response.json().catch(() => ({}));
      setDebugResponses(prev => ({ ...prev, webhookTest: data }));
      setLocalTest(response.ok);
    } catch {
      setLocalTest(false);
    }
  };

  const checkDbRules = async () => {
    try {
      const response = await fetch('/api/auto-reply');
      const data = await response.json();
      setDebugResponses(prev => ({ ...prev, autoReply: data }));
      setDbRulesCount(data.autoReplies?.length || 0);
    } catch {
      setDbRulesCount(null);
    }
  };

  const checkChannelConfig = async () => {
    try {
      const response = await fetch('/api/settings/channel');
      const data = await response.json();
      setDebugResponses(prev => ({ ...prev, channelSettings: data }));
      setChannelConfig(data);
    } catch {
      setChannelConfig(null);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) {
      return (
        <div className="flex h-6 w-6 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-sm font-bold text-black">⏳</span>
        </div>
      );
    }
    return status ? (
      <div className="flex h-6 w-6 items-center justify-center border-2 border-black bg-[#00B900] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-sm font-bold text-white">✓</span>
      </div>
    ) : (
      <div className="flex h-6 w-6 items-center justify-center border-2 border-black bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-sm font-bold text-white">✗</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-black ${syne.className}`}>Webhook診断</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-black/70 ${ibmPlexSans.className}`}>
          自動応答が動作しない場合、この画面で設定を確認してください。
        </p>
      </header>

      {/* アプリケーション側のチェック */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>1. アプリケーション設定</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StatusIcon status={localTest} />
            <div className="flex-1">
              <div className="font-bold text-black">Webhookエンドポイント</div>
              <div className="text-xs font-mono text-black/60">
                /api/line/webhook/test にアクセス可能か
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={channelConfig?.channelSecretConfigured || false} />
            <div className="flex-1">
              <div className="font-bold text-black">チャネルシークレット</div>
              <div className="text-xs font-mono text-black/60">
                {channelConfig?.channelSecretConfigured
                  ? '設定済み'
                  : '未設定（設定画面で登録してください）'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={dbRulesCount !== null && dbRulesCount > 0} />
            <div className="flex-1">
              <div className="font-bold text-black">自動応答ルール</div>
              <div className="text-xs font-mono text-black/60">
                {dbRulesCount !== null ? `${dbRulesCount}件のルールが登録済み` : '確認中...'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href="/dashboard/settings"
            className="border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            設定画面を開く
          </Link>
          <Link
            href="/dashboard/auto-reply"
            className="border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ルール一覧
          </Link>
        </div>
      </section>

      {/* LINE側のチェック */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>2. LINE Developers設定（最重要）</h2>

        <div className="mb-4 border-2 border-yellow-600 bg-yellow-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-2 font-bold uppercase tracking-wider text-yellow-600">
            ⚠️ ローカルテストはOKだがLINEからメッセージが届かない場合
          </div>
          <div className="text-sm text-black/70">
            以下のLINE Developers設定を確認してください：
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 font-bold text-black">
              <a
                href="https://developers.line.biz/console/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b-2 border-black hover:bg-[#FFE500]"
              >
                LINE Developers Console →
              </a>
            </div>

            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono font-bold text-black">1.</span>
                <div>
                  <div className="font-bold text-black">Messaging APIチャネルを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-black">2.</span>
                <div>
                  <div className="font-bold text-black">「Messaging API設定」タブを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-red-600">★</span>
                <div>
                  <div className="font-bold text-black">
                    「Webhookの利用」を<span className="text-[#00B900]">オン（緑色）</span>にする
                  </div>
                  <div className="mt-1 text-xs font-mono text-black/60">
                    オフ（灰色）だとWebhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-red-600">★</span>
                <div>
                  <div className="font-bold text-black">
                    「応答メッセージ」を<span className="text-black/60">オフ</span>にする
                  </div>
                  <div className="mt-1 text-xs font-mono text-black/60">
                    オンだとLINEの自動応答が優先され、Webhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-black">3.</span>
                <div>
                  <div className="font-bold text-black">Webhook URLを設定</div>
                  <div className="mt-1 text-xs font-mono text-black/60">
                    ローカル: Cloudflare Tunnelなどで公開URLを取得<br />
                    本番: https://your-domain.com/api/line/webhook
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-black">4.</span>
                <div>
                  <div className="font-bold text-black">設定を保存</div>
                  <div className="mt-1 text-xs font-mono text-black/60">
                    「更新」ボタンをクリックして設定を確定
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Cloudflare Tunnel */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>3. ローカル開発用の公開URL</h2>

        <div className="space-y-3">
          <div className="text-sm text-black/70">
            ローカル開発の場合、LINEがアクセスできる公開URLが必要です：
          </div>

          <div className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-black">ターミナルで実行:</div>
            <code className="font-mono text-sm font-bold text-[#00B900]">
              cloudflared tunnel --url http://localhost:3000
            </code>
          </div>

          <div className="text-xs font-mono text-black/60">
            表示されたURL（https://xxxx.trycloudflare.com）に /api/line/webhook を付けて、
            LINE DevelopersのWebhook URLに設定してください。
          </div>
        </div>
      </section>

      {/* テスト手順 */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>4. テスト手順</h2>

        <ol className="space-y-2 text-sm text-black">
          <li className="flex gap-3">
            <span className="font-mono font-bold text-black">1.</span>
            <span className="font-mono">上記の設定をすべて完了させる</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-black">2.</span>
            <span className="font-mono">
              <Link href="/dashboard/dev" className="border-b-2 border-black font-bold hover:bg-[#FFE500]">
                開発者ページ
              </Link>
              を開く（ログを確認するため）
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-black">3.</span>
            <span className="font-mono">LINEでボットにメッセージを送信</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-black">4.</span>
            <span className="font-mono">開発者ページに webhook:received, auto-reply:processing などのログが表示される</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-black">5.</span>
            <span className="font-mono">LINEで自動応答が返ってくる</span>
          </li>
        </ol>
      </section>

      {/* リンク */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/dev"
          className="border-2 border-black bg-[#00B900] px-4 py-2 font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          開発者ページでログを確認
        </Link>
        <Link
          href="/dashboard/auto-reply"
          className="border-2 border-black bg-white px-4 py-2 font-bold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          自動応答ルール
        </Link>
      </div>

      {/* API Debug Panels */}
      <div className="space-y-4">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-black ${ibmPlexSans.className}`}>API デバッグ</h2>

        <DebugPanel
          title="/api/line/webhook/test"
          request={{}}
          response={debugResponses.webhookTest}
          curl={toCurl({
            url: typeof window !== 'undefined' ? `${window.location.origin}/api/line/webhook/test` : 'http://localhost:3000/api/line/webhook/test',
            method: 'GET'
          })}
        />

        <DebugPanel
          title="/api/auto-reply"
          request={{}}
          response={debugResponses.autoReply}
          curl={toCurl({
            url: typeof window !== 'undefined' ? `${window.location.origin}/api/auto-reply` : 'http://localhost:3000/api/auto-reply',
            method: 'GET'
          })}
        />

        <DebugPanel
          title="/api/settings/channel"
          request={{}}
          response={debugResponses.channelSettings}
          curl={toCurl({
            url: typeof window !== 'undefined' ? `${window.location.origin}/api/settings/channel` : 'http://localhost:3000/api/settings/channel',
            method: 'GET'
          })}
        />
      </div>
    </div>
  );
}
