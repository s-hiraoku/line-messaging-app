"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { Syne, IBM_Plex_Sans } from "next/font/google";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>位置情報メッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500] rounded-full" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          位置情報を送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="space-y-2">
          <label htmlFor="lineUserId" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            LINE ユーザー ID <span className="text-red-600">*</span>
          </label>
          <input
            id="lineUserId"
            type="text"
            value={lineUserId}
            onChange={(event) => setLineUserId(event.target.value)}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            タイトル <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="東京タワー"
            required
          />
          <p className="text-xs font-mono text-gray-500">最大100文字</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            住所 <span className="text-red-600">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            maxLength={100}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="東京都港区芝公園4-2-8"
            required
          />
          <p className="text-xs font-mono text-gray-500">最大100文字</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="latitude" className="text-sm font-bold uppercase tracking-wider text-gray-800">
              緯度 <span className="text-red-600">*</span>
            </label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
              placeholder="35.658581"
              min="-90"
              max="90"
              required
            />
            {latitude && (
              <p className={`text-xs font-mono ${isValidLatitude ? "text-gray-500" : "text-red-600 font-bold"}`}>
                {isValidLatitude ? "有効な緯度" : "-90.0〜90.0の範囲で入力してください"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="longitude" className="text-sm font-bold uppercase tracking-wider text-gray-800">
              経度 <span className="text-red-600">*</span>
            </label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
              placeholder="139.745433"
              min="-180"
              max="180"
              required
            />
            {longitude && (
              <p className={`text-xs font-mono ${isValidLongitude ? "text-gray-500" : "text-red-600 font-bold"}`}>
                {isValidLongitude ? "有効な経度" : "-180.0〜180.0の範囲で入力してください"}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
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

        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
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
          <p className="text-sm font-bold text-[#00B900]">位置情報メッセージを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      {/* Map Preview */}
      {isValidCoordinates && (
        <LineConversation
          message={{
            type: "location",
            title,
            address,
            latitude: lat,
            longitude: lng,
          }}
        />
      )}

      {/* Debug Panel */}
      {isValidCoordinates && (
        <DebugPanel
          title="送信 API デバッグ"
          request={{ to: lineUserId, type: "location", title, address, latitude: lat, longitude: lng }}
          response={undefined}
          curl={toCurl({
            url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { to: lineUserId, type: "location", title, address, latitude: lat, longitude: lng }
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#send-push-message"
        />
      )}
    </div>
  );
}
