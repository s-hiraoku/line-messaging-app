"use client";

import { useEffect, useState } from "react";
import { DebugPanel } from "../_components/debug-panel";

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
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">開発情報</h1>
        <p className="text-sm text-slate-500">ランタイム・チャネル・接続状況の確認に。</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {info && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-300">アプリ</h2>
            <ul className="text-sm text-slate-200">
              <li>name: <code className="text-xs">{info.app.name}</code></li>
              <li>version: {info.app.version}</li>
              <li>node: {info.app.node}</li>
              <li>env: {info.app.env}</li>
              <li>now: {new Date(info.app.now).toLocaleString()}</li>
            </ul>
          </section>

          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-300">ランタイム</h2>
            <ul className="text-sm text-slate-200">
              <li>databaseConnected: {info.runtime.databaseConnected ? "true" : "false"}</li>
              <li>redisConfigured: {info.runtime.redisConfigured ? "true" : "false"}</li>
              <li>sseEndpoint: <code className="text-xs">{info.runtime.sseEndpoint}</code></li>
            </ul>
          </section>

          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-300">チャネル</h2>
            <ul className="text-sm text-slate-200">
              <li>channelId: <code className="text-xs">{info.channel.channelId || "(未設定)"}</code></li>
              <li>channelSecretConfigured: {info.channel.channelSecretConfigured ? "true" : "false"}</li>
              <li>webhookPath: <code className="text-xs">{info.channel.webhookPath}</code></li>
              {info.channel.basicId && (
                <li>basicId: <code className="text-xs">@{info.channel.basicId}</code></li>
              )}
              {info.channel.friendAddUrl && (
                <li>friendAddUrl: <a className="text-blue-300 underline cursor-pointer" href={info.channel.friendAddUrl} target="_blank" rel="noreferrer">{info.channel.friendAddUrl}</a></li>
              )}
            </ul>
            <p className="mt-2 text-xs text-slate-500">アクセストークンは保存しません。送信時に自動発行します。</p>
          </section>
          {info.channel.friendAddUrl ? (
            <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
              <h2 className="mb-2 text-sm font-semibold text-slate-300">友だち追加 QR</h2>
              <div className="flex items-start gap-4">
                <img
                  alt="Add friend QR"
                  className="h-40 w-40 rounded-lg border border-slate-800 bg-white p-2"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(info.channel.friendAddUrl)}`}
                />
                <div className="space-y-2 text-sm text-slate-200">
                  <p>QR をスキャン、または下のリンクから友だち追加できます。</p>
                  <a className="text-blue-300 underline cursor-pointer" href={info.channel.friendAddUrl} target="_blank" rel="noreferrer">{info.channel.friendAddUrl}</a>
                  <div>
                    <button
                      className="mt-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500 cursor-pointer"
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(info.channel.friendAddUrl!); } catch {}
                      }}
                    >リンクをコピー</button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
              <h2 className="mb-2 text-sm font-semibold text-slate-300">友だち追加 QR</h2>
              <p className="text-sm text-slate-400">設定でベーシックIDまたは友だち追加URLを入力するとQRを表示できます。</p>
            </section>
          )}
          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-300">Webhook チェック</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
              <input
                placeholder="公開URL（https://xxxx.trycloudflare.com または 完全URL /api/line/webhook まで）"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 cursor-pointer"
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
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90"
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
            <p className="mt-2 text-xs text-slate-500">ローカルは内部HTTPへの自己呼び出し、公開URLはトンネル経由の疎通を確認します。</p>
            {wbStatus && (
              <p className="mt-1 text-xs text-slate-300">結果: {wbStatus}</p>
            )}
          </section>
          <div className="md:col-span-2">
            <DebugPanel title="/api/dev/info (raw)" response={info} />
          </div>
          <div className="md:col-span-2">
            <DebugPanel title="Webhook Selftest" request={wbReq} response={wbRes} />
          </div>
          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">開発ログ（Webhook）</h2>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500"
                  onClick={async () => {
                    setLogsLoading(true);
                    try {
                      const r = await fetch('/api/dev/logs', { cache: 'no-store' });
                      const j = await r.json().catch(() => ({ items: [] }));
                      if (Array.isArray(j.items)) setLogs(j.items);
                    } finally { setLogsLoading(false); }
                  }}
                >再読込</button>
                <button
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90"
                  onClick={async () => { await fetch('/api/dev/logs', { method: 'DELETE' }); setLogs([]); }}
                >クリア</button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-800/60 text-slate-300">
                  <tr>
                    <th className="px-3 py-2">時刻</th>
                    <th className="px-3 py-2">レベル</th>
                    <th className="px-3 py-2">メッセージ</th>
                    <th className="px-3 py-2">データ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, idx) => (
                    <tr key={`${l.time}-${idx}`} className="border-t border-slate-800">
                      <td className="px-3 py-1 text-slate-400">{new Date(l.time).toLocaleString()}</td>
                      <td className="px-3 py-1">{l.level}</td>
                      <td className="px-3 py-1">{l.message}</td>
                      <td className="px-3 py-1 text-[10px] text-slate-300"><pre className="whitespace-pre-wrap">{l.data ? JSON.stringify(l.data) : ''}</pre></td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">{logsLoading ? '読み込み中...' : 'ログはありません'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-300">権限・運用ヒント</h2>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
              <li>followers/ids API はアカウント種別・プランにより利用できない場合があります（403）。Webhook 取り込みで代替可能です。</li>
              <li>Webhook は https の公開URLが必要（例: Cloudflare Tunnel）。再起動でURLが変わる場合はLINE側URLも更新します。</li>
              <li>署名検証はチャネルシークレットを使用。不一致だと 400 になるため、設定の値と LINE Developers の値を必ず一致させてください。</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
