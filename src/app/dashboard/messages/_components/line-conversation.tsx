"use client";

import clsx from "clsx";
import { useState } from "react";

type Dir = "inbound" | "outbound"; // inbound=相手, outbound=自分

type Text = { type: "text"; text: string };
type Image = { type: "image"; originalContentUrl: string; previewImageUrl?: string };
type Video = { type: "video"; videoUrl: string; previewUrl: string };
type Audio = { type: "audio"; audioUrl: string; duration: number };
type Location = { type: "location"; title: string; address: string; latitude: number; longitude: number };
type Sticker = { type: "sticker"; packageId: string; stickerId: string; emoji?: string };
type Template = { type: "template"; altText: string; title?: string; text: string; thumbnailImageUrl?: string; actions: any[] };

type Props = {
  direction?: Dir;
  displayName?: string;
  avatarUrl?: string | null;
  message: Text | Image | Video | Audio | Location | Sticker | Template;
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
              ) : message.type === "image" ? (
                (() => {
                  const src = (message.previewImageUrl || message.originalContentUrl || '').trim();
                  if (!src) return null;
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
              ) : message.type === "video" ? (
                <div className="relative inline-block overflow-hidden rounded-2xl bg-white shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={message.previewUrl} alt="Video preview" className="h-48 w-64 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                      <svg className="h-8 w-8 text-[#06C755]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : message.type === "audio" ? (
                <div className={clsx(
                  "inline-block rounded-2xl px-4 py-3 shadow-md",
                  isMe ? "bg-[#06C755] text-white rounded-br-sm" : "bg-white text-slate-900 rounded-bl-sm"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isMe ? "bg-white/20" : "bg-[#06C755]/20"
                    )}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs opacity-80">音声メッセージ</div>
                      <div className="text-sm font-medium">{(message.duration / 1000).toFixed(1)}秒</div>
                    </div>
                  </div>
                </div>
              ) : message.type === "location" ? (
                <div className="inline-block overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="relative h-48 w-64 bg-slate-700">
                    <iframe
                      src={`https://maps.google.com/maps?q=${message.latitude},${message.longitude}&z=15&output=embed`}
                      className="h-full w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                  <div className="bg-white p-3 text-slate-900">
                    <div className="font-medium text-sm">{message.title}</div>
                    <div className="text-xs text-slate-600">{message.address}</div>
                  </div>
                </div>
              ) : message.type === "sticker" ? (
                <div className={clsx(
                  "inline-block rounded-2xl px-4 py-3 shadow-md",
                  isMe ? "bg-[#06C755] text-white rounded-br-sm" : "bg-white text-slate-900 rounded-bl-sm"
                )}>
                  <div className="flex items-center justify-center text-6xl">
                    {message.emoji || "🎉"}
                  </div>
                </div>
              ) : message.type === "template" ? (
                <div className="inline-block overflow-hidden rounded-2xl bg-white shadow-md max-w-xs">
                  {message.thumbnailImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={message.thumbnailImageUrl} alt={message.title || "Thumbnail"} className="h-48 w-full object-cover" />
                  )}
                  <div className="p-4">
                    {message.title && <div className="mb-2 font-semibold text-slate-900">{message.title}</div>}
                    <div className="mb-3 text-sm text-slate-700">{message.text}</div>
                    <div className="space-y-2">
                      {message.actions.map((action, index) => (
                        <button key={index} className="w-full rounded border border-blue-500 bg-white py-2 text-sm font-medium text-blue-500" type="button">
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
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
              <p className="truncate text-[12px] text-slate-500">
                {message.type === 'text'
                  ? (message.text || '（テキスト未入力）')
                  : message.type === 'image'
                  ? '画像が送信されます'
                  : message.type === 'video'
                  ? '動画が送信されます'
                  : message.type === 'audio'
                  ? '音声メッセージが送信されます'
                  : message.type === 'location'
                  ? '位置情報が送信されます'
                  : message.type === 'sticker'
                  ? 'スタンプが送信されます'
                  : message.type === 'template'
                  ? 'テンプレートメッセージが送信されます'
                  : 'メッセージが送信されます'}
              </p>
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
