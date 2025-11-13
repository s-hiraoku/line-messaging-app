"use client";

import { useState } from "react";
import { ActionEditor } from "./action-editor";
import type { CardAction } from "./types";

/**
 * Example component demonstrating ActionEditor usage
 *
 * This is a reference implementation showing how to integrate
 * ActionEditor into a card message editor.
 */
export function ActionEditorExample() {
  const [actions, setActions] = useState<CardAction[]>([
    {
      type: "uri",
      label: "詳細を見る",
      uri: "https://example.com",
    },
  ]);

  const handleActionsChange = (newActions: CardAction[]) => {
    setActions(newActions);
    console.log("Actions updated:", newActions);
  };

  return (
    <div className="max-w-2xl space-y-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          ActionEditor Example
        </h2>
        <p className="text-sm text-slate-400">
          このコンポーネントはカードメッセージエディタでのActionEditorの使用例です。
        </p>
      </div>

      <ActionEditor actions={actions} onChange={handleActionsChange} />

      {/* Debug output */}
      <div className="rounded-md border border-slate-700/50 bg-slate-900/60 p-4">
        <h3 className="mb-2 text-sm font-medium text-slate-300">
          Current Actions (JSON)
        </h3>
        <pre className="overflow-x-auto text-xs text-slate-400">
          {JSON.stringify(actions, null, 2)}
        </pre>
      </div>
    </div>
  );
}
