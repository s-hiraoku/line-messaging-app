import type { ReactNode } from "react";
import { Syne, IBM_Plex_Sans } from "next/font/google";

import {
  Activity,
  ChartBarBig,
  MessagesSquare,
  Send,
  Settings2,
  Users2,
  Menu,
  Bot,
  LayoutGrid,
  Home,
} from "lucide-react";

import { NavLink } from "./_components/nav-link";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const primaryNav = [
  {
    href: "/",
    label: "トップページ",
    description: "ホーム画面に戻る",
    icon: <Home className="h-4 w-4" />,
  },
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
    href: "/dashboard/message-items/rich",
    label: "メッセージアイテム",
    description: "リッチ & カード送信",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    href: "/dashboard/auto-reply",
    label: "自動応答",
    description: "キーワード応答ルール",
    icon: <Bot className="h-4 w-4" />,
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
    href: "/dashboard/richmenu",
    label: "リッチメニュー",
    description: "メニュー作成と管理",
    icon: <Menu className="h-4 w-4" />,
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
    href: "/dashboard/webhook-check",
    label: "Webhook診断",
    description: "接続テストと設定確認",
    icon: <Activity className="h-4 w-4" />,
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
    <ToastProvider>
      <ConfirmDialogProvider>
        <div className="min-h-screen bg-[#FFFEF5]">
          <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="relative w-full overflow-x-hidden border-b-4 border-black bg-white lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[320px] lg:overflow-y-auto lg:border-b-0 lg:border-r-4">
              {/* Decorative Background */}
              <div className="pointer-events-none absolute right-0 top-20 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-[#00B900] opacity-[0.08] blur-[100px]" />

              <div className="relative z-10 flex h-full flex-col gap-8 px-8 pb-10 pt-12">
                {/* Header */}
                <div className="space-y-3">
                  <div className="inline-block -rotate-1 border-2 border-black bg-[#FFE500] px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className={`text-xs font-bold uppercase tracking-[0.2em] text-black ${ibmPlexSans.className}`}>
                      LINE Messaging
                    </span>
                  </div>
                  <h1 className={`text-2xl font-black text-black ${syne.className}`}>
                    Operations<br/>Console
                  </h1>
                  <p className={`text-sm leading-relaxed text-black/70 ${ibmPlexSans.className}`}>
                    リアルタイムにメッセージ戦略を最適化する統合管理基盤
                  </p>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                  {primaryNav.slice(0, 10).map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}

                  {/* Separator for Development Tools */}
                  <div className="my-3 flex items-center gap-3">
                    <div className="h-[2px] flex-1 bg-black"></div>
                    <span className={`text-xs font-bold uppercase tracking-wider text-black/40 ${ibmPlexSans.className}`}>
                      開発ツール
                    </span>
                    <div className="h-[2px] flex-1 bg-black"></div>
                  </div>

                  {primaryNav.slice(10).map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="relative flex-1 bg-[#FFFEF5] px-6 py-10 lg:ml-[320px] lg:px-12">
              {/* Decorative Background Elements */}
              <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[#00B900] opacity-[0.06] blur-[120px]" />

              <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
