"use client";

import { useEffect, useState } from "react";
import { DebugPanel } from "../_components/debug-panel";

type DevInfo = {
  app: { name: string; version: string; node: string; env: string; now: string };
  runtime: { databaseConnected: boolean; redisConfigured: boolean; sseEndpoint: string };
  channel: { channelId: string; channelSecretConfigured: boolean; webhookPath: string };
};

export default function DevPage() {
  const [info, setInfo] = useState<DevInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            </ul>
            <p className="mt-2 text-xs text-slate-500">アクセストークンは保存しません。送信時に自動発行します。</p>
          </section>
          <div className="md:col-span-2">
            <DebugPanel title="/api/dev/info (raw)" response={info} />
          </div>
        </div>
      )}
    </div>
  );
}
