import Link from "next/link";

const featureHighlights = [
  {
    title: "メッセージ統合管理",
    description: "チャット、ブロードキャスト、テンプレートを一元管理し、運用負荷を軽減。",
  },
  {
    title: "リアルタイム連携",
    description: "Webhook とダッシュボードで最新のユーザー状況や会話ログを即座に把握。",
  },
  {
    title: "柔軟な拡張性",
    description: "LINE Messaging API の各種メッセージタイプに対応するモジュール化された設計。",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-14 px-6 py-24 text-slate-100">
        <div className="flex flex-col items-center text-center gap-6">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200">
            Line Messaging App POC
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            LINE チャネル運用を加速するモダンダッシュボード
          </h1>
          <p className="max-w-2xl text-pretty text-base text-slate-300 sm:text-lg">
            顧客とのコミュニケーションを最適化するための、メッセージ配信・分析・自動化を備えた統合管理ツールです。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400"
            >
              ダッシュボードへ進む
            </Link>
            <Link
              href="/docs/system-design"
              className="inline-flex items-center rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
            >
              設計仕様を確認
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {featureHighlights.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 transition hover:border-blue-500/50 hover:bg-slate-900/60"
            >
              <div className="absolute inset-0 translate-y-full rounded-2xl bg-blue-500/10 transition duration-500 group-hover:translate-y-0" />
              <div className="relative z-10 space-y-3">
                <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                <p className="text-sm leading-relaxed text-slate-300">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
