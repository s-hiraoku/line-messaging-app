const summaryCards = [
  { title: "今日のメッセージ", metric: "—", description: "Webhook 実装後に表示" },
  { title: "フォロー中のユーザー", metric: "—", description: "ユーザー同期待ち" },
  { title: "進行中の配信", metric: "—", description: "配信機能で更新" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-slate-500">
          LINE Messaging API の運用状況をここから把握できます。
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-slate-500">{card.title}</h2>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.metric}</p>
            <p className="mt-2 text-xs text-slate-400">{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
