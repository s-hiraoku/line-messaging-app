import fs from 'fs';
import path from 'path';

export const metadata = { title: 'System Design | LINE Messaging App' };

const extraSections = [
  {
    title: 'Architecture Goals',
    body: [
      'Optimize developer feedback loop (hot reload <1s, minimal mock boilerplate).',
      'Strict typing across API boundary (Zod schemas + inferred client types: planned).',
      'Feature isolation: domain folders reduce cross-module churn.',
    ],
  },
  {
    title: 'Performance / Scaling (Planned)',
    body: [
      'Broadcast fan-out: queue + chunked push to LINE to avoid rate limits.',
      'Imagemap + rich menu generation pre-processing to offload heavy transforms.',
      'Edge caching for read-heavy endpoints (users / tags / templates) leveraging CDN.',
    ],
  },
  {
    title: 'Reliability Enhancements (Future)',
    body: [
      'Outbound message retry with exponential backoff + DLQ in Redis.',
      'Webhook idempotency via eventId memoization to prevent duplicate processing.',
      'Heartbeat & health probes: /api/health (db+redis) for uptime monitors.',
    ],
  },
  {
    title: 'Security Hardening (Future)',
    body: [
      'Role-based access: admin / operator / analyst separated by action scopes.',
      'Audit trail: immutable append-only log for critical actions (send, delete template).',
      'Rate limiting: IP + channel based token bucket on sensitive API routes.',
    ],
  },
  {
    title: 'Testing Matrix',
    body: [
      'Unit: matcher, executor, payload normalizer.',
      'Integration: webhook signature → persistence → auto-reply chain.',
      'E2E: dashboard create auto-reply → trigger via simulated LINE event.',
      'Load: broadcast of N=10k users (staging) measuring latency & error rate.',
    ],
  },
  {
    title: 'Observability Plan',
    body: [
      'Metrics: total inbound, auto-reply hit rate, broadcast success %, p95 webhook latency.',
      'Structured logging: JSON logs with requestId / userId / channelId.',
      'Alerting thresholds: webhook failure >2% in 5m, retry queue depth >1000.',
    ],
  },
  {
    title: 'Internationalization Strategy',
    body: [
      'Central message catalog (keys) enabling Japanese / English switch.',
      'Templates store i18n variants or fallback to default.',
      'Auto-reply rules tagged with locale for segmented responses.',
    ],
  },
  {
    title: 'Roadmap Snapshot',
    body: [
      'Phase 1: Core messaging + auto-reply + rich menu POC (current).',
      'Phase 2: Reliability (retry queue, idempotency), analytics dashboards.',
      'Phase 3: RBAC + audit + i18n, performance tuning & edge caching.',
      'Phase 4: Multi-channel (future LINE accounts, possible other platforms).',
    ],
  },
];

function renderMarkdown(md: string) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
             .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
             .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
             .replace(/^### (.*)$/gm, '<h3>$1</h3>')
             .replace(/^## (.*)$/gm, '<h2>$1</h2>')
             .replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre data-lang="${lang || ''}" class="overflow-auto rounded border bg-black/90 p-4 text-xs text-white"><code>${code.replace(/\n/g,'<br/>')}</code></pre>`;
  });
  html = html.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, m => `<ul class="list-disc pl-6 space-y-1">${m}</ul>`);
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-black/10 px-1 py-0.5 text-[90%]">$1</code>');
  html = html.replace(/^---$/gm, '<hr />');
  html = html.replace(/^(?!<h\d>|<ul>|<li>|<pre>|<hr>)([^\n]+)$/, '<p>$1</p>');
  return html;
}

export default function SystemDesignPage() {
  let raw = '';
  try {
    raw = fs.readFileSync(path.join(process.cwd(), 'docs', 'system-design.md'), 'utf8');
  } catch (e) {
    raw = '# System Design\nコンテンツの読み込みに失敗しました。';
  }
  const html = renderMarkdown(raw);
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFEF5] px-6 py-16 sm:px-12 sm:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00B900] opacity-[0.10] blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[360px] w-[360px] translate-x-1/4 rounded-full bg-[#FFE500] opacity-[0.12] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-[#00B900] opacity-[0.06] blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-12">
          <span className="inline-block -rotate-2 border-2 border-black bg-[#FFE500] px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            System Design
          </span>
        </div>
        <nav className="mb-16 flex flex-wrap gap-6 text-xs sm:text-sm font-mono">
          <a href="/" className="underline">← Home</a>
          <a href="/design-spec" className="underline">設計仕様</a>
          <a href="/dashboard" className="underline">Dashboard</a>
        </nav>
        <article className="prose max-w-none animate-[fadeIn_0.8s_ease-out] prose-headings:font-black prose-h1:text-5xl prose-h1:mb-8 prose-h2:mt-16 prose-h2:mb-4 prose-h3:mt-10 prose-h3:mb-3 prose-p:leading-relaxed prose-code:bg-black/10 selection:bg-[#FFE500]/60" dangerouslySetInnerHTML={{ __html: html }} />
        <hr className="my-12" />
        <section>
          <h2 className="text-4xl font-black mb-8 tracking-tight">Extended Specification</h2>
          <div className="space-y-10">
            {extraSections.map(s => (
              <div key={s.title}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><span className="inline-block border-2 border-black bg-white px-3 py-1 font-mono text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">§</span>{s.title}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {s.body.map(line => (
                    <li key={line} className="text-black/80 text-sm leading-relaxed">{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
