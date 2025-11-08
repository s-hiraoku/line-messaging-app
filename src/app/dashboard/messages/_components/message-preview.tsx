"use client";

import clsx from "clsx";

type Base = { direction?: "outbound" | "inbound" };

type TextMsg = Base & { type: "text"; text: string };
type ImageMsg = Base & { type: "image"; originalContentUrl: string; previewImageUrl?: string };

type Props = (TextMsg | ImageMsg) & { title?: string };

export function MessagePreview(props: Props) {
  const dir = props.direction ?? "outbound";
  const isOut = dir === "outbound";

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-300">{props.title ?? "プレビュー"}</p>
        <span className="text-[10px] text-slate-500">{isOut ? "送信側" : "受信側"}</span>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
        <div className={clsx("flex w-full gap-2", isOut ? "justify-start" : "justify-end")}> 
          {props.type === "text" ? (
            <div
              className={clsx(
                "max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow",
                isOut
                  ? "rounded-bl-sm bg-emerald-600/20 text-emerald-100 border border-emerald-500/30"
                  : "rounded-br-sm bg-slate-800/70 text-slate-100 border border-slate-700"
              )}
            >
              {props.text || <span className="text-slate-500">（テキストを入力するとプレビューされます）</span>}
            </div>
          ) : (
            <div
              className={clsx(
                "max-w-[70%] overflow-hidden rounded-2xl border shadow",
                isOut ? "border-emerald-500/30" : "border-slate-700"
              )}
            >
              {props.originalContentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={props.previewImageUrl || props.originalContentUrl}
                  alt="image preview"
                  className="max-h-64 w-full object-contain bg-black"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-900 text-xs text-slate-500">
                  （画像URLを入力/アップロードするとプレビューされます）
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
