"use client";

import clsx from "clsx";
import { useState } from "react";

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
  // プレビューは常に左側（受信風）で表示
  const isMe = false;
  const [tab, setTab] = useState<'room' | 'list'>('room');

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/80 shadow">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 text-xs text-slate-200">
        <div className="flex items-center gap-2"><span>▼</span><span>プレビュー</span></div>
        <div className="flex items-center gap-3"><span className="opacity-60">?</span><span className="opacity-60">⇩</span></div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 text-xs">
        <button onClick={()=>setTab('room')} className={clsx("w-1/2 border-r border-slate-800 px-4 py-2 text-center transition", tab==='room' ? 'text-[#06C755] bg-white/5' : 'text-slate-300 hover:text-slate-200')}>トークルーム</button>
        <button onClick={()=>setTab('list')} className={clsx("w-1/2 px-4 py-2 text-center transition", tab==='list' ? 'text-[#06C755] bg-white/5' : 'text-slate-300 hover:text-slate-200')}>トークリスト</button>
      </div>
      {/* Body */}
      {tab === 'room' ? (
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
                (() => {
                  const src = (message.previewImageUrl || message.originalContentUrl || '').trim();
                  if (!src) return null; // 空なら何も表示しない
                  return (
                    <div className={clsx(
                      "relative inline-block overflow-hidden rounded-2xl border",
                      isMe ? "border-[#06C755]" : "border-slate-300"
                    )}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="image" className="max-h-64 w-full object-contain bg-black" />
                    </div>
                  );
                })()
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
      ) : (
      <div className="h-96 bg-white">
        <div className="divide-y divide-slate-200">
          {/* Top item: current user/message */}
          <div className="flex items-start gap-3 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] text-slate-700">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-[13px] font-semibold text-slate-900">{displayName}</p>
                <span className="text-[11px] text-slate-400">3分前</span>
              </div>
              <p className="truncate text-[12px] text-slate-500">{message.type==='text' ? (message.text || '（テキスト未入力）') : '画像が送信されます'}</p>
            </div>
          </div>
          {/* Placeholder items */}
          <div className="flex items-start gap-3 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] text-slate-700"><span>👤</span></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-[13px] font-semibold text-slate-900">ユーザー</p>
                <span className="text-[11px] text-slate-400">20分前</span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="h-2 w-44 rounded bg-slate-200" />
                <div className="h-2 w-56 rounded bg-slate-200" />
                <div className="h-2 w-48 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
