"use client";

import { useState, useEffect } from "react";
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

interface Coupon {
  couponId: string;
  name: string;
  expirationDate?: string;
  used?: boolean;
}

export default function CouponMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [couponId, setCouponId] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  // Load coupons on mount
  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/line/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      } else {
        // If API not implemented yet, use mock data
        setCoupons([
          {
            couponId: "COUPON001",
            name: "新規登録クーポン 500円OFF",
            expirationDate: "2025-12-31",
            used: false,
          },
          {
            couponId: "COUPON002",
            name: "リピーター特典 10%OFF",
            expirationDate: "2025-06-30",
            used: false,
          },
          {
            couponId: "COUPON003",
            name: "期間限定クーポン 送料無料",
            expirationDate: "2025-03-31",
            used: true,
          },
        ]);
      }
    } catch (err) {
      // Use mock data on error
      setCoupons([
        {
          couponId: "COUPON001",
          name: "新規登録クーポン 500円OFF",
          expirationDate: "2025-12-31",
          used: false,
        },
        {
          couponId: "COUPON002",
          name: "リピーター特典 10%OFF",
          expirationDate: "2025-06-30",
          used: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCouponId(coupon.couponId);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const payload = {
        to: lineUserId,
        messages: [{
          type: "coupon",
          couponId,
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
        throw new Error(data.error ?? "クーポンメッセージの送信に失敗しました");
      }

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);
      setStatus("success");
      setCouponId("");
      setSelectedCoupon(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>クーポンメッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500] rounded-full" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          LINEクーポンを送信できます。
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
          <label htmlFor="couponId" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            クーポンID <span className="text-red-600">*</span>
          </label>
          <input
            id="couponId"
            type="text"
            value={couponId}
            onChange={(event) => {
              setCouponId(event.target.value);
              setSelectedCoupon(null);
            }}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="COUPON001"
            required
          />
          <p className="text-xs font-mono text-gray-500">
            LINE公式アカウントマネージャーで発行したクーポンIDを入力してください
          </p>
        </div>

        {/* Coupon List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-800">発行済みクーポン</label>
            <button
              type="button"
              onClick={loadCoupons}
              disabled={loading}
              className="text-xs font-bold uppercase tracking-wider text-[#00B900] hover:text-[#009500] disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "再読み込み"}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <button
                key={coupon.couponId}
                type="button"
                onClick={() => handleSelectCoupon(coupon)}
                disabled={coupon.used}
                className={`rounded-xl p-3 text-left transition-all duration-300 ${
                  selectedCoupon?.couponId === coupon.couponId
                    ? "bg-gray-800 text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
                    : coupon.used
                      ? "bg-gray-100 text-gray-800 opacity-50 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
                      : "bg-white text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 font-bold">{coupon.name}</div>
                    <div className="text-xs">{coupon.couponId}</div>
                  </div>
                  {coupon.used && (
                    <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
                      使用済み
                    </span>
                  )}
                  {!coupon.used && selectedCoupon?.couponId === coupon.couponId && (
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-800">
                      選択中
                    </span>
                  )}
                </div>
                {coupon.expirationDate && (
                  <div className="text-xs">
                    有効期限: {coupon.expirationDate}
                  </div>
                )}
              </button>
            ))}
          </div>

          {coupons.length === 0 && !loading && (
            <div className="rounded-xl bg-[#e8f5e9] p-8 text-center shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
              <p className="text-sm text-gray-500">
                発行済みクーポンがありません
                <br />
                LINE公式アカウントマネージャーでクーポンを作成してください
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
          disabled={status === "sending" || !lineUserId || !couponId}
        >
          {status === "sending" ? "送信中..." : "送信"}
        </button>
        {status === "success" && (
          <p className="text-sm font-bold text-[#00B900]">クーポンメッセージを送信しました。</p>
        )}
        {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      {/* Preview */}
      {selectedCoupon && (
        <div className="rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-800">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="rounded-xl bg-[#00B900] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <div className="text-white">
                  <div className="mb-2 text-2xl font-bold">🎫</div>
                  <div className="mb-4 text-lg font-bold">{selectedCoupon.name}</div>
                  <div className="mb-2 font-mono text-sm font-medium">ID: {selectedCoupon.couponId}</div>
                  {selectedCoupon.expirationDate && (
                    <div className="font-mono text-xs font-medium">
                      有効期限: {selectedCoupon.expirationDate}
                    </div>
                  )}
                  <div className="mt-4 rounded-lg border-2 border-white px-4 py-2 text-center text-sm font-bold uppercase tracking-wider">
                    このクーポンを使う
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-xs text-gray-500">クーポンメッセージ</div>
            </div>
          </div>
        </div>
      )}

      <DebugPanel
        title="クーポン API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={toCurl({
          url: new URL('/api/line/send', typeof window !== 'undefined' ? location.origin : 'http://localhost:3000').toString(),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: lastRequest
        })}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#coupon-message"
      />
    </div>
  );
}
