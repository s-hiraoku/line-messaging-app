"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import type { CardAction } from "./types";

interface ActionEditorProps {
  actions: CardAction[];
  onChange: (actions: CardAction[]) => void;
  maxActions?: number;
}

/**
 * ActionEditor Component
 *
 * Manages card actions (URI, Message, Postback) for card messages.
 * Supports add/edit/delete operations with real-time validation.
 *
 * Features:
 * - Maximum 3 actions per card (LINE API limitation)
 * - Type-specific input fields with validation
 * - Clear error messages for user guidance
 * - Dark theme UI matching app style
 */
export function ActionEditor({
  actions,
  onChange,
  maxActions = 3,
}: ActionEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate actions on mount and when actions change
  useEffect(() => {
    validateAllActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  /**
   * Validates an action and returns error message if invalid
   */
  const validateAction = (
    action: CardAction,
    index: number
  ): Record<string, string> => {
    const actionErrors: Record<string, string> = {};

    // Label validation (required, max 20 characters)
    if (!action.label || action.label.trim().length === 0) {
      actionErrors[`${index}.label`] = "ラベルは必須です";
    } else if (action.label.length > 20) {
      actionErrors[`${index}.label`] = "ラベルは20文字以内で入力してください";
    }

    // Type-specific validation
    if (action.type === "uri") {
      if (!action.uri || action.uri.trim().length === 0) {
        actionErrors[`${index}.uri`] = "URLは必須です";
      } else if (!action.uri.startsWith("https://")) {
        actionErrors[`${index}.uri`] = "URLはHTTPSで始まる必要があります";
      }
    } else if (action.type === "message") {
      if (!action.text || action.text.trim().length === 0) {
        actionErrors[`${index}.text`] = "メッセージテキストは必須です";
      } else if (action.text.length > 300) {
        actionErrors[`${index}.text`] =
          "メッセージテキストは300文字以内で入力してください";
      }
    } else if (action.type === "postback") {
      if (!action.data || action.data.trim().length === 0) {
        actionErrors[`${index}.data`] = "ポストバックデータは必須です";
      } else if (action.data.length > 300) {
        actionErrors[`${index}.data`] =
          "ポストバックデータは300文字以内で入力してください";
      }

      // Optional displayText validation
      if (action.displayText && action.displayText.length > 300) {
        actionErrors[`${index}.displayText`] =
          "表示テキストは300文字以内で入力してください";
      }
    }

    return actionErrors;
  };

  /**
   * Validates all actions and updates error state
   */
  const validateAllActions = (actionsToValidate: CardAction[]) => {
    const newErrors: Record<string, string> = {};

    actionsToValidate.forEach((action, index) => {
      const actionErrors = validateAction(action, index);
      Object.assign(newErrors, actionErrors);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles action type change with default values
   */
  const handleActionTypeChange = (index: number, newType: CardAction["type"]) => {
    const updatedActions = [...actions];
    const currentLabel = actions[index].label;

    // Create new action with default values based on type
    let newAction: CardAction;
    if (newType === "uri") {
      newAction = {
        type: "uri",
        label: currentLabel || "リンク",
        uri: "https://example.com",
      };
    } else if (newType === "message") {
      newAction = {
        type: "message",
        label: currentLabel || "選択",
        text: "",
      };
    } else {
      newAction = {
        type: "postback",
        label: currentLabel || "送信",
        data: "",
        displayText: undefined,
      };
    }

    updatedActions[index] = newAction;
    onChange(updatedActions);
    validateAllActions(updatedActions);
  };

  /**
   * Updates a specific field of an action
   */
  const handleActionUpdate = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedActions = [...actions];
    const action = updatedActions[index];

    // Update the specific field
    if (field === "label") {
      action.label = value;
    } else if (action.type === "uri" && field === "uri") {
      action.uri = value;
    } else if (action.type === "message" && field === "text") {
      action.text = value;
    } else if (action.type === "postback") {
      if (field === "data") {
        action.data = value;
      } else if (field === "displayText") {
        action.displayText = value || undefined;
      }
    }

    onChange(updatedActions);
    validateAllActions(updatedActions);
  };

  /**
   * Adds a new action with default URI type
   */
  const handleAddAction = () => {
    if (actions.length >= maxActions) return;

    const newAction: CardAction = {
      type: "uri",
      label: "リンク",
      uri: "https://example.com",
    };

    const updatedActions = [...actions, newAction];
    onChange(updatedActions);
    validateAllActions(updatedActions);
  };

  /**
   * Removes an action by index
   */
  const handleDeleteAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index);
    onChange(updatedActions);
    validateAllActions(updatedActions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          アクション <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={handleAddAction}
          disabled={actions.length >= maxActions}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          アクションを追加
        </button>
      </div>

      {actions.length === 0 && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4 text-center">
          <p className="text-sm text-slate-400">
            アクションが設定されていません。アクションを追加してください。
          </p>
        </div>
      )}

      {actions.map((action, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-300">
              アクション {index + 1}
            </span>
            <button
              type="button"
              onClick={() => handleDeleteAction(index)}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Action Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">アクションタイプ</label>
            <select
              value={action.type}
              onChange={(e) =>
                handleActionTypeChange(
                  index,
                  e.target.value as CardAction["type"]
                )
              }
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="uri">リンク (URI)</option>
              <option value="message">メッセージ</option>
              <option value="postback">ポストバック</option>
            </select>
          </div>

          {/* Label Input (Common for all types) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              ラベル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={action.label}
              onChange={(e) => handleActionUpdate(index, "label", e.target.value)}
              maxLength={20}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ボタンラベル (最大20文字)"
            />
            {errors[`${index}.label`] && (
              <p className="text-xs text-red-400">{errors[`${index}.label`]}</p>
            )}
            <p className="text-xs text-slate-500">{action.label.length}/20文字</p>
          </div>

          {/* Type-specific inputs */}
          {action.type === "uri" && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">
                URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={action.uri}
                onChange={(e) => handleActionUpdate(index, "uri", e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com"
              />
              {errors[`${index}.uri`] && (
                <p className="text-xs text-red-400">{errors[`${index}.uri`]}</p>
              )}
            </div>
          )}

          {action.type === "message" && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">
                メッセージテキスト <span className="text-red-400">*</span>
              </label>
              <textarea
                value={action.text}
                onChange={(e) => handleActionUpdate(index, "text", e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="送信されるメッセージテキスト"
              />
              {errors[`${index}.text`] && (
                <p className="text-xs text-red-400">{errors[`${index}.text`]}</p>
              )}
              <p className="text-xs text-slate-500">{action.text.length}/300文字</p>
            </div>
          )}

          {action.type === "postback" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">
                  ポストバックデータ <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={action.data}
                  onChange={(e) => handleActionUpdate(index, "data", e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="action=buy&item_id=123"
                />
                {errors[`${index}.data`] && (
                  <p className="text-xs text-red-400">{errors[`${index}.data`]}</p>
                )}
                <p className="text-xs text-slate-500">{action.data.length}/300文字</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">
                  表示テキスト (オプション)
                </label>
                <input
                  type="text"
                  value={action.displayText || ""}
                  onChange={(e) =>
                    handleActionUpdate(index, "displayText", e.target.value)
                  }
                  maxLength={300}
                  className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ユーザーに表示されるテキスト"
                />
                {errors[`${index}.displayText`] && (
                  <p className="text-xs text-red-400">
                    {errors[`${index}.displayText`]}
                  </p>
                )}
                {action.displayText && (
                  <p className="text-xs text-slate-500">
                    {action.displayText.length}/300文字
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {actions.length > 0 && (
        <p className="text-xs text-slate-500">
          {actions.length}/{maxActions} アクション使用中
        </p>
      )}
    </div>
  );
}
