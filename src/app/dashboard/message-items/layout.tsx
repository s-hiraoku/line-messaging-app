"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard/message-items/rich", label: "リッチメッセージ", enabled: true },
  { href: "/dashboard/message-items/card", label: "カードタイプメッセージ", enabled: true },
];

export default function MessageItemsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <header className="space-y-3 rounded-2xl bg-white/70 p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-800">メッセージアイテム送信</h1>
        <p className="text-sm text-gray-600">リッチメッセージ（イメージマップ）とカードタイプメッセージ（カルーセル）を送信できます。</p>
        <nav className="mt-4 flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            if (!t.enabled) {
              return (
                <span
                  key={t.href}
                  className={clsx(
                    "cursor-not-allowed rounded-xl bg-white/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
                    "text-gray-400 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]"
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
                    : "bg-white/80 text-gray-700 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:bg-[#e8f5e9] hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_16px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[inset_0_-2px_8px_rgba(0,0,0,0.06),inset_0_1px_4px_rgba(255,255,255,0.6),0_2px_8px_rgba(0,0,0,0.04)]"
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
