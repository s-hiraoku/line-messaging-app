"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";

type Status = "idle" | "sending" | "success" | "error";

// Popular LINE sticker packages
const STICKER_PACKAGES = [
  {
    id: "11537",
    name: "Brown & Cony's Big Love Stickers",
    stickers: [
      { id: "52002734", emoji: "😊" },
      { id: "52002735", emoji: "❤️" },
      { id: "52002736", emoji: "👍" },
      { id: "52002737", emoji: "😂" },
      { id: "52002738", emoji: "🎉" },
    ],
  },
  {
    id: "11538",
    name: "Brown & Cony's Cozy Winter Date",
    stickers: [
      { id: "51626494", emoji: "☃️" },
      { id: "51626495", emoji: "⛄" },
      { id: "51626496", emoji: "🎄" },
      { id: "51626497", emoji: "🎅" },
      { id: "51626498", emoji: "🎁" },
    ],
  },
  {
    id: "11539",
    name: "Cony's Happy Work Life",
    stickers: [
      { id: "52114110", emoji: "💼" },
      { id: "52114111", emoji: "📱" },
      { id: "52114112", emoji: "☕" },
      { id: "52114113", emoji: "📝" },
      { id: "52114114", emoji: "✨" },
    ],
  },
];

export default function StickerMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [stickerId, setStickerId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = STICKER_PACKAGES.find((pkg) => pkg.id === packageId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: lineUserId,
          type: "sticker",
          packageId,
          stickerId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "スタンプの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">スタンプメッセージ送信</h1>
        <p className="text-sm text-slate-400">
          LINE の公式スタンプを選択してユーザーに送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-300">
            LINE ユーザー ID <span className="text-red-400">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-300">
            スタンプパッケージ <span className="text-red-400">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STICKER_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setPackageId(pkg.id);
                  setStickerId("");
                }}
                className={`rounded-lg border p-4 text-left transition ${
                  packageId === pkg.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 bg-slate-900/40 hover:border-slate-500"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">{pkg.name}</div>
                  <div className="text-xs text-slate-400">Package ID: {pkg.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedPackage && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300">
              スタンプを選択 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
              {selectedPackage.stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => setStickerId(sticker.id)}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-3xl transition ${
                    stickerId === sticker.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/60"
                  }`}
                  title={`Sticker ID: ${sticker.id}`}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
            {stickerId && (
              <div className="text-xs text-slate-400">
                選択中: Sticker ID {stickerId}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !packageId || !stickerId}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">スタンプを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview Section */}
      {packageId && stickerId && (
        <LineConversation
          message={{
            type: "sticker",
            packageId,
            stickerId,
            emoji: selectedPackage?.stickers.find((s) => s.id === stickerId)?.emoji,
          }}
        />
      )}

      {/* Debug Panel */}
      {packageId && stickerId && (
        <details className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 shadow-lg backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-medium text-slate-300">
            デバッグ情報
          </summary>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">cURL</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {`curl -X POST https://api.line.me/v2/bot/message/push \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}' \\
  -d '{
  "to": "${lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}",
  "messages": [
    {
      "type": "sticker",
      "packageId": "${packageId}",
      "stickerId": "${stickerId}"
    }
  ]
}'`}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Request Body</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {JSON.stringify(
                  {
                    to: lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    type: "sticker",
                    packageId,
                    stickerId,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
