import type { ReactNode } from "react";

import {
  Activity,
  ChartBarBig,
  MessagesSquare,
  Send,
  Settings2,
  Users2,
} from "lucide-react";

import { NavLink } from "./_components/nav-link";

const primaryNav = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    description: "全体の指標と最新情報",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    href: "/dashboard/messages",
    label: "メッセージ",
    description: "個別チャットの送受信",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    href: "/dashboard/broadcasts",
    label: "配信",
    description: "一斉送信とシナリオ",
    icon: <Send className="h-4 w-4" />,
  },
  {
    href: "/dashboard/users",
    label: "ユーザー",
    description: "友だちとタグ管理",
    icon: <Users2 className="h-4 w-4" />,
  },
  {
    href: "/dashboard/analytics",
    label: "分析",
    description: "配信成果と指標",
    icon: <ChartBarBig className="h-4 w-4" />,
  },
  {
    href: "/dashboard/settings",
    label: "設定",
    description: "チャネル & Webhook",
    icon: <Settings2 className="h-4 w-4" />,
  },
  {
    href: "/dashboard/dev",
    label: "開発",
    description: "ランタイム情報",
    icon: <Activity className="h-4 w-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="relative overflow-hidden border-b border-slate-800/60 bg-slate-950/95 lg:border-r">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
          <div className="relative z-10 flex h-full flex-col gap-6 px-6 pb-10 pt-10">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Line Messaging
              </span>
              <h1 className="text-xl font-semibold text-white">Operations Console</h1>
              <p className="text-xs text-slate-400">
                リアルタイムにメッセージ戦略を最適化するための統合管理基盤。
              </p>
            </div>

            <nav className="flex flex-col gap-3">
              {primaryNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>
        </aside>

        <main className="relative bg-slate-900/60 px-6 py-10 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(15,23,42,0.9))]" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
