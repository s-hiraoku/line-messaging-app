"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

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
    <div className="space-y-6">
      <header className="space-y-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">スタンプメッセージ送信</h1>
        <p className="text-sm text-black/60">
          LINE の公式スタンプを選択してユーザーに送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-black">
            LINE ユーザー ID <span className="text-red-600">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-black">
            スタンプパッケージ <span className="text-red-600">*</span>
          </label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STICKER_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setPackageId(pkg.id);
                  setStickerId("");
                }}
                className={`border-2 p-3 text-left transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  packageId === pkg.id
                    ? "border-black bg-black text-white"
                    : "border-black bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold">{pkg.name}</div>
                  <div className="text-xs font-mono">{pkg.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedPackage && (
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-black">
              スタンプを選択 <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {selectedPackage.stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => setStickerId(sticker.id)}
                  className={`flex aspect-square items-center justify-center border-2 text-3xl transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    stickerId === sticker.id
                      ? "border-black bg-black"
                      : "border-black bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                  title={`Sticker ID: ${sticker.id}`}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
            {stickerId && (
              <div className="text-xs font-mono text-black/60">
                選択中: Sticker ID {stickerId}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          disabled={status === "sending" || !lineUserId || !packageId || !stickerId}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && (
          <p className="text-sm font-bold text-[#00B900]">スタンプを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
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
        <DebugPanel
          title="送信 API デバッグ"
          request={{ to: lineUserId, type: "sticker", packageId, stickerId }}
          response={undefined}
          curl={toCurl({
            url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { to: lineUserId, type: "sticker", packageId, stickerId }
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
        />
      )}
    </div>
  );
}
