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
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">メッセージアイテム送信</h1>
        <p className="text-sm text-slate-400">リッチメッセージ（イメージマップ）とカードタイプメッセージ（カルーセル）を送信できます。</p>
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
