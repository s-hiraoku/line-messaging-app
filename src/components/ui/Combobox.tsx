"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

export interface ComboboxProps {
  /** 選択された値 */
  value?: string;
  /** 値が変更されたときのコールバック */
  onValueChange?: (value: string) => void;
  /** オプションの配列 */
  options?: ComboboxOption[];
  /** グループ化されたオプション */
  groups?: ComboboxGroup[];
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 検索のプレースホルダー */
  searchPlaceholder?: string;
  /** オプションがない場合のメッセージ */
  emptyMessage?: string;
  /** 無効状態 */
  disabled?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** カスタムクラス名 */
  className?: string;
}

export function Combobox({
  value,
  onValueChange,
  options = [],
  groups = [],
  placeholder = "選択してください...",
  searchPlaceholder = "検索...",
  emptyMessage = "該当するオプションがありません",
  disabled = false,
  error,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const errorId = React.useId();

  // オプションを統合（通常のoptionsとgroupsの両方をサポート）
  const allOptions = React.useMemo(() => {
    if (groups.length > 0) {
      return groups.flatMap((group) => group.options);
    }
    return options;
  }, [options, groups]);

  // 選択されたオプションを取得
  const selectedOption = allOptions.find((option) => option.value === value);

  return (
    <div className={cn("w-full", className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border bg-slate-900/50 px-4 py-2 text-sm transition-all duration-200",
              error
                ? "border-red-500/50 hover:border-red-400/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                : "border-slate-700/50 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50",
              "focus:outline-none focus:ring-offset-2 focus:ring-offset-slate-950",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !selectedOption && "text-slate-500"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedOption?.icon && (
                <div className="flex-shrink-0 text-slate-400">
                  {selectedOption.icon}
                </div>
              )}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-0 shadow-2xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            align="start"
            sideOffset={4}
          >
            <CommandPrimitive
              className="w-full"
              filter={(value, search) => {
                const option = allOptions.find((opt) => opt.value === value);
                if (!option) return 0;

                const searchLower = search.toLowerCase();
                const labelMatch = option.label.toLowerCase().includes(searchLower);
                const descMatch = option.description?.toLowerCase().includes(searchLower);

                return labelMatch || descMatch ? 1 : 0;
              }}
            >
              <div className="flex items-center border-b border-slate-700/50 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandPrimitive.Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onValueChange={setSearch}
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <CommandPrimitive.List className="max-h-[300px] overflow-y-auto p-1">
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-slate-500">
                  {emptyMessage}
                </CommandPrimitive.Empty>

                {groups.length > 0 ? (
                  // グループ化されたオプション
                  groups.map((group) => (
                    <CommandPrimitive.Group
                      key={group.label}
                      heading={group.label}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                    >
                      {group.options.map((option) => (
                        <CommandPrimitive.Item
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          onSelect={(currentValue) => {
                            onValueChange?.(currentValue === value ? "" : currentValue);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors",
                            "data-[selected='true']:bg-blue-500/20 data-[selected='true']:text-blue-300",
                            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {option.icon && (
                              <div className="flex-shrink-0 text-slate-400">
                                {option.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-slate-500 truncate">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {value === option.value && (
                            <Check className="ml-2 h-4 w-4 text-blue-400 flex-shrink-0" />
                          )}
                        </CommandPrimitive.Item>
                      ))}
                    </CommandPrimitive.Group>
                  ))
                ) : (
                  // 通常のオプション
                  options.map((option) => (
                    <CommandPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={(currentValue) => {
                        onValueChange?.(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors",
                        "data-[selected='true']:bg-blue-500/20 data-[selected='true']:text-blue-300",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {option.icon && (
                          <div className="flex-shrink-0 text-slate-400">
                            {option.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-slate-500 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {value === option.value && (
                        <Check className="ml-2 h-4 w-4 text-blue-400 flex-shrink-0" />
                      )}
                    </CommandPrimitive.Item>
                  ))
                )}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* エラーメッセージ */}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
