"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const messageTabs = [
  { href: "/dashboard/messages", label: "テキスト", exact: true },
  { href: "/dashboard/messages/sticker", label: "スタンプ" },
  { href: "/dashboard/messages/audio", label: "音声" },
  { href: "/dashboard/messages/video", label: "動画" },
];

function MessagesNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-slate-700/50 pb-4">
      {messageTabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <MessagesNav />
      {children}
    </div>
  );
}
