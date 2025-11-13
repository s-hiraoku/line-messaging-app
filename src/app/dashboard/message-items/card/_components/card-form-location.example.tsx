/**
 * LocationForm Example
 *
 * Demonstrates usage of the LocationForm component for editing location cards.
 */

"use client";

import { useState } from "react";
import { LocationForm } from "./card-form-location";
import type { LocationCard } from "./types";

export default function LocationFormExample() {
  const [locationCard, setLocationCard] = useState<LocationCard>({
    id: "example-location-1",
    type: "location",
    title: "東京タワー",
    address: "東京都港区芝公園4-2-8",
    hours: "9:00-23:00",
    imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800",
    actions: [
      {
        type: "uri",
        label: "公式サイト",
        uri: "https://www.tokyotower.co.jp/",
      },
      {
        type: "message",
        label: "営業時間を確認",
        text: "営業時間を教えてください",
      },
    ],
  });

  const handleChange = (updates: Partial<LocationCard>) => {
    setLocationCard((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">
          LocationForm Example
        </h2>

        <div className="space-y-8">
          {/* LocationForm Component */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-300">
              Location Card Editor
            </h3>
            <LocationForm card={locationCard} onChange={handleChange} />
          </div>

          {/* JSON Output */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-300">
              JSON Output
            </h3>
            <div className="overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-4">
              <pre className="text-xs text-slate-400">
                {JSON.stringify(locationCard, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-6">
        <h3 className="mb-3 text-lg font-semibold text-blue-300">
          Usage Instructions
        </h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <strong>Required Fields:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-slate-400">
            <li>Title (最大40文字)</li>
            <li>Address (最大60文字)</li>
            <li>Image (JPEG/PNG、10MB以下、1024x1024px以上)</li>
            <li>Actions (最低1つ、最大3つ)</li>
          </ul>

          <p className="mt-4">
            <strong>Optional Fields:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-slate-400">
            <li>Hours (営業時間、最大60文字)</li>
          </ul>

          <p className="mt-4">
            <strong>Features:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-slate-400">
            <li>Real-time validation with character count display</li>
            <li>Error messages for invalid input</li>
            <li>Image upload with preview</li>
            <li>Action editor for URI, message, and postback actions</li>
            <li>Form summary showing completion status</li>
            <li>Validation summary highlighting all errors</li>
          </ul>
        </div>
      </div>

      {/* Example Use Cases */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-300">
          Example Use Cases
        </h3>
        <div className="space-y-4">
          <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
            <h4 className="mb-2 font-medium text-white">
              Restaurant Location
            </h4>
            <button
              type="button"
              onClick={() =>
                setLocationCard({
                  id: "restaurant-1",
                  type: "location",
                  title: "サクラレストラン",
                  address: "東京都渋谷区道玄坂1-2-3",
                  hours: "11:00-23:00 (L.O. 22:30)",
                  imageUrl:
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                  actions: [
                    {
                      type: "uri",
                      label: "予約する",
                      uri: "https://example.com/reserve",
                    },
                    {
                      type: "message",
                      label: "メニューを見る",
                      text: "メニューを教えてください",
                    },
                    {
                      type: "uri",
                      label: "地図を開く",
                      uri: "https://maps.google.com/?q=sakura+restaurant",
                    },
                  ],
                })
              }
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Load Example
            </button>
          </div>

          <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
            <h4 className="mb-2 font-medium text-white">Store Location</h4>
            <button
              type="button"
              onClick={() =>
                setLocationCard({
                  id: "store-1",
                  type: "location",
                  title: "テックストア 渋谷店",
                  address: "東京都渋谷区宇田川町21-1",
                  hours: "10:00-21:00 (年中無休)",
                  imageUrl:
                    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800",
                  actions: [
                    {
                      type: "uri",
                      label: "店舗詳細",
                      uri: "https://example.com/stores/shibuya",
                    },
                    {
                      type: "postback",
                      label: "在庫確認",
                      data: "action=check_stock&store_id=shibuya",
                      displayText: "在庫を確認する",
                    },
                  ],
                })
              }
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Load Example
            </button>
          </div>

          <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-4">
            <h4 className="mb-2 font-medium text-white">Event Venue</h4>
            <button
              type="button"
              onClick={() =>
                setLocationCard({
                  id: "venue-1",
                  type: "location",
                  title: "ミュージックホール東京",
                  address: "東京都千代田区丸の内1-1-1",
                  hours: "イベント開催時のみ営業",
                  imageUrl:
                    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
                  actions: [
                    {
                      type: "uri",
                      label: "チケット購入",
                      uri: "https://example.com/tickets",
                    },
                    {
                      type: "message",
                      label: "イベント情報",
                      text: "今後のイベント情報を教えてください",
                    },
                    {
                      type: "uri",
                      label: "アクセス",
                      uri: "https://example.com/access",
                    },
                  ],
                })
              }
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Load Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
