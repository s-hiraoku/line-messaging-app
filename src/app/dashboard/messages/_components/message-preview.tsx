"use client";

import clsx from "clsx";

type Base = { direction?: "outbound" | "inbound"; variant?: 'line' | 'simple' };

type TextMsg = Base & { type: "text"; text: string };
type ImageMsg = Base & { type: "image"; originalContentUrl: string; previewImageUrl?: string };

type Props = (TextMsg | ImageMsg) & { title?: string };

export function MessagePreview(props: Props) {
  const dir = props.direction ?? "outbound";
  const isOut = dir === "outbound";
  const variant = props.variant ?? 'line';

  const bubble = () => {
    if (props.type === 'text') {
      if (variant === 'line') {
        return (
          <div className={clsx(
            'relative max-w-[72%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow',
            isOut ? 'bg-[#06C755] text-white rounded-br-sm' : 'bg-white text-slate-900 rounded-bl-sm'
          )}>
            {props.text || <span className="text-slate-400">（テキストを入力するとプレビューされます）</span>}
          </div>
        );
      }
      return (
        <div className={clsx(
          'max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow border',
          isOut ? 'bg-emerald-600/20 text-emerald-100 border-emerald-500/30' : 'bg-slate-800/70 text-slate-100 border-slate-700'
        )}>
          {props.text || <span className="text-slate-500">（テキストを入力するとプレビューされます）</span>}
        </div>
      );
    }
    // image
    if (variant === 'line') {
      return (
        <div className={clsx('relative max-w-[72%] overflow-hidden rounded-2xl shadow border', isOut ? 'border-[#06C755] bg-black' : 'border-slate-300 bg-black')}>
          {props.originalContentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.previewImageUrl || props.originalContentUrl} alt="image preview" className="max-h-64 w-full object-contain" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-slate-900 text-xs text-slate-500">（画像URLを入力/アップロードするとプレビューされます）</div>
          )}
        </div>
      );
    }
    return (
      <div className={clsx('max-w-[70%] overflow-hidden rounded-2xl border shadow', isOut ? 'border-emerald-500/30' : 'border-slate-700')}>
        {props.originalContentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.previewImageUrl || props.originalContentUrl} alt="image preview" className="max-h-64 w-full object-contain bg-black" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-slate-900 text-xs text-slate-500">（画像URLを入力/アップロードするとプレビューされます）</div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-300">{props.title ?? 'プレビュー（LINE風）'}</p>
        <span className="text-[10px] text-slate-500">{isOut ? '送信側' : '受信側'}</span>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
        <div className={clsx('flex w-full gap-2 items-end', isOut ? 'justify-end' : 'justify-start')}>{bubble()}</div>
      </div>
    </div>
  );
}
