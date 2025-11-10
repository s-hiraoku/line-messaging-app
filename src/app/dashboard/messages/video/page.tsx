"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function VideoMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);
  const [previewUrlError, setPreviewUrlError] = useState<string | null>(null);

  const validateVideoUrl = (url: string): string | null => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);

      if (urlObj.protocol !== "https:") {
        return "動画URLはHTTPSで始まる必要があります";
      }

      if (!url.toLowerCase().endsWith(".mp4")) {
        return "動画URLは.mp4で終わる必要があります";
      }

      return null;
    } catch {
      return "有効なURLを入力してください";
    }
  };

  const validatePreviewUrl = (url: string): string | null => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);

      if (urlObj.protocol !== "https:") {
        return "プレビュー画像URLはHTTPSで始まる必要があります";
      }

      const lower = url.toLowerCase();
      if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
        return "プレビュー画像URLは.jpgまたは.jpegで終わる必要があります";
      }

      return null;
    } catch {
      return "有効なURLを入力してください";
    }
  };

  const handleVideoUrlChange = (value: string) => {
    setVideoUrl(value);
    setVideoUrlError(validateVideoUrl(value));
  };

  const handlePreviewUrlChange = (value: string) => {
    setPreviewUrl(value);
    setPreviewUrlError(validatePreviewUrl(value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Final validation before submission
    const videoError = validateVideoUrl(videoUrl);
    const previewError = validatePreviewUrl(previewUrl);

    if (videoError || previewError) {
      setVideoUrlError(videoError);
      setPreviewUrlError(previewError);
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: lineUserId,
          type: "video",
          videoUrl,
          previewUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "動画メッセージの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const isFormValid =
    lineUserId &&
    videoUrl &&
    previewUrl &&
    !videoUrlError &&
    !previewUrlError;

  return (
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">動画メッセージ送信</h1>
        <p className="text-sm text-slate-400">
          MP4形式の動画ファイルをユーザーに送信できます（最大200MB）。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-medium text-slate-300">
            LINE ユーザー ID <span className="text-red-400">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="videoUrl" className="text-sm font-medium text-slate-300">
            動画URL <span className="text-red-400">*</span>
          </label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(event) => handleVideoUrlChange(event.target.value)}
            className={`w-full rounded-md border ${
              videoUrlError ? "border-red-500" : "border-slate-600"
            } bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="https://example.com/video.mp4"
            required
          />
          {videoUrlError && (
            <p className="text-xs text-red-400">{videoUrlError}</p>
          )}
          <p className="text-xs text-slate-500">
            MP4形式、HTTPS必須、最大200MB
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="previewUrl" className="text-sm font-medium text-slate-300">
            プレビュー画像URL <span className="text-red-400">*</span>
          </label>
          <input
            id="previewUrl"
            type="url"
            value={previewUrl}
            onChange={(event) => handlePreviewUrlChange(event.target.value)}
            className={`w-full rounded-md border ${
              previewUrlError ? "border-red-500" : "border-slate-600"
            } bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="https://example.com/preview.jpg"
            required
          />
          {previewUrlError && (
            <p className="text-xs text-red-400">{previewUrlError}</p>
          )}
          <p className="text-xs text-slate-500">
            JPEG形式、HTTPS必須、最大1MB
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !isFormValid}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">動画メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview Section */}
      {videoUrl && previewUrl && !videoUrlError && !previewUrlError && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="relative overflow-hidden rounded-2xl bg-blue-600 shadow-md">
                <img
                  src={previewUrl}
                  alt="Video preview"
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden flex h-48 items-center justify-center bg-slate-700 text-slate-400">
                  <div className="text-center text-sm">
                    <div>プレビュー画像</div>
                    <div className="text-xs opacity-60">読み込めません</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">動画メッセージ</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {videoUrl && previewUrl && !videoUrlError && !previewUrlError && (
        <details className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 shadow-lg backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-medium text-slate-300">
            デバッグ情報
          </summary>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">cURL</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {`curl -X POST https://api.line.me/v2/bot/message/push \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}' \\
  -d '{
  "to": "${lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}",
  "messages": [
    {
      "type": "video",
      "originalContentUrl": "${videoUrl}",
      "previewImageUrl": "${previewUrl}"
    }
  ]
}'`}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Request Body</div>
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                {JSON.stringify(
                  {
                    to: lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    type: "video",
                    videoUrl,
                    previewUrl,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
