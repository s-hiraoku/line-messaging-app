import Link from "next/link";
import { Syne, IBM_Plex_Sans } from "next/font/google";

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

const featureHighlights = [
  {
    title: "メッセージ統合管理",
    description:
      "チャット、ブロードキャスト、テンプレートを一元管理し、運用負荷を軽減。",
    number: "01",
  },
  {
    title: "リアルタイム連携",
    description:
      "Webhook とダッシュボードで最新のユーザー状況や会話ログを即座に把握。",
    number: "02",
  },
  {
    title: "柔軟な拡張性",
    description:
      "LINE Messaging API の各種メッセージタイプに対応するモジュール化された設計。",
    number: "03",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e8f5e9]">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.12] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.15] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[#00B900] opacity-[0.08] blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        {/* Header Badge */}
        <div className="flex items-start justify-between">
          <div
            className="inline-block animate-[slideDown_0.8s_ease-out]"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <span className="inline-block -rotate-2 rounded-2xl bg-[#FFE500] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-900 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.6),0_8px_24px_rgba(255,229,0,0.4)]">
              LINE Messaging Prototype
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Main Title - Takes up more space */}
          <div className="lg:col-span-8">
            <h1
              className={`mb-8 text-6xl font-black leading-[1.1] tracking-tight text-gray-800 sm:text-7xl lg:text-8xl animate-[slideUp_1s_ease-out] ${syne.className}`}
              style={{
                animationDelay: "0.2s",
                animationFillMode: "backwards",
              }}
            >
              <span className="relative ml-2 inline-block">
                <span className="relative z-10 text-[#f3270f] drop-shadow-[0_2px_4px_rgba(243,39,15,0.3)]">Synergy!</span>
                <span className="absolute bottom-2 left-0 z-0 h-4 w-full rounded-full bg-[#2fc5c8]/50 blur-sm" />
              </span>
              <span className="text-[#00B900] drop-shadow-[0_2px_4px_rgba(0,185,0,0.3)]">LINE</span> 開発を
              <span className="relative ml-2 inline-block">
                <span className="relative z-10">限界突破</span>
                <span className="absolute bottom-1 left-0 z-0 h-4 w-full rounded-full bg-[#FF6B9D]/40 blur-sm" />
              </span>
              する
              <br />
              モダン
              <span className="relative mx-3 inline-block rotate-3 rounded-2xl bg-[#FFE500] px-5 py-2 text-5xl text-gray-800 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.6),0_12px_32px_rgba(255,229,0,0.4)] sm:text-6xl lg:text-7xl">
                ダッシュボード
              </span>
            </h1>

            <p
              className={`mb-10 max-w-xl text-lg leading-relaxed text-gray-700 sm:text-xl animate-[fadeIn_1s_ease-out] ${ibmPlexSans.className}`}
              style={{
                animationDelay: "0.4s",
                animationFillMode: "backwards",
              }}
            >
              顧客とのコミュニケーションを最適化するための、
              メッセージ配信・分析・自動化を備えた統合管理ツール
            </p>

            <div
              className="flex flex-wrap gap-6 animate-[slideUp_1s_ease-out]"
              style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}
            >
              {/* Primary CTA - Dashboard */}
              <Link
                href="/dashboard"
                className="group relative overflow-hidden rounded-2xl bg-[#00B900] px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-white shadow-[inset_0_-8px_20px_rgba(0,0,0,0.2),inset_0_4px_12px_rgba(255,255,255,0.3),0_12px_32px_rgba(0,185,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_-8px_20px_rgba(0,0,0,0.2),inset_0_4px_12px_rgba(255,255,255,0.3),0_16px_40px_rgba(0,185,0,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,185,0,0.3)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />
                <div className="relative z-10 flex items-center gap-3">
                  <span>ダッシュボードへ進む</span>
                  <span className="inline-block text-lg transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>

              {/* Secondary CTA - Guide */}
              <Link
                href="/guide"
                className="group relative overflow-hidden rounded-2xl bg-[#FFE500] px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-amber-900 shadow-[inset_0_-8px_20px_rgba(0,0,0,0.1),inset_0_4px_12px_rgba(255,255,255,0.5),0_12px_32px_rgba(255,229,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_-8px_20px_rgba(0,0,0,0.1),inset_0_4px_12px_rgba(255,255,255,0.5),0_16px_40px_rgba(255,229,0,0.5)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.2),0_4px_16px_rgba(255,229,0,0.3)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent" />
                <div className="relative z-10 flex items-center gap-3">
                  <span>使い方を見る</span>
                  <span className="inline-block text-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    📖
                  </span>
                </div>
              </Link>

              {/* Tertiary CTA - Docs (spec summary) */}
              <Link
                href="/design-spec"
                className="group relative overflow-hidden rounded-2xl bg-white px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-gray-700 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_4px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_4px_8px_rgba(255,255,255,0.8),0_12px_32px_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 to-transparent" />
                <div className="relative z-10 flex items-center gap-3">
                  <span>設計仕様</span>
                  <span className="inline-block transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                    ↗
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="absolute -right-20 top-0 h-[500px] w-[500px]">
              {/* Large decorative letter with clay effect */}
              <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#00B900]/20 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.1),inset_0_10px_20px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,185,0,0.2)]" />
              <span
                className={`absolute right-8 top-8 select-none text-[15rem] font-black leading-none text-[#00B900]/30 drop-shadow-[0_4px_8px_rgba(0,185,0,0.2)] animate-[rotateIn_1.2s_ease-out] ${syne.className}`}
                style={{
                  animationDelay: "0.3s",
                  animationFillMode: "backwards",
                }}
              >
                L
              </span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-32">
          <div className="mb-12 flex items-end justify-between border-b-2 border-gray-300/50 pb-4">
            <h2
              className={`text-4xl font-black text-gray-800 sm:text-5xl ${syne.className}`}
            >
              主な機能
            </h2>
            <span className="font-mono text-lg font-bold text-gray-500">
              03 Features
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className="group relative animate-[slideUp_1s_ease-out] rounded-3xl bg-white p-8 shadow-[inset_0_-8px_20px_rgba(0,0,0,0.04),inset_0_4px_12px_rgba(255,255,255,0.8),0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[inset_0_-8px_20px_rgba(0,0,0,0.04),inset_0_4px_12px_rgba(255,255,255,0.8),0_20px_48px_rgba(0,0,0,0.12)]"
                style={{
                  animationDelay: `${0.8 + index * 0.1}s`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Number Badge */}
                <div className="mb-6 inline-block">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00B900] to-[#00A000] font-mono text-xl font-black text-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_16px_rgba(0,185,0,0.3)] transition-all group-hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.3),0_8px_20px_rgba(0,185,0,0.4)]">
                    {feature.number}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className={`mb-4 text-2xl font-bold text-gray-800 ${ibmPlexSans.className}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed text-gray-600 ${ibmPlexSans.className}`}
                >
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-1 w-0 rounded-full bg-gradient-to-r from-[#00B900] to-[#FFE500] shadow-[0_0_12px_rgba(0,185,0,0.5)] transition-all duration-500 group-hover:w-full" />
              </article>
            ))}
          </div>
        </section>

        {/* Footer Accent */}
        <div className="mt-32 flex items-center justify-center gap-6">
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent to-gray-400" />
          <span className="rounded-full bg-white px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-gray-500 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]">
            Built for Communication
          </span>
          <div className="h-1 w-16 rounded-full bg-gradient-to-l from-transparent to-gray-400" />
        </div>
      </div>
    </main>
  );
}
