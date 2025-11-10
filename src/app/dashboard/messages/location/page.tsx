"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function LocationMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          type: "location",
          title,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "位置情報メッセージの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報をサポートしていません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setError(null);
      },
      (err) => {
        setError(`位置情報の取得に失敗しました: ${err.message}`);
      }
    );
  };

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const isValidLatitude = !isNaN(lat) && lat >= -90 && lat <= 90;
  const isValidLongitude = !isNaN(lng) && lng >= -180 && lng <= 180;
  const isValidCoordinates = isValidLatitude && isValidLongitude;

  return (
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">位置情報メッセージ送信</h1>
        <p className="text-sm text-slate-400">
          地図上の位置をユーザーに共有できます。
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
          <label htmlFor="title" className="text-sm font-medium text-slate-300">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="東京タワー"
            required
          />
          <p className="text-xs text-slate-500">最大100文字</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-slate-300">
            住所 <span className="text-red-400">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            maxLength={100}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="東京都港区芝公園4-2-8"
            required
          />
          <p className="text-xs text-slate-500">最大100文字</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="latitude" className="text-sm font-medium text-slate-300">
              緯度 <span className="text-red-400">*</span>
            </label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="35.658581"
              min="-90"
              max="90"
              required
            />
            {latitude && (
              <p className={`text-xs ${isValidLatitude ? "text-slate-500" : "text-red-400"}`}>
                {isValidLatitude ? "有効な緯度" : "-90.0〜90.0の範囲で入力してください"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="longitude" className="text-sm font-medium text-slate-300">
              経度 <span className="text-red-400">*</span>
            </label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="139.745433"
              min="-180"
              max="180"
              required
            />
            {longitude && (
              <p className={`text-xs ${isValidLongitude ? "text-slate-500" : "text-red-400"}`}>
                {isValidLongitude ? "有効な経度" : "-180.0〜180.0の範囲で入力してください"}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          現在地を取得
        </button>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              status === "sending" ||
              !lineUserId ||
              !title ||
              !address ||
              !isValidCoordinates
            }
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">位置情報メッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Map Preview */}
      {isValidCoordinates && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="overflow-hidden rounded-2xl bg-blue-600 shadow-md">
                <div className="relative h-48 w-full bg-slate-700">
                  <iframe
                    src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                    className="h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                <div className="bg-white p-3 text-slate-900">
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-slate-600">{address}</div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {isValidCoordinates && (
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
      "type": "location",
      "title": "${title}",
      "address": "${address}",
      "latitude": ${lat},
      "longitude": ${lng}
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
                    type: "location",
                    title,
                    address,
                    latitude: lat,
                    longitude: lng,
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
