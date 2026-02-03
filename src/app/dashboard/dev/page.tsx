"use client";

import { useEffect, useState } from "react";
import { DebugPanel, toCurl } from "../_components/debug-panel";
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

type DevInfo = {
  app: { name: string; version: string; node: string; env: string; now: string };
  runtime: { databaseConnected: boolean; redisConfigured: boolean; sseEndpoint: string };
  channel: { channelId: string; channelSecretConfigured: boolean; webhookPath: string; basicId?: string; friendUrl?: string; friendAddUrl?: string };
};

export default function DevPage() {
  const [info, setInfo] = useState<DevInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [wbReq, setWbReq] = useState<unknown>();
  const [wbRes, setWbRes] = useState<unknown>();
  const [wbStatus, setWbStatus] = useState<string>("");
  const [logs, setLogs] = useState<Array<{ time: string; level: string; message: string; data?: any }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Debug用の生データ
  const [rawLogs, setRawLogs] = useState<unknown>(null);
  const [rawChannel, setRawChannel] = useState<unknown>(null);
  const [rawAnalytics, setRawAnalytics] = useState<unknown>(null);
  const [rawInsights, setRawInsights] = useState<unknown>(null);
  const [rawDemographics, setRawDemographics] = useState<unknown>(null);
  const [rawDashboard, setRawDashboard] = useState<unknown>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dev/info", { cache: "no-store" });
        if (!res.ok) throw new Error("failed to load dev info");
        setInfo(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "failed to load");
      }
    };
    load();
  }, []);

  // 各種APIデータをロード
  const loadAllDebugData = async () => {
    // Logs
    try {
      const r = await fetch('/api/dev/logs', { cache: 'no-store' });
      const j = await r.json().catch(() => ({ items: [] }));
      setRawLogs(j);
      if (Array.isArray(j.items)) setLogs(j.items);
    } catch (e) {
      console.error('Failed to load logs:', e);
    }

    // Channel settings
    try {
      const r = await fetch('/api/settings/channel', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRawChannel(j);
      }
    } catch (e) {
      console.error('Failed to load channel settings:', e);
    }

    // Analytics
    try {
      const r = await fetch('/api/analytics?days=7', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRawAnalytics(j);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }

    // LINE Insights
    try {
      const r = await fetch('/api/line/insights', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRawInsights(j);
      }
    } catch (e) {
      console.error('Failed to load LINE insights:', e);
    }

    // LINE Demographics
    try {
      const r = await fetch('/api/line/demographics', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRawDemographics(j);
      }
    } catch (e) {
      console.error('Failed to load LINE demographics:', e);
    }

    // Dashboard stats
    try {
      const r = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRawDashboard(j);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      setLogsLoading(true);
      try {
        const r = await fetch('/api/dev/logs', { cache: 'no-store' });
        const j = await r.json().catch(() => ({ items: [] }));
        setRawLogs(j);
        if (Array.isArray(j.items)) setLogs(j.items);
      } finally { setLogsLoading(false); }
    };
    loadLogs();
    loadAllDebugData();

    const es = new EventSource('/api/events');
    es.addEventListener('dev:log', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setLogs((prev) => {
          const next = [...prev, data];
          if (next.length > 200) return next.slice(next.length - 200);
          return next;
        });
      } catch {}
    });
    return () => es.close();
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>開発情報</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500]" />
        </div>
        <p className={`text-base text-gray-700 ${ibmPlexSans.className}`}>
          ランタイム・チャネル・接続状況の確認に。
        </p>
      </header>

      {error && <p className="rounded-xl bg-red-600/10 px-4 py-3 text-sm font-bold text-red-600 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">{error}</p>}

      {info && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
            <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>アプリ</h2>
            <ul className="space-y-2 text-xs font-mono text-gray-700">
              <li>name: <code className="font-bold text-gray-800">{info.app.name}</code></li>
              <li>version: <span className="font-bold text-gray-800">{info.app.version}</span></li>
              <li>node: <span className="font-bold text-gray-800">{info.app.node}</span></li>
              <li>env: <span className="font-bold text-gray-800">{info.app.env}</span></li>
              <li>now: <span className="font-bold text-gray-800">{new Date(info.app.now).toLocaleString()}</span></li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
            <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>ランタイム</h2>
            <ul className="space-y-2 text-xs font-mono text-gray-700">
              <li>databaseConnected: <span className="font-bold text-gray-800">{info.runtime.databaseConnected ? "true" : "false"}</span></li>
              <li>redisConfigured: <span className="font-bold text-gray-800">{info.runtime.redisConfigured ? "true" : "false"}</span></li>
              <li>sseEndpoint: <code className="font-bold text-gray-800">{info.runtime.sseEndpoint}</code></li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
            <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>チャネル</h2>
            <ul className="space-y-2 text-xs font-mono text-gray-700">
              <li>channelId: <code className="font-bold text-gray-800">{info.channel.channelId || "(未設定)"}</code></li>
              <li>channelSecretConfigured: <span className="font-bold text-gray-800">{info.channel.channelSecretConfigured ? "true" : "false"}</span></li>
              <li>webhookPath: <code className="font-bold text-gray-800">{info.channel.webhookPath}</code></li>
              {info.channel.basicId && (
                <li>basicId: <code className="font-bold text-gray-800">@{info.channel.basicId}</code></li>
              )}
              {info.channel.friendAddUrl && (
                <li>friendAddUrl: <a className="font-bold text-[#00B900] underline hover:text-[#00B900]/80" href={info.channel.friendAddUrl} target="_blank" rel="noreferrer">{info.channel.friendAddUrl}</a></li>
              )}
            </ul>
            <p className="mt-4 border-t border-gray-200 pt-3 text-xs font-mono text-gray-700">アクセストークンは保存しません。送信時に自動発行します。</p>
          </section>
          {info.channel.friendAddUrl ? (
            <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
              <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>友だち追加 QR</h2>
              <div className="flex items-start gap-6">
                <img
                  alt="Add friend QR"
                  className="h-40 w-40 rounded-xl bg-white p-2 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(info.channel.friendAddUrl)}`}
                />
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-mono text-gray-700">QR をスキャン、または下のリンクから友だち追加できます。</p>
                  <a className="block text-xs font-bold text-[#00B900] underline hover:text-[#00B900]/80" href={info.channel.friendAddUrl} target="_blank" rel="noreferrer">{info.channel.friendAddUrl}</a>
                  <div>
                    <button
                      className="rounded-xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9]"
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(info.channel.friendAddUrl!); } catch {}
                      }}
                    >リンクをコピー</button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
              <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>友だち追加 QR</h2>
              <p className="text-xs font-mono text-gray-700">設定でベーシックIDまたは友だち追加URLを入力するとQRを表示できます。</p>
            </section>
          )}
          <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
            <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>Webhook チェック</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
              <input
                placeholder="公開URL（https://xxxx.trycloudflare.com または 完全URL /api/line/webhook まで）"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                className="rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00B900]/30"
              />
              <button
                className="rounded-xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9]"
                onClick={async () => {
                  const payload = { mode: 'local' } as const;
                  setWbReq(payload);
                  const res = await fetch('/api/dev/webhook/selftest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  const data = await res.json().catch(() => ({}));
                  setWbRes(data);
                  setWbStatus(typeof data.status === 'number' ? String(data.status) : (data.error ? `ERR: ${data.error}` : ''));
                }}
              >ローカルに送る</button>
              <button
                className="rounded-xl bg-[#00B900] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!publicUrl}
                onClick={async () => {
                  const payload = { mode: 'public', publicUrl } as const;
                  setWbReq(payload);
                  const res = await fetch('/api/dev/webhook/selftest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  const data = await res.json().catch(() => ({}));
                  setWbRes(data);
                  setWbStatus(typeof data.status === 'number' ? String(data.status) : (data.error ? `ERR: ${data.error}` : ''));
                }}
              >公開URLに送る</button>
            </div>
            <p className="mt-3 text-xs font-mono text-gray-700">ローカルは内部HTTPへの自己呼び出し、公開URLはトンネル経由の疎通を確認します。</p>
            {wbStatus && (
              <p className="mt-2 rounded-xl bg-[#e8f5e9] px-3 py-2 text-xs font-mono text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">結果: {wbStatus}</p>
            )}
          </section>
          <div className="md:col-span-2">
            <DebugPanel
              title="/api/dev/info (raw)"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dev/info`, method: 'GET' })}
              response={info}
            />
          </div>
          <div className="md:col-span-2">
            <DebugPanel
              title="Webhook Selftest"
              request={wbReq}
              curl={wbReq ? toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dev/webhook/selftest`, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: wbReq }) : undefined}
              response={wbRes}
            />
          </div>
          <section className="rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>開発ログ（Webhook）</h2>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9]"
                  onClick={async () => {
                    setLogsLoading(true);
                    try {
                      const r = await fetch('/api/dev/logs', { cache: 'no-store' });
                      const j = await r.json().catch(() => ({ items: [] }));
                      setRawLogs(j);
                      if (Array.isArray(j.items)) setLogs(j.items);
                    } finally { setLogsLoading(false); }
                  }}
                >再読込</button>
                <button
                  className="rounded-xl bg-[#00B900] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5"
                  onClick={async () => {
                    await fetch('/api/dev/logs', { method: 'DELETE' });
                    setLogs([]);
                    setRawLogs({ items: [] });
                  }}
                >クリア</button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto rounded-xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="border-b border-gray-200 bg-[#e8f5e9]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-800">時刻</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-800">レベル</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-800">メッセージ</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-800">データ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, idx) => (
                    <tr key={`${l.time}-${idx}`} className="border-t border-gray-200 transition-all duration-300 hover:bg-[#e8f5e9]">
                      <td className="px-4 py-2 font-mono text-gray-700">{new Date(l.time).toLocaleString()}</td>
                      <td className="px-4 py-2 font-bold text-gray-800">{l.level}</td>
                      <td className="px-4 py-2 font-mono text-gray-800">{l.message}</td>
                      <td className="px-4 py-2 text-[10px] font-mono text-gray-700"><pre className="whitespace-pre-wrap">{l.data ? JSON.stringify(l.data) : ''}</pre></td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center font-mono text-gray-400">{logsLoading ? '読み込み中...' : 'ログはありません'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:col-span-2">
            <h2 className={`mb-4 text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>権限・運用ヒント</h2>
            <ul className="list-disc space-y-2 pl-5 text-xs font-mono text-gray-700">
              <li>followers/ids API はアカウント種別・プランにより利用できない場合があります（403）。Webhook 取り込みで代替可能です。</li>
              <li>Webhook は https の公開URLが必要（例: Cloudflare Tunnel）。再起動でURLが変わる場合はLINE側URLも更新します。</li>
              <li>署名検証はチャネルシークレットを使用。不一致だと 400 になるため、設定の値と LINE Developers の値を必ず一致させてください。</li>
            </ul>
          </section>

          {/* API デバッグ */}
          <section className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h2 className={`text-xs font-bold uppercase tracking-wider text-gray-800 ${ibmPlexSans.className}`}>API デバッグ</h2>
              <button
                className="rounded-xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f5e9]"
                onClick={loadAllDebugData}
              >
                全て再読込
              </button>
            </div>
            <DebugPanel
              title="/api/dev/logs"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dev/logs`, method: 'GET' })}
              response={rawLogs}
            />
            <DebugPanel
              title="/api/settings/channel"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/settings/channel`, method: 'GET' })}
              response={rawChannel}
            />
            <DebugPanel
              title="/api/analytics?days=7"
              request={{ days: 7 }}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/analytics?days=7`, method: 'GET' })}
              response={rawAnalytics}
            />
            <DebugPanel
              title="/api/line/insights"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/insights`, method: 'GET' })}
              response={rawInsights}
              docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-insight"
            />
            <DebugPanel
              title="/api/line/demographics"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/demographics`, method: 'GET' })}
              response={rawDemographics}
              docsUrl="https://developers.line.biz/ja/reference/messaging-api/#get-demographic"
            />
            <DebugPanel
              title="/api/dashboard/stats"
              request={{}}
              curl={toCurl({ url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/dashboard/stats`, method: 'GET' })}
              response={rawDashboard}
            />
          </section>
        </div>
      )}
    </div>
  );
}
