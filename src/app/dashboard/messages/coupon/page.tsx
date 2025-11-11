"use client";

import { useState, useEffect } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";

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
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">クーポンメッセージ送信</h1>
        <p className="text-sm text-slate-400">
          LINE公式アカウントマネージャーで発行したクーポンを送信できます。
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
          <label htmlFor="couponId" className="text-sm font-medium text-slate-300">
            クーポンID <span className="text-red-400">*</span>
          </label>
          <input
            id="couponId"
            type="text"
            value={couponId}
            onChange={(event) => {
              setCouponId(event.target.value);
              setSelectedCoupon(null);
            }}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="COUPON001"
            required
          />
          <p className="text-xs text-slate-500">
            LINE公式アカウントマネージャーで発行したクーポンIDを入力してください
          </p>
        </div>

        {/* Coupon List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">発行済みクーポン</label>
            <button
              type="button"
              onClick={loadCoupons}
              disabled={loading}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "再読み込み"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <button
                key={coupon.couponId}
                type="button"
                onClick={() => handleSelectCoupon(coupon)}
                disabled={coupon.used}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedCoupon?.couponId === coupon.couponId
                    ? "border-blue-500 bg-blue-500/10"
                    : coupon.used
                      ? "border-slate-700 bg-slate-900/40 opacity-50"
                      : "border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 font-medium text-white">{coupon.name}</div>
                    <div className="text-xs text-slate-400">ID: {coupon.couponId}</div>
                  </div>
                  {coupon.used && (
                    <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                      使用済み
                    </span>
                  )}
                  {!coupon.used && selectedCoupon?.couponId === coupon.couponId && (
                    <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                      選択中
                    </span>
                  )}
                </div>
                {coupon.expirationDate && (
                  <div className="text-xs text-slate-500">
                    有効期限: {coupon.expirationDate}
                  </div>
                )}
              </button>
            ))}
          </div>

          {coupons.length === 0 && !loading && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-8 text-center">
              <p className="text-sm text-slate-400">
                発行済みクーポンがありません
                <br />
                LINE公式アカウントマネージャーでクーポンを作成してください
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !couponId}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">クーポンメッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Preview */}
      {selectedCoupon && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">プレビュー</h2>
          <div className="flex justify-end">
            <div className="max-w-xs space-y-2">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                <div className="p-6 text-white">
                  <div className="mb-2 text-2xl font-bold">🎫</div>
                  <div className="mb-4 text-lg font-semibold">{selectedCoupon.name}</div>
                  <div className="mb-2 text-sm opacity-90">ID: {selectedCoupon.couponId}</div>
                  {selectedCoupon.expirationDate && (
                    <div className="text-xs opacity-75">
                      有効期限: {selectedCoupon.expirationDate}
                    </div>
                  )}
                  <div className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-center text-sm font-medium backdrop-blur-sm">
                    このクーポンを使う
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">クーポンメッセージ</div>
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
