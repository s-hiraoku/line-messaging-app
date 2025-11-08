"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

const channelSteps = [
  "LINE Developers → 対象プロバイダ →『Messaging API』チャネルを作成/選択します（Login ではなく Messaging API）。",
  "基本設定の『チャネルID』『チャネルシークレット』を確認します。",
  "本画面『チャネル情報の保存』で ID / シークレットを入力して保存します（以降、アプリは DB の値を使用）。",
  "（任意）友だち追加URL または ベーシックID を登録すると、Dev 画面で QR とリンクを生成できます。",
];

const channelNotes = [
  "チャネルシークレットは Webhook 署名検証に使用します。管理・共有に注意してください。",
  "アクセストークンは保存しません。送信時にチャネルID/シークレットから自動発行（client_credentials）します。",
];

const webhookSteps = [
  "（ローカルの場合）Cloudflare Tunnel で公開URLを用意します: `cloudflared tunnel --url http://localhost:3000`",
  "公開URL（例: https://xxxx.trycloudflare.com）に `/api/line/webhook` を付けた値を LINE Developers の Webhook URL に設定します。",
  "LINE Developers の『Webhookを利用する』をオンにして『検証』を実行（200 ならOK）。",
  "本アプリの Dev 画面『Webhook チェック』でもローカル/公開URLの両方で 200 を確認できます。",
];

const webhookNotes = [
  "署名検証は本画面で保存した『チャネルシークレット』を使用します。不一致だと 400（Invalid LINE signature）。",
  "Cloudflare URLを公開欄に『ドメインのみ』入れた場合は `/api/line/webhook` を忘れずに。完全URLを入れても動作します。",
  "URLが 2 重（.../api/line/webhook/api/line/webhook）になると 404 になります。Dev 画面の Selftest を使うと簡単に確認できます。",
  "Webhook が長時間 4xx/5xx を返し続けると無効化される場合があります。基本は即時 200 を返し、処理は非同期化を検討してください。",
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
  const [basicId, setBasicId] = useState("");
  const [friendUrl, setFriendUrl] = useState("");
  // アクセストークンは自動発行のため、設定フラグは不要
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/settings/channel", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("チャネル設定の取得に失敗しました");
        }
        const data: { channelId?: string; channelSecretConfigured?: boolean; basicId?: string; friendUrl?: string } = await response.json();
        setChannelId(data.channelId ?? "");
        setSecretConfigured(Boolean(data.channelSecretConfigured));
        setBasicId(data.basicId ?? "");
        setFriendUrl(data.friendUrl ?? "");
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
      const payload: { channelId: string; channelSecret?: string; basicId?: string; friendUrl?: string } = {
        channelId: channelId.trim(),
      };
      if (channelSecret.trim()) payload.channelSecret = channelSecret.trim();
      if (basicId.trim()) payload.basicId = basicId.trim();
      if (friendUrl.trim()) payload.friendUrl = friendUrl.trim();

      const response = await fetch("/api/settings/channel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        channelId?: string;
        channelSecretConfigured?: boolean;
        basicId?: string;
        friendUrl?: string;
        error?: string;
      } | null;

      if (!response.ok) throw new Error(data?.error ?? "チャネル情報の保存に失敗しました");

      setChannelId(data?.channelId ?? "");
      setSecretConfigured(Boolean(data?.channelSecretConfigured));
      setBasicId(data?.basicId ?? "");
      setFriendUrl(data?.friendUrl ?? "");
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

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-300">
                <span>ベーシックID（任意）</span>
                <input
                  type="text"
                  value={basicId}
                  onChange={(e) => setBasicId(e.target.value)}
                  placeholder="@your_basic_id（@は含めずに入力）"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                  disabled={isBusy}
                />
                <span className="block text-xs text-slate-500">友だち追加リンク生成に利用します。</span>
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>友だち追加URL（任意・既存の短縮URLなど）</span>
                <input
                  type="url"
                  value={friendUrl}
                  onChange={(e) => setFriendUrl(e.target.value)}
                  placeholder="https://lin.ee/xxxxxx"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                  disabled={isBusy}
                />
                <span className="block text-xs text-slate-500">LINE Developers/公式アカウントマネージャーで発行したURLがあれば入力。</span>
              </label>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-400"> 
              <p className="mb-1 font-semibold text-slate-200">実装メモ</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>チャネルアクセストークンの手動入力は不要です。本アプリがチャネルID/シークレットから自動発行します。</li>
                <li>トークンはメモリキャッシュされ、期限が近づくと自動で再取得されます。</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:text-white/90"
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
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="mb-1 text-xs font-semibold text-slate-300">推奨 Webhook URL 形式</p>
              <code className="block overflow-x-auto rounded bg-slate-950 px-3 py-2 text-[11px] text-slate-200">https://&lt;あなたの公開URL&gt;/api/line/webhook</code>
              <p className="mt-1 text-[11px] text-slate-400">例: https://xxxx-xxxx.trycloudflare.com/api/line/webhook</p>
              <p className="mt-2 text-[11px] text-slate-400">Dev 画面の「Webhook チェック」でローカル/公開URLの疎通（200）も確認できます。</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
