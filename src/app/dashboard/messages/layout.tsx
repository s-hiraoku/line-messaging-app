"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard/messages/text", label: "テキスト", enabled: true },
  { href: "/dashboard/messages/image", label: "画像", enabled: true },
  { href: "/dashboard/messages/video", label: "動画", enabled: true },
  { href: "/dashboard/messages/audio", label: "音声", enabled: true },
  { href: "/dashboard/messages/location", label: "位置情報", enabled: true },
  { href: "/dashboard/messages/sticker", label: "スタンプ", enabled: true },
  { href: "/dashboard/messages/imagemap", label: "イメージマップ", enabled: true },
  { href: "/dashboard/messages/template", label: "テンプレート", enabled: true },
  { href: "/dashboard/messages/flex", label: "Flex", enabled: true },
  { href: "/dashboard/messages/coupon", label: "クーポン", enabled: true },
];

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <header className="space-y-3 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">メッセージ</h1>
        <p className="text-sm text-black/60">メッセージタイプごとに送信を検証できます。</p>
        <nav className="mt-4 flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = pathname === t.href;
            if (!t.enabled) {
              return (
                <span
                  key={t.href}
                  className={clsx(
                    "cursor-not-allowed border-2 border-black bg-white/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
                    "text-black/40"
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
                  "border-2 border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                  active
                    ? "bg-[#00B900] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
