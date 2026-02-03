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
      <header className="space-y-3 rounded-2xl bg-white/70 p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-800">メッセージ</h1>
        <p className="text-sm text-gray-600">メッセージタイプごとに送信を検証できます。</p>
        <nav className="mt-4 flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = pathname === t.href;
            if (!t.enabled) {
              return (
                <span
                  key={t.href}
                  className={clsx(
                    "cursor-not-allowed rounded-xl bg-white/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
                    "text-gray-400"
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
                  "rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  active
                    ? "bg-[#00B900] text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,185,0,0.3)]"
                    : "bg-white/80 text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_6px_16px_rgba(0,0,0,0.1)]"
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
