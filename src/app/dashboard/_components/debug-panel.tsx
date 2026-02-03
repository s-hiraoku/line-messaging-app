'use client';

import { useState } from 'react';
import { ExternalLink, Check, Copy } from 'lucide-react';

export function DebugPanel({
  title = 'Debug',
  request,
  response,
  curl,
  docsUrl,
}: {
  title?: string;
  request?: unknown;
  response?: unknown;
  curl?: string | null;
  docsUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-gray-700 cursor-pointer rounded-t-2xl hover:bg-[#e8f5e9] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-normal normal-case text-[#00B900] hover:text-[#00B900]/80 cursor-pointer transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              <span>公式ドキュメント</span>
            </a>
          )}
        </div>
        <span className="text-xs text-gray-500 font-bold">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 py-3 bg-[#e8f5e9] rounded-b-2xl">
          {curl && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">cURL</p>
                <button
                  className="flex items-center gap-1 text-xs rounded-lg bg-white px-2 py-1 font-bold uppercase tracking-wider text-gray-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.12)] cursor-pointer"
                  onClick={() => copy(curl, 'curl')}
                >
                  {copiedSection === 'curl' ? (
                    <>
                      <Check className="h-3 w-3 text-[#00B900]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-auto rounded-xl bg-white p-3 text-[11px] leading-relaxed text-gray-800 font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
{curl}
              </pre>
            </div>
          )}
          {request !== undefined && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Request</p>
                <button
                  className="flex items-center gap-1 text-xs rounded-lg bg-white px-2 py-1 font-bold uppercase tracking-wider text-gray-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.12)] cursor-pointer"
                  onClick={() => copy(JSON.stringify(request, null, 2), 'request')}
                >
                  {copiedSection === 'request' ? (
                    <>
                      <Check className="h-3 w-3 text-[#00B900]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-auto rounded-xl bg-white p-3 text-[11px] leading-relaxed text-gray-800 font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
{JSON.stringify(request, null, 2)}
              </pre>
            </div>
          )}
          {response !== undefined && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Response</p>
                <button
                  className="flex items-center gap-1 text-xs rounded-lg bg-white px-2 py-1 font-bold uppercase tracking-wider text-gray-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.12)] cursor-pointer"
                  onClick={() => copy(JSON.stringify(response, null, 2), 'response')}
                >
                  {copiedSection === 'response' ? (
                    <>
                      <Check className="h-3 w-3 text-[#00B900]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-auto rounded-xl bg-white p-3 text-[11px] leading-relaxed text-gray-800 font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
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
