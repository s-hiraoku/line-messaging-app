"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

type Status = "idle" | "sending" | "success" | "error";

export default function VideoMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);
  const [previewUrlError, setPreviewUrlError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

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
      const payload = { to: lineUserId, type: "video", videoUrl, previewUrl };
      setLastRequest(payload);
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setLastResponse(data);
        throw new Error(data.error ?? "動画メッセージの送信に失敗しました");
      }

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);
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
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-black">
            LINE ユーザー ID <span className="text-red-600">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="videoUrl" className="text-sm font-bold uppercase tracking-wider text-black">
            動画URL <span className="text-red-600">*</span>
          </label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(event) => handleVideoUrlChange(event.target.value)}
            className={`w-full border-2 ${
              videoUrlError ? "border-red-600" : "border-black"
            } bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all`}
            placeholder="https://example.com/video.mp4"
            required
          />
          {videoUrlError && (
            <p className="text-xs text-red-600 font-bold">{videoUrlError}</p>
          )}
          <p className="text-xs font-mono text-black/60">
            MP4形式、HTTPS必須、最大200MB
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="previewUrl" className="text-sm font-bold uppercase tracking-wider text-black">
            プレビュー画像URL <span className="text-red-600">*</span>
          </label>
          <input
            id="previewUrl"
            type="url"
            value={previewUrl}
            onChange={(event) => handlePreviewUrlChange(event.target.value)}
            className={`w-full border-2 ${
              previewUrlError ? "border-red-600" : "border-black"
            } bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all`}
            placeholder="https://example.com/preview.jpg"
            required
          />
          {previewUrlError && (
            <p className="text-xs text-red-600 font-bold">{previewUrlError}</p>
          )}
          <p className="text-xs font-mono text-black/60">
            JPEG形式、HTTPS必須、最大1MB
          </p>
        </div>

        <LineConversation
          direction="inbound"
          displayName="ユーザー"
          message={{
            type: "video",
            videoUrl: videoUrl || "https://example.com/video.mp4",
            previewUrl: previewUrl || "https://example.com/preview.jpg",
          }}
        />

        <div className="flex items-center gap-3 border-t-2 border-black pt-4">
          <button
            type="submit"
            className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            disabled={status === "sending" || !isFormValid}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm font-bold text-[#00B900]">動画メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
        </div>
      </form>

      {/* Debug Panel */}
      {videoUrl && previewUrl && !videoUrlError && !previewUrlError && (
        <DebugPanel
          title="送信 API デバッグ"
          request={lastRequest}
          response={lastResponse}
          curl={toCurl({
            url: new URL("/api/line/send", typeof window !== "undefined" ? location.origin : "http://localhost:3000").toString(),
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: lastRequest,
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
        />
      )}
    </div>
  );
}
