"use client";

import { useState } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { UserSelector } from "../../_components/user-selector";
import { ImageUploader } from "../../_components/image-uploader";
import { RichMessageEditor, ImagemapArea } from "./_components/editor";

type Status = "idle" | "sending" | "success" | "error";

export default function RichMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  // Imagemap fields
  const [altText, setAltText] = useState("リッチメッセージ");
  const [imageUrl, setImageUrl] = useState("");
  const [areas, setAreas] = useState<ImagemapArea[]>([]);

  /**
   * Convert Cloudinary URL to LINE imagemap compatible baseUrl using our proxy API
   *
   * LINE imagemap requires baseUrl that supports size suffixes (/1040, /700, /460, /300).
   * We use a proxy API to convert LINE's requests to Cloudinary URLs.
   *
   * Example:
   * Input:  https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg
   * Output: https://your-domain.com/api/imagemap-proxy/v1234567/sample.jpg
   *
   * When LINE requests: .../api/imagemap-proxy/v1234567/sample.jpg/1040
   * Proxy redirects to: https://res.cloudinary.com/.../w_1040,h_1040,c_fill/v1234567/sample.jpg
   */
  const convertToImagemapBaseUrl = (cloudinaryUrl: string): string => {
    try {
      // Extract public_id from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{ext}
      const url = new URL(cloudinaryUrl);
      const pathParts = url.pathname.split('/');

      // Find 'upload' index
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
        throw new Error('Invalid Cloudinary URL format');
      }

      // Extract everything after 'upload/' as public_id (including version and filename)
      const publicIdWithExt = pathParts.slice(uploadIndex + 1).join('/');

      // Remove file extension
      const publicId = publicIdWithExt.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

      // Build proxy URL
      // For development: use NEXT_PUBLIC_BASE_URL if set (e.g., ngrok URL)
      // For production: use window.location.origin
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                     (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      return `${baseUrl}/api/imagemap-proxy/${publicId}`;
    } catch (error) {
      console.error('Failed to convert Cloudinary URL:', error);
      // Fallback: return original URL without extension
      return cloudinaryUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    // Validation
    if (!imageUrl) {
      setStatus("error");
      setError("画像をアップロードしてください");
      return;
    }

    if (areas.length === 0) {
      setStatus("error");
      setError("少なくとも1つのタップ領域を作成してください");
      return;
    }

    // Validate each area has valid action
    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      if (area.action.type === 'uri' && !area.action.linkUri) {
        setStatus("error");
        setError(`エリア ${i + 1}: URLが設定されていません`);
        return;
      }
      if (area.action.type === 'message' && !area.action.text) {
        setStatus("error");
        setError(`エリア ${i + 1}: メッセージテキストが設定されていません`);
        return;
      }
    }

    try {
      // Send Imagemap message (リッチメッセージ)
      const payload = {
        to: lineUserId,
        messages: [{
          type: "imagemap",
          baseUrl: convertToImagemapBaseUrl(imageUrl),
          altText: altText,
          baseSize: {
            width: 1040,
            height: 1040,
          },
          actions: areas.map(area => ({
            type: area.action.type,
            ...(area.action.type === 'uri' && { linkUri: area.action.linkUri }),
            ...(area.action.type === 'message' && { text: area.action.text }),
            area: {
              x: area.x,
              y: area.y,
              width: area.width,
              height: area.height
            }
          }))
        }],
      };

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
        throw new Error(data.error ?? "メッセージの送信に失敗しました");
      }

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-black bg-[#FFFEF5] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-black">リッチメッセージとは？</h2>
        <p className="text-xs font-mono text-black/60">
          画像に複数のタップ可能なエリアを設定できるメッセージです。ユーザーがエリアをタップすると、URLを開いたり、メッセージを送信したりできます。
          マップやメニューなど、インタラクティブな画像コンテンツに最適です。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-black">
            送信先ユーザー <span className="text-red-600">*</span>
          </label>
          <UserSelector
            value={lineUserId}
            onValueChange={setLineUserId}
            placeholder="ユーザーを検索または LINE ユーザー ID を入力..."
          />
          <p className="text-xs font-mono text-black/60">
            ユーザー名や表示名で検索、または LINE ユーザー ID を直接入力できます
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="altText" className="text-sm font-bold uppercase tracking-wider text-black">
            代替テキスト <span className="text-red-600">*</span>
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={400}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
            placeholder="リッチメッセージ"
            required
          />
          <p className="text-xs font-mono text-black/60">最大400文字</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-black">
            リッチメッセージ画像 <span className="text-red-600">*</span>
          </label>
          <ImageUploader
            onImageUploaded={setImageUrl}
            placeholder="リッチメッセージ用の画像をアップロード（1024x1024px以上、正方形推奨）"
          />
          <p className="text-xs font-mono text-black/60">
            HTTPS画像が自動生成されます。1040x1040pxベースで配信されます。
          </p>
        </div>

        {imageUrl && (
          <RichMessageEditor
            imageUrl={imageUrl}
            areas={areas}
            onAreasChange={setAreas}
          />
        )}

        <div className="flex items-center gap-3 border-t-2 border-black pt-4">
          <button
            type="submit"
            className="inline-flex items-center border-2 border-black bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !imageUrl || areas.length === 0}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>

          {/* Validation hints */}
          {!lineUserId && status !== "sending" && (
            <p className="text-sm font-mono text-black/60">⚠️ 送信先ユーザーを選択してください</p>
          )}
          {lineUserId && !imageUrl && status !== "sending" && (
            <p className="text-sm font-mono text-black/60">⚠️ 画像をアップロードしてください</p>
          )}
          {lineUserId && imageUrl && areas.length === 0 && status !== "sending" && (
            <p className="text-sm font-mono text-black/60">⚠️ 画像上でドラッグしてタップエリアを作成してください</p>
          )}

          {status === "success" && (
            <p className="text-sm font-bold text-[#00B900]">メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
        </div>
      </form>

      {/* Preview section */}
      <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-black">プレビュー</h2>
        <div className="flex justify-end">
          <div className="max-w-xs">
            <div className="border-2 border-black bg-[#FFFEF5] p-4 text-xs text-black/80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <div className="mb-2 font-bold uppercase tracking-wider">リッチメッセージ</div>
                <div className="text-black/60">
                  {imageUrl ? (
                    <>
                      画像マップメッセージが送信されます。
                      <br />
                      {areas.length > 0 ? (
                        <>
                          {areas.length}個のタップ可能なエリアが設定されています。
                          <br />
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-black">アクション種類：</div>
                            {areas.filter(a => a.action.type === 'uri').length > 0 && (
                              <div>・URL: {areas.filter(a => a.action.type === 'uri').length}個</div>
                            )}
                            {areas.filter(a => a.action.type === 'message').length > 0 && (
                              <div>・メッセージ: {areas.filter(a => a.action.type === 'message').length}個</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          画像上をドラッグしてタップ領域を作成してください。
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      画像をアップロードして、タップ可能なエリアを設定してください。
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          title="送信 API デバッグ"
          request={lastRequest}
          response={lastResponse}
          curl={toCurl({
            url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: lastRequest
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#imagemap-message"
        />
      )}
    </div>
  );
}
