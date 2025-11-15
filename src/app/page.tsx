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
    <main className="relative min-h-screen overflow-hidden bg-[#FFFEF5]">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.15] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.12] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[#00B900] opacity-[0.08] blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        {/* Header Badge */}
        <div className="flex items-start justify-between">
          <div
            className="inline-block animate-[slideDown_0.8s_ease-out]"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <span className="inline-block -rotate-2 border-2 border-black bg-[#FFE500] px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              LINE Messaging Prototype
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Main Title - Takes up more space */}
          <div className="lg:col-span-8">
            <h1
              className={`mb-8 text-6xl font-black leading-[1.1] tracking-tight text-black sm:text-7xl lg:text-8xl animate-[slideUp_1s_ease-out] ${syne.className}`}
              style={{
                animationDelay: "0.2s",
                animationFillMode: "backwards",
              }}
            >
              <span className="relative ml-2 inline-block">
                <span className="relative z-10  text-[#f3270f]">Synergy!</span>
                <span className="absolute bottom-2 left-0 z-0 h-4 w-full bg-[#2fc5c8]" />
              </span>
              <span className="text-[#00B900]">LINE</span> 開発を
              <span className="relative ml-2 inline-block">
                <span className="relative z-10">限界突破</span>
                <svg
                  className="absolute bottom-0 left-0 z-0 w-full"
                  height="40"
                  viewBox="0 0 200 40"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 28 Q 12.5 18, 25 24 Q 37.5 30, 50 26 Q 62.5 22, 75 24 Q 87.5 26, 100 22 Q 112.5 18, 125 20 Q 137.5 22, 150 18 Q 162.5 14, 175 16 Q 187.5 18, 200 14"
                    stroke="#FF6B9D"
                    strokeWidth="24"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              する
              <br />
              モダン
              <span className="relative mx-3 inline-block rotate-3 border-2 border-black bg-[#FFE500] px-4 py-1 text-5xl sm:text-6xl lg:text-7xl">
                ダッシュボード
              </span>
            </h1>

            <p
              className={`mb-10 max-w-xl text-lg leading-relaxed text-black/80 sm:text-xl animate-[fadeIn_1s_ease-out] ${ibmPlexSans.className}`}
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
                className="group relative overflow-hidden border-[3px] border-black bg-gradient-to-br from-[#00FF00] via-[#00B900] to-[#008F00] px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <div className="relative z-10 flex items-center gap-3">
                  <span>ダッシュボードへ進む</span>
                  <span className="inline-block text-lg transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110">
                    →
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
              </Link>

              {/* Secondary CTA - Guide */}
              <Link
                href="/guide"
                className="group relative overflow-hidden border-[3px] border-black bg-gradient-to-br from-[#FFE500] via-[#FFCF00] to-[#FFB800] px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-3">
                  <span className="relative">使い方を見る</span>
                  <span className="inline-block text-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    📖
                  </span>
                </div>
                <div className="absolute top-0 right-0 h-full w-[2px] bg-black/20" />
              </Link>

              {/* Tertiary CTA - Docs */}
              <Link
                href="/docs/system-design"
                className="group relative overflow-hidden border-[3px] border-black bg-white px-10 py-5 font-mono text-sm font-black uppercase tracking-[0.15em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:bg-[#FFFEF5] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-3">
                  <span className="relative">
                    設計仕様を確認
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
                  </span>
                  <span className="inline-block transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                    ↗
                  </span>
                </div>
                <div className="absolute inset-0 border-2 border-black/0 group-hover:border-black/100 transition-all duration-300 -m-[2px]" />
              </Link>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="absolute -right-20 top-0 h-[500px] w-[500px]">
              {/* Large decorative number */}
              <span
                className="absolute right-0 top-0 select-none font-mono text-[20rem] font-black leading-none text-[#00B900] opacity-[0.15] animate-[rotateIn_1.2s_ease-out]"
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
          <div className="mb-12 flex items-end justify-between border-b-4 border-black pb-4">
            <h2
              className={`text-4xl font-black text-black sm:text-5xl ${syne.className}`}
            >
              主な機能
            </h2>
            <span className="font-mono text-lg font-bold text-black/40">
              03 Features
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className="group relative animate-[slideUp_1s_ease-out]"
                style={{
                  animationDelay: `${0.8 + index * 0.1}s`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Number Badge */}
                <div className="mb-6 inline-block">
                  <span className="inline-block border-2 border-black bg-white px-4 py-2 font-mono text-2xl font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {feature.number}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className={`mb-4 text-2xl font-bold text-black ${ibmPlexSans.className}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed text-black/70 ${ibmPlexSans.className}`}
                >
                  {feature.description}
                </p>

                {/* Hover decoration */}
                <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full border-2 border-black bg-[#FFE500] opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            ))}
          </div>
        </section>

        {/* Footer Accent */}
        <div className="mt-32 flex items-center justify-center gap-6">
          <div className="h-1 w-16 bg-black" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-black/40">
            Built for Communication
          </span>
          <div className="h-1 w-16 bg-black" />
        </div>
      </div>
    </main>
  );
}
