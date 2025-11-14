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
      <header className="space-y-3 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">メッセージアイテム送信</h1>
        <p className="text-sm text-black/60">リッチメッセージ（イメージマップ）とカードタイプメッセージ（カルーセル）を送信できます。</p>
        <nav className="mt-4 flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
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
