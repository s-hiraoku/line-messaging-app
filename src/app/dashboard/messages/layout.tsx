"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard/messages/text", label: "テキスト", enabled: true },
  { href: "/dashboard/messages/image", label: "画像", enabled: true },
  { href: "/dashboard/messages/video", label: "動画", enabled: false },
  { href: "/dashboard/messages/audio", label: "音声", enabled: false },
  { href: "/dashboard/messages/location", label: "位置情報", enabled: false },
  { href: "/dashboard/messages/sticker", label: "スタンプ", enabled: false },
  { href: "/dashboard/messages/imagemap", label: "イメージマップ", enabled: false },
  { href: "/dashboard/messages/template", label: "テンプレート", enabled: false },
  { href: "/dashboard/messages/flex", label: "Flex", enabled: false },
  { href: "/dashboard/messages/coupon", label: "クーポン", enabled: false },
];

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">メッセージ</h1>
        <p className="text-sm text-slate-400">メッセージタイプごとに送信を検証できます。</p>
        <nav className="mt-3 flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            if (!t.enabled) {
              return (
                <span
                  key={t.href}
                  className={clsx(
                    "cursor-not-allowed rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs",
                    "text-slate-500"
                  )}
                  title="準備中"
                >
                  {t.label}
                </span>
              );
            }
            return (
              <Link
                key={t.href}
                href={t.href}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  active
                    ? "border-blue-500/60 bg-blue-500/10 text-blue-200"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600"
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
