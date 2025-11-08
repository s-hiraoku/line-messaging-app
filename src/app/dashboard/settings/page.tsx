"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

const channelSteps = [
  "LINE Developers で Messaging API チャネルを作成し、チャネル ID / シークレットを控えます。",
  "本画面でチャネル情報を保存し、バックエンドから参照できるようにします。",
  "インフラ側の環境変数 (LINE_CHANNEL_ID / LINE_CHANNEL_SECRET) も最新の値に更新します。",
];

const channelNotes = [
  "チャネルシークレットは署名検証で使用するため、不要な共有は避けてください。",
  "アクセストークンは別途ローテーションポリシーを設け、再発行時には本画面からシークレットも更新してください。",
];

const webhookSteps = [
  "公開 HTTPS 環境にアプリをデプロイし、`/api/line/webhook` を外部公開します。",
  "LINE Developers の Webhook 設定に公開 URL を登録し、「LINE Developers からの Webhook」をオンにします。",
  "コンソールの「検証」ボタンで疎通確認を行い、成功ステータスであることを確認します。",
];

const webhookNotes = [
  "署名検証には LINE_CHANNEL_SECRET が必要です。環境変数と保存済みの値を常に一致させてください。",
  "Webhook がエラー応答を返し続けると自動的に無効化される場合があるため、200 OK を返す実装にしておきましょう。",
];

const webhookUrlHint = "https://your-domain.example/api/line/webhook";

type FetchState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [channelId, setChannelId] = useState("");
  const [channelSecret, setChannelSecret] = useState("");
  const [secretConfigured, setSecretConfigured] = useState(false);
  // アクセストークンは自動発行のため、設定フラグは不要
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/settings/channel", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("チャネル設定の取得に失敗しました");
        }
        const data: { channelId?: string; channelSecretConfigured?: boolean } = await response.json();
        setChannelId(data.channelId ?? "");
        setSecretConfigured(Boolean(data.channelSecretConfigured));
        setFetchState("ready");
      } catch (error) {
        console.error("Failed to load channel config", error);
        setMessage("チャネル設定を取得できませんでした。ページを再読み込みしてください。");
        setFetchState("error");
      }
    };

    load();
  }, []);

  const isBusy = useMemo(
    () => fetchState !== "ready" || saveState === "saving",
    [fetchState, saveState],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fetchState !== "ready") return;

    setSaveState("saving");
    setMessage(null);

    try {
      const payload: { channelId: string; channelSecret?: string } = {
        channelId: channelId.trim(),
      };
      if (channelSecret.trim()) payload.channelSecret = channelSecret.trim();

      const response = await fetch("/api/settings/channel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        channelId?: string;
        channelSecretConfigured?: boolean;
        error?: string;
      } | null;

      if (!response.ok) throw new Error(data?.error ?? "チャネル情報の保存に失敗しました");

      setChannelId(data?.channelId ?? "");
      setSecretConfigured(Boolean(data?.channelSecretConfigured));
      setChannelSecret("");
      setSaveState("saved");
      setMessage("チャネル情報を保存しました。");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "チャネル情報の保存に失敗しました");
    }
  };

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">チャネル / Webhook 設定</h1>
        <p className="text-sm text-slate-400">
          LINE Developers で取得したチャネル情報を保存し、Webhook 設定のポイントを確認できます。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
              Channel
            </span>
            <h2 className="text-lg font-semibold text-white">チャネル情報の保存</h2>
            <p className="text-xs text-slate-400">
              チャネル ID とシークレットをアプリケーションに保存し、環境変数と整合させます。
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>チャネル ID</span>
              <input
                type="text"
                value={channelId}
                onChange={(event) => setChannelId(event.target.value)}
                placeholder="165xxxxxxxx"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                disabled={isBusy}
                required
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-300">
              <span>チャネルシークレット</span>
              <input
                type="password"
                value={channelSecret}
                onChange={(event) => setChannelSecret(event.target.value)}
                placeholder={secretConfigured ? "更新する場合のみ入力" : "XXXXXXXXXXXXXXXXXXXX"}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                disabled={isBusy}
              />
              <span className="block text-xs text-slate-500">
                {secretConfigured ? "既に登録済みです。更新時のみ入力してください。" : "初回登録時は LINE Developers で発行されたシークレットを入力してください。"}
              </span>
            </label>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-400"> 
              <p className="mb-1 font-semibold text-slate-200">実装メモ</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>チャネルアクセストークンの手動入力は不要です。本アプリがチャネルID/シークレットから自動発行します。</li>
                <li>トークンはメモリキャッシュされ、期限が近づくと自動で再取得されます。</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
            >
              {saveState === "saved" ? "保存しました" : saveState === "saving" ? "保存中..." : "チャネル情報を保存"}
            </button>

            <div className="space-y-2 text-xs">
              {fetchState === "loading" && <p className="text-slate-400">チャネル情報を読み込み中です…</p>}
              {message && (
                <p className={saveState === "error" || fetchState === "error" ? "text-red-400" : "text-emerald-300"}>
                  {message}
                </p>
              )}
            </div>
          </form>

          <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">セットアップ手順</p>
            <ol className="space-y-2">
              {channelSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-semibold text-blue-200">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">実装メモ</p>
            <ul className="list-disc space-y-1 pl-4">
              {channelNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              Webhook
            </span>
            <h2 className="text-lg font-semibold text-white">Webhook 設定のチェックリスト</h2>
            <p className="text-xs text-slate-400">
              公開環境の URL を LINE Developers に登録し、署名検証を通過させるための注意点です。
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">例</p>
            <code className="mt-1 block overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-sm text-emerald-200">
              {webhookUrlHint}
            </code>
          </div>

          <ol className="space-y-3">
            {webhookSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 text-sm text-slate-300"
              >
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-200">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">注意事項</p>
            <ul className="list-disc space-y-1 pl-4">
              {webhookNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
