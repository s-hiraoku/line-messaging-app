"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  SelectRadix as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/SelectRadix";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
        <Label className="text-sm font-bold uppercase tracking-wider text-black">
          アクション <span className="text-red-600">*</span>
        </Label>
        <Button
          type="button"
          onClick={handleAddAction}
          disabled={actions.length >= maxActions}
          size="sm"
          className="inline-flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="h-3.5 w-3.5" />
          アクションを追加
        </Button>
      </div>

      {actions.length === 0 && (
        <div className="border-2 border-black bg-[#FFFEF5] p-4 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-mono text-black/60">
            アクションが設定されていません。アクションを追加してください。
          </p>
        </div>
      )}

      {actions.length > 0 && (
        <Accordion type="multiple" className="space-y-2" defaultValue={actions.map((_, i) => `action-${i}`)}>
          {actions.map((action, index) => (
            <AccordionItem
              key={index}
              value={`action-${index}`}
              className="border-2 border-black bg-white px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-2">
                <AccordionTrigger className="flex-1 py-3 text-sm font-bold text-black hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {index + 1}
                    </Badge>
                    <span className="flex-1 text-left truncate uppercase tracking-wider">
                      {action.label || "未設定"}
                    </span>
                    <Badge variant="secondary" className="text-xs border-2 border-black bg-[#FFFEF5]">
                      {action.type === "uri" && "リンク"}
                      {action.type === "message" && "メッセージ"}
                      {action.type === "postback" && "ポストバック"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAction(index)}
                  className="cursor-pointer p-1.5 text-black hover:text-white hover:bg-red-600 h-8 w-8 border-2 border-black"
                  title="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <AccordionContent className="space-y-4 pb-4 pt-2">
                {/* Action Type Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-black/60">アクションタイプ</Label>
                  <Select
                    value={action.type}
                    onValueChange={(value) =>
                      handleActionTypeChange(index, value as CardAction["type"])
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uri">リンク (URI)</SelectItem>
                      <SelectItem value="message">メッセージ</SelectItem>
                      <SelectItem value="postback">ポストバック</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Label Input (Common for all types) */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-black/60">
                    ラベル <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={action.label}
                    onChange={(e) => handleActionUpdate(index, "label", e.target.value)}
                    maxLength={20}
                    className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="ボタンラベル (最大20文字)"
                  />
                  {errors[`${index}.label`] && (
                    <p className="text-xs font-bold text-red-600">{errors[`${index}.label`]}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-black/40">最大20文字</span>
                    <Badge variant="outline" className="text-xs border-2 border-black">
                      {action.label.length}/20
                    </Badge>
                  </div>
                </div>

                {/* Type-specific inputs */}
                {action.type === "uri" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-black/60">
                      URL <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      type="url"
                      value={action.uri}
                      onChange={(e) => handleActionUpdate(index, "uri", e.target.value)}
                      className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      placeholder="https://example.com"
                    />
                    {errors[`${index}.uri`] && (
                      <p className="text-xs font-bold text-red-600">{errors[`${index}.uri`]}</p>
                    )}
                  </div>
                )}

                {action.type === "message" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-black/60">
                      メッセージテキスト <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      value={action.text}
                      onChange={(e) => handleActionUpdate(index, "text", e.target.value)}
                      maxLength={300}
                      rows={3}
                      className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      placeholder="送信されるメッセージテキスト"
                    />
                    {errors[`${index}.text`] && (
                      <p className="text-xs font-bold text-red-600">{errors[`${index}.text`]}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-black/40">最大300文字</span>
                      <Badge variant="outline" className="text-xs border-2 border-black">
                        {action.text.length}/300
                      </Badge>
                    </div>
                  </div>
                )}

                {action.type === "postback" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-black/60">
                        ポストバックデータ <span className="text-red-600">*</span>
                      </Label>
                      <Textarea
                        value={action.data}
                        onChange={(e) => handleActionUpdate(index, "data", e.target.value)}
                        maxLength={300}
                        rows={2}
                        className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="action=buy&item_id=123"
                      />
                      {errors[`${index}.data`] && (
                        <p className="text-xs font-bold text-red-600">{errors[`${index}.data`]}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-black/40">最大300文字</span>
                        <Badge variant="outline" className="text-xs border-2 border-black">
                          {action.data.length}/300
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-black/60">
                        表示テキスト (オプション)
                      </Label>
                      <Input
                        type="text"
                        value={action.displayText || ""}
                        onChange={(e) =>
                          handleActionUpdate(index, "displayText", e.target.value)
                        }
                        maxLength={300}
                        className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="ユーザーに表示されるテキスト"
                      />
                      {errors[`${index}.displayText`] && (
                        <p className="text-xs font-bold text-red-600">
                          {errors[`${index}.displayText`]}
                        </p>
                      )}
                      {action.displayText && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-black/40">最大300文字</span>
                          <Badge variant="outline" className="text-xs border-2 border-black">
                            {action.displayText.length}/300
                          </Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {actions.length > 0 && (
        <div className="flex items-center justify-between text-xs font-mono text-black/60">
          <span>アクション使用中</span>
          <Badge variant="outline" className="border-2 border-black">
            {actions.length}/{maxActions}
          </Badge>
        </div>
      )}
    </div>
  );
}
