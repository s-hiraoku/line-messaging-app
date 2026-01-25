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

type TemplateType = "buttons" | "confirm";

type ActionType = "uri" | "message" | "postback";

interface TemplateAction {
  type: ActionType;
  label: string;
  uri?: string;
  text?: string;
  data?: string;
}

export default function TemplateMessagePage() {
  const [lineUserId, setLineUserId] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("buttons");
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  const [actions, setActions] = useState<TemplateAction[]>([
    { type: "uri", label: "ウェブサイトを開く", uri: "https://example.com" },
  ]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<unknown>();
  const [lastResponse, setLastResponse] = useState<unknown>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      // Build template based on type
      const template: any = {
        type: templateType,
        text,
        actions,
      };

      // Add optional fields only for buttons template
      if (templateType === "buttons") {
        if (title) {
          template.title = title;
        }
        if (thumbnailImageUrl) {
          template.thumbnailImageUrl = thumbnailImageUrl;
        }
      }

      const payload = {
        to: lineUserId,
        messages: [{
          type: "template",
          altText,
          template,
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

      const data = await response.json().catch(() => ({}));
      setLastResponse(data);

      if (!response.ok) {
        throw new Error(data.error ?? "テンプレートメッセージの送信に失敗しました");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    }
  };

  const addAction = () => {
    const maxActions = templateType === "confirm" ? 2 : 4;
    if (actions.length >= maxActions) {
      setError(`アクションは最大${maxActions}個までです`);
      return;
    }
    setActions([
      ...actions,
      { type: "uri", label: "ボタン", uri: "https://example.com" },
    ]);
  };

  const removeAction = (index: number) => {
    const minActions = templateType === "confirm" ? 2 : 1;
    if (actions.length <= minActions) {
      setError(
        `${templateType === "confirm" ? "確認テンプレートには2つのアクションが必要です" : "最低1つのアクションが必要です"}`
      );
      return;
    }
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (field === "type") {
      const newAction: TemplateAction = {
        type: value as ActionType,
        label: newActions[index].label,
      };
      if (value === "uri") {
        newAction.uri = "https://example.com";
      } else if (value === "message") {
        newAction.text = "送信テキスト";
      } else if (value === "postback") {
        newAction.data = "action=example";
      }
      newActions[index] = newAction;
    } else {
      newActions[index] = {
        ...newActions[index],
        [field]: value,
      };
    }
    setActions(newActions);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className={`text-5xl font-black text-gray-800 ${syne.className}`}>テンプレートメッセージ</h1>
          <div className="h-2 w-12 rotate-12 bg-[#FFE500] rounded-full" />
        </div>
        <p className={`text-base text-gray-500 ${ibmPlexSans.className}`}>
          ボタンや確認テンプレートを使ったメッセージを送信できます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-[#e8f5e9] p-6 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
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
          <label htmlFor="templateType" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            テンプレートタイプ <span className="text-red-600">*</span>
          </label>
          <select
            id="templateType"
            value={templateType}
            onChange={(event) => {
              const newType = event.target.value as TemplateType;
              setTemplateType(newType);
              // Adjust actions count based on template type
              if (newType === "confirm" && actions.length > 2) {
                setActions(actions.slice(0, 2));
              } else if (newType === "confirm" && actions.length < 2) {
                setActions([
                  ...actions,
                  { type: "uri", label: "ボタン", uri: "https://example.com" },
                ]);
              }
            }}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
          >
            <option value="buttons">ボタン (Buttons)</option>
            <option value="confirm">確認 (Confirm)</option>
          </select>
          <p className="text-xs font-mono text-gray-500">
            {templateType === "buttons"
              ? "最大4つのアクションボタンを含むテンプレート"
              : "2つのアクションボタンで確認を促すテンプレート"}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="altText" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            代替テキスト <span className="text-red-600">*</span>
          </label>
          <input
            id="altText"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={400}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="通知テキスト"
            required
          />
          <p className="text-xs font-mono text-gray-500">最大400文字</p>
        </div>

        {templateType === "buttons" && (
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-gray-800">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={40}
              className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
              placeholder="メニュー"
            />
            <p className="text-xs font-mono text-gray-500">オプション、最大40文字</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="text" className="text-sm font-bold uppercase tracking-wider text-gray-800">
            本文 <span className="text-red-600">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={templateType === "confirm" ? 240 : 160}
            className="h-24 w-full rounded-xl bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
            placeholder="以下からお選びください"
            required
          />
          <p className="text-xs font-mono text-gray-500">
            最大{templateType === "confirm" ? "240" : "160"}文字
          </p>
        </div>

        {templateType === "buttons" && (
          <div className="space-y-2">
            <label htmlFor="thumbnailImageUrl" className="text-sm font-bold uppercase tracking-wider text-gray-800">
              サムネイル画像URL
            </label>
            <input
              id="thumbnailImageUrl"
              type="url"
              value={thumbnailImageUrl}
              onChange={(event) => setThumbnailImageUrl(event.target.value)}
              className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs font-mono text-gray-500">オプション、HTTPS、最大1024x1024px、JPEG/PNG</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-800">
              アクション <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              onClick={addAction}
              disabled={actions.length >= 4}
              className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-800 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              アクションを追加
            </button>
          </div>

          {actions.map((action, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  アクション {index + 1}
                </span>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">ラベル</label>
                  <input
                    type="text"
                    value={action.label}
                    onChange={(e) => updateAction(index, "label", e.target.value)}
                    maxLength={20}
                    className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
                    placeholder="ボタンテキスト"
                    required
                  />
                  <p className="text-xs font-mono text-gray-500">最大20文字</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">アクションタイプ</label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, "type", e.target.value)}
                    className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                    <option value="postback">ポストバック</option>
                  </select>
                </div>
              </div>

              {action.type === "uri" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">URL</label>
                  <input
                    type="url"
                    value={action.uri || ""}
                    onChange={(e) => updateAction(index, "uri", e.target.value)}
                    className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}

              {action.type === "message" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">送信テキスト</label>
                  <input
                    type="text"
                    value={action.text || ""}
                    onChange={(e) => updateAction(index, "text", e.target.value)}
                    maxLength={300}
                    className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
                    placeholder="送信されるメッセージ"
                    required
                  />
                </div>
              )}

              {action.type === "postback" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">データ</label>
                  <input
                    type="text"
                    value={action.data || ""}
                    onChange={(e) => updateAction(index, "data", e.target.value)}
                    maxLength={300}
                    className="w-full rounded-xl bg-white px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#00B900] focus:ring-offset-2 transition-all"
                    placeholder="action=example&id=123"
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-gray-300 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-[#00B900] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0.5 active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"
            disabled={status === "sending" || !lineUserId || !altText || !text}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm font-bold text-[#00B900]">テンプレートメッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm font-bold text-red-600">{error}</p>}
        </div>
      </form>

      {/* Preview */}
      <LineConversation
        message={{
          type: "template",
          altText,
          title,
          text: text || "本文を入力してください",
          thumbnailImageUrl,
          actions,
        }}
      />

      {/* Debug Panel */}
      <DebugPanel
        title="送信 API デバッグ"
        request={lastRequest}
        response={lastResponse}
        curl={lastRequest ? toCurl({
          url: typeof window !== 'undefined' ? `${window.location.origin}/api/line/send` : 'http://localhost:3000/api/line/send',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: lastRequest
        }) : undefined}
        docsUrl="https://developers.line.biz/ja/reference/messaging-api/#template-messages"
      />
    </div>
  );
}
