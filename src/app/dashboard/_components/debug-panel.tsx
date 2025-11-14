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
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold uppercase tracking-wider text-black cursor-pointer border-b-2 border-black hover:bg-[#FFFEF5] transition-colors"
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
        <span className="text-xs text-black/60 font-bold">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 py-3 bg-[#FFFEF5]">
          {curl && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-black">cURL</p>
                <button
                  className="flex items-center gap-1 text-xs border-2 border-black bg-white px-2 py-1 font-bold uppercase tracking-wider text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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
              <pre className="overflow-auto border-2 border-black bg-white p-2 text-[11px] leading-relaxed text-black font-mono">
{curl}
              </pre>
            </div>
          )}
          {request !== undefined && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-black">Request</p>
                <button
                  className="flex items-center gap-1 text-xs border-2 border-black bg-white px-2 py-1 font-bold uppercase tracking-wider text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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
              <pre className="overflow-auto border-2 border-black bg-white p-2 text-[11px] leading-relaxed text-black font-mono">
{JSON.stringify(request, null, 2)}
              </pre>
            </div>
          )}
          {response !== undefined && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-black">Response</p>
                <button
                  className="flex items-center gap-1 text-xs border-2 border-black bg-white px-2 py-1 font-bold uppercase tracking-wider text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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
              <pre className="overflow-auto border-2 border-black bg-white p-2 text-[11px] leading-relaxed text-black font-mono">
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
