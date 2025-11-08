"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  {
    name: "テキスト",
    href: "/dashboard/messages",
  },
  {
    name: "位置情報",
    href: "/dashboard/messages/location",
  },
];

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">メッセージ送信</h1>
        <p className="text-sm text-slate-400">
          LINE ユーザーに様々な形式のメッセージを送信できます。
        </p>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-700/50">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
