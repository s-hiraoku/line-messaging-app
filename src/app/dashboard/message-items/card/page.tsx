"use client";

import { useState, useEffect, useCallback } from "react";
import { DebugPanel, toCurl } from "../../_components/debug-panel";
import { UserSelector } from "../../_components/user-selector";
import { CardEditor } from "./_components/card-editor";
import { CardPreview } from "./_components/card-preview";
import { useCardPersistence } from "./_components/hooks/use-card-persistence";
import { validateCard, cardToCarouselColumn } from "./_components/utils";
import type { Card } from "./_components/types";

type Status = "idle" | "sending" | "success" | "error";

export default function CardMessagePage() {
  // Core state
  const [lineUserId, setLineUserId] = useState("");
  const [altText, setAltText] = useState("カードメッセージ");
  const [cards, setCards] = useState<Card[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Persistence hook
  const { restore, clear, hasSavedData, savedAt } = useCardPersistence(
    cards,
    altText
  );

  // Restore saved data on mount
  useEffect(() => {
    const saved = restore();
    if (saved) {
      setCards(saved.cards);
      setAltText(saved.altText);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle cards change from CardEditor
  const handleCardsChange = useCallback((updatedCards: Card[]) => {
    setCards(updatedCards);
    // Clear validation errors when cards change
    setValidationErrors([]);
  }, []);

  // Validate all cards before sending
  const validateAllCards = useCallback((): boolean => {
    const errors: string[] = [];

    if (cards.length === 0) {
      errors.push("最低1つのカードが必要です");
      setValidationErrors(errors);
      return false;
    }

    // Validate each card
    cards.forEach((card, index) => {
      const cardErrors = validateCard(card);
      if (cardErrors.length > 0) {
        cardErrors.forEach((err) => {
          errors.push(`カード${index + 1}: ${err.message}`);
        });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [cards]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    setValidationErrors([]);

    // Validation
    if (!lineUserId) {
      setStatus("error");
      setError("送信先ユーザーを選択してください");
      return;
    }

    if (!altText.trim()) {
      setStatus("error");
      setError("代替テキストを入力してください");
      return;
    }

    if (altText.length > 400) {
      setStatus("error");
      setError("代替テキストは400文字以内で入力してください");
      return;
    }

    if (cards.length === 0) {
      setStatus("error");
      setError("最低1つのカードが必要です");
      return;
    }

    // Validate all cards
    if (!validateAllCards()) {
      setStatus("error");
      setError("カードに入力エラーがあります。各カードの内容を確認してください");
      return;
    }

    try {
      // Convert cards to LINE Carousel Template format
      const columns = cards.map((card) => cardToCarouselColumn(card));

      // Send Carousel template message
      const payload = {
        to: lineUserId,
        messages: [
          {
            type: "template",
            altText: altText,
            template: {
              type: "carousel",
              columns: columns,
            },
          },
        ],
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

      // Clear localStorage on success
      clear();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました"
      );
    }
  };

  // Check if form is valid for submission
  const isFormValid =
    lineUserId && altText.trim() && altText.length <= 400 && cards.length > 0;

  return (
    <div className="space-y-6">
      {/* Info Banner with improved design */}
      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-500/20 p-2.5 flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-sm font-bold text-blue-300">
              カードメッセージとは？
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              複数のカードをカルーセル形式で表示できるインタラクティブなメッセージです。
              各カードには画像、タイトル、説明、アクションボタン（最大3つ）を設定できます。
              商品紹介、場所案内、人物紹介など、視覚的に情報を伝えたい場面に最適です。
            </p>
            {hasSavedData && savedAt && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-xs text-yellow-300">
                  前回の編集内容が復元されました（
                  {new Date(savedAt).toLocaleString('ja-JP')}）
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form with enhanced styling */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-800/50 p-6 shadow-xl backdrop-blur-sm"
      >
        {/* User Selector */}
        <div className="space-y-2">
          <label
            htmlFor="lineUserId"
            className="text-sm font-medium text-slate-300"
          >
            送信先ユーザー <span className="text-red-400">*</span>
          </label>
          <UserSelector
            value={lineUserId}
            onValueChange={setLineUserId}
            placeholder="ユーザーを検索または LINE ユーザー ID を入力..."
          />
          <p className="text-xs text-slate-500">
            ユーザー名や表示名で検索、または LINE ユーザー ID を直接入力できます
          </p>
        </div>

        {/* Alt Text Input */}
        <div className="space-y-2">
          <label htmlFor="altText" className="text-sm font-medium text-slate-300">
            代替テキスト <span className="text-red-400">*</span>
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={400}
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="カードメッセージ"
            required
          />
          <div className="flex items-center justify-between text-xs">
            <p className="text-slate-500">
              プッシュ通知やトークリストに表示されるテキスト
            </p>
            <p
              className={`${
                altText.length > 400
                  ? "text-red-400"
                  : altText.length > 350
                  ? "text-yellow-400"
                  : "text-slate-500"
              }`}
            >
              {altText.length} / 400
            </p>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="space-y-4">
          <div className="border-t border-slate-700/50 pt-4">
            <h3 className="mb-4 text-sm font-medium text-slate-300">
              カード編集
            </h3>

            {/* Desktop: Side-by-side layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Left: Card Editor */}
              <div className="min-h-[600px]">
                <CardEditor initialCards={cards} onChange={handleCardsChange} />
              </div>

              {/* Right: Card Preview */}
              <div className="min-h-[600px]">
                <div className="sticky top-6">
                  <CardPreview cards={cards} />
                </div>
              </div>
            </div>

            {/* Mobile: Stacked layout */}
            <div className="space-y-6 lg:hidden">
              {/* Card Editor */}
              <div className="min-h-[600px]">
                <CardEditor initialCards={cards} onChange={handleCardsChange} />
              </div>

              {/* Card Preview */}
              <div>
                <CardPreview cards={cards} />
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors with improved design */}
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-500/20 p-2 flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-bold text-red-300">
                  入力エラー ({validationErrors.length}件)
                </h4>
                <ul className="space-y-2 text-xs text-red-200">
                  {validationErrors.map((err, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span className="flex-1">{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button and Status with improved design */}
        <div className="flex flex-col gap-4 border-t border-slate-700/50 pt-6">
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg active:scale-95"
              disabled={status === "sending" || !isFormValid}
            >
              {status === "sending" ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  送信中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  送信
                </>
              )}
            </button>

            {/* Success Message with animation */}
            {status === "success" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-green-400">
                  メッセージを送信しました
                </p>
              </div>
            )}

            {/* Error Message with icon */}
            {status === "error" && error && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Validation Hints with better styling */}
          {status !== "sending" && !isFormValid && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-300 mb-2">送信前に以下を確認してください</p>
                  <ul className="space-y-1.5 text-xs text-yellow-200">
                    {!lineUserId && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        送信先ユーザーを選択してください
                      </li>
                    )}
                    {!altText.trim() && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        代替テキストを入力してください
                      </li>
                    )}
                    {altText.length > 400 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        代替テキストは400文字以内で入力してください
                      </li>
                    )}
                    {cards.length === 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        最低1つのカードを作成してください
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <DebugPanel
          title="送信 API デバッグ"
          request={lastRequest}
          response={lastResponse}
          curl={toCurl({
            url: new URL(
              "/api/line/send",
              typeof window !== "undefined"
                ? location.origin
                : "http://localhost:3000"
            ).toString(),
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: lastRequest,
          })}
          docsUrl="https://developers.line.biz/ja/reference/messaging-api/#carousel"
        />
      )}
    </div>
  );
}
