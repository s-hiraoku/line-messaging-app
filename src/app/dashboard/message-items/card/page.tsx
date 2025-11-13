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
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
        <h2 className="mb-2 text-sm font-semibold text-blue-300">
          カードメッセージとは？
        </h2>
        <p className="text-xs text-slate-400">
          複数のカードをカルーセル形式で表示できるインタラクティブなメッセージです。
          各カードには画像、タイトル、説明、アクションボタン（最大3つ）を設定できます。
          商品紹介、場所案内、人物紹介など、視覚的に情報を伝えたい場面に最適です。
        </p>
        {hasSavedData && savedAt && (
          <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
            <span>💾</span>
            <span>
              前回の編集内容が復元されました（
              {new Date(savedAt).toLocaleString('ja-JP')}）
            </span>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 shadow-lg backdrop-blur-sm"
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

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4">
            <h4 className="mb-2 text-sm font-semibold text-red-400">
              入力エラー
            </h4>
            <ul className="space-y-1 text-xs text-red-300">
              {validationErrors.map((err, index) => (
                <li key={index}>・{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button and Status */}
        <div className="flex flex-col gap-3 border-t border-slate-700/50 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === "sending" || !isFormValid}
            >
              {status === "sending" ? "送信中..." : "送信"}
            </button>

            {/* Success Message */}
            {status === "success" && (
              <p className="text-sm text-green-400">
                ✓ メッセージを送信しました
              </p>
            )}

            {/* Error Message */}
            {status === "error" && error && (
              <p className="text-sm text-red-400">✗ {error}</p>
            )}
          </div>

          {/* Validation Hints */}
          {status !== "sending" && !isFormValid && (
            <div className="space-y-1 text-xs text-yellow-400">
              {!lineUserId && <p>⚠️ 送信先ユーザーを選択してください</p>}
              {!altText.trim() && <p>⚠️ 代替テキストを入力してください</p>}
              {altText.length > 400 && (
                <p>⚠️ 代替テキストは400文字以内で入力してください</p>
              )}
              {cards.length === 0 && <p>⚠️ 最低1つのカードを作成してください</p>}
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
