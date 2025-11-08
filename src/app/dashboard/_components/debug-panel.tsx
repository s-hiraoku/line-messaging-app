'use client';

import { useState } from 'react';

export function DebugPanel({
  title = 'Debug',
  request,
  response,
  curl,
}: {
  title?: string;
  request?: unknown;
  response?: unknown;
  curl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold text-slate-200"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="text-xs text-slate-400">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t px-4 py-3">
          {curl && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">cURL</p>
                <button className="text-xs text-blue-300 hover:text-blue-200" onClick={() => copy(curl)}>copy</button>
              </div>
              <pre className="overflow-auto rounded bg-slate-950/70 p-2 text-[11px] leading-relaxed text-slate-200">
{curl}
              </pre>
            </div>
          )}
          {request !== undefined && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">Request</p>
                <button className="text-xs text-blue-300 hover:text-blue-200" onClick={() => copy(JSON.stringify(request, null, 2))}>copy</button>
              </div>
              <pre className="overflow-auto rounded bg-slate-950/70 p-2 text-[11px] leading-relaxed text-slate-200">
{JSON.stringify(request, null, 2)}
              </pre>
            </div>
          )}
          {response !== undefined && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">Response</p>
                <button className="text-xs text-blue-300 hover:text-blue-200" onClick={() => copy(JSON.stringify(response, null, 2))}>copy</button>
              </div>
              <pre className="overflow-auto rounded bg-slate-950/70 p-2 text-[11px] leading-relaxed text-slate-200">
{JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function toCurl({ url, method = 'GET', headers, body }: { url: string; method?: string; headers?: Record<string, string>; body?: unknown; }) {
  const parts = [
    'curl',
    '-X', method,
    `'${url}'`,
  ];
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      parts.push('-H', `'${k}: ${v}'`);
    }
  }
  if (body !== undefined) {
    parts.push('-d', `'${JSON.stringify(body).replace(/'/g, "'\\''")}'`);
  }
  return parts.join(' ');
}
