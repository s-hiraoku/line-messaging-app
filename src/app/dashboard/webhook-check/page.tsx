'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from 'react';
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

function StatusIcon({ status }: { status: boolean | null }) {
  if (status === null) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
        <span className="text-sm font-bold text-gray-700">...</span>
      </div>
    );
  }
  return status ? (
    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00B900] shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
      <span className="text-sm font-bold text-white">✓</span>
    </div>
  ) : (
    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
      <span className="text-sm font-bold text-white">✗</span>
    </div>
  );
}

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

  const checkLocal = useCallback(async () => {
    try {
      const response = await fetch('/api/line/webhook/test');
      const data = await response.json().catch(() => ({}));
      setDebugResponses(prev => ({ ...prev, webhookTest: data }));
      setLocalTest(response.ok);
    } catch {
      setLocalTest(false);
    }
  }, []);

  const checkDbRules = useCallback(async () => {
    try {
      const response = await fetch('/api/auto-reply');
      const data = await response.json();
      setDebugResponses(prev => ({ ...prev, autoReply: data }));
      setDbRulesCount(data.autoReplies?.length || 0);
    } catch {
      setDbRulesCount(null);
    }
  }, []);

  const checkChannelConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/channel');
      const data = await response.json();
      setDebugResponses(prev => ({ ...prev, channelSettings: data }));
      setChannelConfig(data);
    } catch {
      setChannelConfig(null);
    }
  }, []);

  useEffect(() => {
    checkLocal();
    checkDbRules();
    checkChannelConfig();
  }, [checkLocal, checkDbRules, checkChannelConfig]);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>Webhook診断</h1>
          <div className="h-2 w-12 rotate-12 rounded-full bg-[#FFE500]" />
        </div>
        <p className={`text-base text-gray-600 ${ibmPlexSans.className}`}>
          自動応答が動作しない場合、この画面で設定を確認してください。
        </p>
      </header>

      {/* アプリケーション側のチェック */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>1. アプリケーション設定</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StatusIcon status={localTest} />
            <div className="flex-1">
              <div className="font-bold text-gray-800">Webhookエンドポイント</div>
              <div className="text-xs font-mono text-gray-500">
                /api/line/webhook/test にアクセス可能か
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={channelConfig?.channelSecretConfigured || false} />
            <div className="flex-1">
              <div className="font-bold text-gray-800">チャネルシークレット</div>
              <div className="text-xs font-mono text-gray-500">
                {channelConfig?.channelSecretConfigured
                  ? '設定済み'
                  : '未設定（設定画面で登録してください）'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIcon status={dbRulesCount !== null && dbRulesCount > 0} />
            <div className="flex-1">
              <div className="font-bold text-gray-800">自動応答ルール</div>
              <div className="text-xs font-mono text-gray-500">
                {dbRulesCount !== null ? `${dbRulesCount}件のルールが登録済み` : '確認中...'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href="/dashboard/settings"
            className="rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_3px_8px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.12)]"
          >
            設定画面を開く
          </Link>
          <Link
            href="/dashboard/auto-reply"
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_3px_8px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.12)]"
          >
            ルール一覧
          </Link>
        </div>
      </section>

      {/* LINE側のチェック */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>2. LINE Developers設定（最重要）</h2>

        <div className="mb-4 rounded-xl bg-yellow-50 p-4 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="mb-2 font-bold uppercase tracking-wider text-yellow-600">
            Warning: ローカルテストはOKだがLINEからメッセージが届かない場合
          </div>
          <div className="text-sm text-gray-600">
            以下のLINE Developers設定を確認してください：
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-[#e8f5e9] p-4 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="mb-2 font-bold text-gray-800">
              <a
                href="https://developers.line.biz/console/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-1 transition-all duration-300 hover:bg-[#FFE500]"
              >
                LINE Developers Console →
              </a>
            </div>

            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono font-bold text-gray-800">1.</span>
                <div>
                  <div className="font-bold text-gray-800">Messaging APIチャネルを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-gray-800">2.</span>
                <div>
                  <div className="font-bold text-gray-800">「Messaging API設定」タブを開く</div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-red-600">*</span>
                <div>
                  <div className="font-bold text-gray-800">
                    「Webhookの利用」を<span className="text-[#00B900]">オン（緑色）</span>にする
                  </div>
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    オフ（灰色）だとWebhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-red-600">*</span>
                <div>
                  <div className="font-bold text-gray-800">
                    「応答メッセージ」を<span className="text-gray-500">オフ</span>にする
                  </div>
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    オンだとLINEの自動応答が優先され、Webhookが呼ばれません
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-gray-800">3.</span>
                <div>
                  <div className="font-bold text-gray-800">Webhook URLを設定</div>
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    ローカル: Cloudflare Tunnelなどで公開URLを取得<br />
                    本番: https://your-domain.com/api/line/webhook
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-mono font-bold text-gray-800">4.</span>
                <div>
                  <div className="font-bold text-gray-800">設定を保存</div>
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    「更新」ボタンをクリックして設定を確定
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Cloudflare Tunnel */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>3. ローカル開発用の公開URL</h2>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            ローカル開発の場合、LINEがアクセスできる公開URLが必要です：
          </div>

          <div className="rounded-xl bg-[#e8f5e9] p-4 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-800">ターミナルで実行:</div>
            <code className="font-mono text-sm font-bold text-[#00B900]">
              cloudflared tunnel --url http://localhost:3000
            </code>
          </div>

          <div className="text-xs font-mono text-gray-500">
            表示されたURL（https://xxxx.trycloudflare.com）に /api/line/webhook を付けて、
            LINE DevelopersのWebhook URLに設定してください。
          </div>
        </div>
      </section>

      {/* テスト手順 */}
      <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>4. テスト手順</h2>

        <ol className="space-y-2 text-sm text-gray-800">
          <li className="flex gap-3">
            <span className="font-mono font-bold text-gray-800">1.</span>
            <span className="font-mono">上記の設定をすべて完了させる</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-gray-800">2.</span>
            <span className="font-mono">
              <Link href="/dashboard/dev" className="rounded-md px-1 font-bold transition-all duration-300 hover:bg-[#FFE500]">
                開発者ページ
              </Link>
              を開く（ログを確認するため）
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-gray-800">3.</span>
            <span className="font-mono">LINEでボットにメッセージを送信</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-gray-800">4.</span>
            <span className="font-mono">開発者ページに webhook:received, auto-reply:processing などのログが表示される</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono font-bold text-gray-800">5.</span>
            <span className="font-mono">LINEで自動応答が返ってくる</span>
          </li>
        </ol>
      </section>

      {/* リンク */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/dev"
          className="rounded-xl bg-[#00B900] px-4 py-2 font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_3px_8px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.12)]"
        >
          開発者ページでログを確認
        </Link>
        <Link
          href="/dashboard/auto-reply"
          className="rounded-xl bg-white px-4 py-2 font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_3px_8px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.12)]"
        >
          自動応答ルール
        </Link>
      </div>

      {/* API Debug Panels */}
      <div className="space-y-4">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>API デバッグ</h2>

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
