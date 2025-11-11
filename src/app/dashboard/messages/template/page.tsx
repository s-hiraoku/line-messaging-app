"use client";

import { useState } from "react";
import { LineConversation } from "../_components/line-conversation";

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

      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: lineUserId,
          type: "template",
          altText,
          template,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
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
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">テンプレートメッセージ送信</h1>
        <p className="text-sm text-slate-400">
          ボタン付きのリッチなメッセージを送信できます。
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
          <label htmlFor="templateType" className="text-sm font-medium text-slate-300">
            テンプレートタイプ <span className="text-red-400">*</span>
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
            className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="buttons">ボタン (Buttons)</option>
            <option value="confirm">確認 (Confirm)</option>
          </select>
          <p className="text-xs text-slate-500">
            {templateType === "buttons"
              ? "最大4つのアクションボタンを含むテンプレート"
              : "2つのアクションボタンで確認を促すテンプレート"}
          </p>
        </div>

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
            placeholder="通知テキスト"
            required
          />
          <p className="text-xs text-slate-500">最大400文字</p>
        </div>

        {templateType === "buttons" && (
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-300">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={40}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="メニュー"
            />
            <p className="text-xs text-slate-500">オプション、最大40文字</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="text" className="text-sm font-medium text-slate-300">
            本文 <span className="text-red-400">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={templateType === "confirm" ? 240 : 160}
            className="h-24 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="以下からお選びください"
            required
          />
          <p className="text-xs text-slate-500">
            最大{templateType === "confirm" ? "240" : "160"}文字
          </p>
        </div>

        {templateType === "buttons" && (
          <div className="space-y-2">
            <label htmlFor="thumbnailImageUrl" className="text-sm font-medium text-slate-300">
              サムネイル画像URL
            </label>
            <input
              id="thumbnailImageUrl"
              type="url"
              value={thumbnailImageUrl}
              onChange={(event) => setThumbnailImageUrl(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-slate-500">オプション、HTTPS、最大1024x1024px、JPEG/PNG</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              アクション <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={addAction}
              disabled={actions.length >= 4}
              className="inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="space-y-3 rounded-md border border-slate-700/50 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  アクション {index + 1}
                </span>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    削除
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">ラベル</label>
                  <input
                    type="text"
                    value={action.label}
                    onChange={(e) => updateAction(index, "label", e.target.value)}
                    maxLength={20}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ボタンテキスト"
                    required
                  />
                  <p className="text-xs text-slate-500">最大20文字</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">アクションタイプ</label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, "type", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="uri">リンク (URI)</option>
                    <option value="message">メッセージ</option>
                    <option value="postback">ポストバック</option>
                  </select>
                </div>
              </div>

              {action.type === "uri" && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">URL</label>
                  <input
                    type="url"
                    value={action.uri || ""}
                    onChange={(e) => updateAction(index, "uri", e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}

              {action.type === "message" && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">送信テキスト</label>
                  <input
                    type="text"
                    value={action.text || ""}
                    onChange={(e) => updateAction(index, "text", e.target.value)}
                    maxLength={300}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="送信されるメッセージ"
                    required
                  />
                </div>
              )}

              {action.type === "postback" && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">データ</label>
                  <input
                    type="text"
                    value={action.data || ""}
                    onChange={(e) => updateAction(index, "data", e.target.value)}
                    maxLength={300}
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="action=example&id=123"
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "sending" || !lineUserId || !altText || !text}
          >
            {status === "sending" ? "送信中..." : "送信"}
          </button>
          {status === "success" && (
            <p className="text-sm text-green-400">テンプレートメッセージを送信しました。</p>
          )}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
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
      <details className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 shadow-lg backdrop-blur-sm">
        <summary className="cursor-pointer text-sm font-medium text-slate-300">
          デバッグ情報
        </summary>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-400">Request Body</div>
            <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
              {JSON.stringify(
                {
                  to: lineUserId || "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                  type: "template",
                  altText,
                  template: {
                    type: "buttons",
                    ...(title && { title }),
                    text,
                    ...(thumbnailImageUrl && { thumbnailImageUrl }),
                    actions,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
