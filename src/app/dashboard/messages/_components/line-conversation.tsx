"use client";

import clsx from "clsx";

type Dir = "inbound" | "outbound"; // inbound=相手, outbound=自分

type Text = { type: "text"; text: string };
type Image = { type: "image"; originalContentUrl: string; previewImageUrl?: string };

type Props = {
  direction?: Dir;
  displayName?: string;
  avatarUrl?: string | null;
  message: Text | Image;
};

export function LineConversation({ direction = "outbound", displayName = "あなた", avatarUrl = null, message }: Props) {
  const isMe = direction === "outbound";

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/80 shadow">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 text-xs text-slate-200">
        <div className="flex items-center gap-2"><span>▼</span><span>プレビュー</span></div>
        <div className="flex items-center gap-3"><span className="opacity-60">?</span><span className="opacity-60">⇩</span></div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 text-xs">
        <div className="w-1/2 border-r border-slate-800 px-4 py-2 text-center text-slate-300">トークルーム</div>
        <div className="w-1/2 px-4 py-2 text-center text-[#06C755]">トークリスト</div>
      </div>
      {/* Chat area */}
      <div className="h-96 bg-[linear-gradient(180deg,#99b4d6_0%,#8eabd0_100%)]">
        <div className="p-3">
          {/* Row */}
          <div className={clsx("mb-3 flex w-full items-end gap-2", isMe ? "justify-end" : "justify-start")}> 
            {/* Avatar */}
            {!isMe && (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-300 text-[10px] text-slate-700">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
            )}
            <div className="max-w-[80%]">
              {!isMe && (
                <p className="mb-1 text-[11px] font-semibold text-white drop-shadow">{displayName}</p>
              )}
              {message.type === "text" ? (
                <div className={clsx(
                  "relative inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  isMe ? "bg-[#06C755] text-white rounded-br-sm" : "bg-white text-slate-900 rounded-bl-sm"
                )}>
                  {message.text || <span className="text-slate-400">（テキスト未入力）</span>}
                </div>
              ) : (
                <div className={clsx(
                  "relative inline-block overflow-hidden rounded-2xl border",
                  isMe ? "border-[#06C755]" : "border-slate-300"
                )}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={message.previewImageUrl || message.originalContentUrl} alt="image" className="max-h-64 w-full object-contain bg-black" />
                </div>
              )}
            </div>
            {isMe && (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-300 text-[10px] text-slate-700">
                <span>👤</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

