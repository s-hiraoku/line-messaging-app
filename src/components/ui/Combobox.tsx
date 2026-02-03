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
              "flex h-10 w-full items-center justify-between rounded-xl bg-white px-4 py-2 text-sm font-mono text-gray-800 transition-all duration-300",
              "shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]",
              error
                ? "shadow-[inset_0_2px_4px_rgba(239,68,68,0.1),0_2px_8px_rgba(239,68,68,0.2)] bg-red-50"
                : "hover:-translate-y-0.5 hover:shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8),0_6px_16px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8),0_6px_16px_rgba(0,185,0,0.15)]",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
              !selectedOption && "text-gray-400"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedOption?.icon && (
                <div className="flex-shrink-0 text-gray-500">
                  {selectedOption.icon}
                </div>
              )}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] rounded-xl bg-white p-0",
              "shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.12)]",
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
              <div className="flex items-center border-b border-gray-100 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                <CommandPrimitive.Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onValueChange={setSearch}
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-gray-800 font-mono outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <CommandPrimitive.List className="max-h-[300px] overflow-y-auto p-1">
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-gray-400 font-mono">
                  {emptyMessage}
                </CommandPrimitive.Empty>

                {groups.length > 0 ? (
                  // グループ化されたオプション
                  groups.map((group) => (
                    <CommandPrimitive.Group
                      key={group.label}
                      heading={group.label}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
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
                            "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-mono outline-none transition-colors",
                            "data-[selected='true']:bg-[#e8f5e9] data-[selected='true']:text-gray-800",
                            "hover:bg-[#e8f5e9]",
                            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {option.icon && (
                              <div className="flex-shrink-0 text-gray-500">
                                {option.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-gray-500 truncate">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {value === option.value && (
                            <Check className="ml-2 h-4 w-4 text-[#00B900] flex-shrink-0" />
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
                        "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-mono outline-none transition-colors",
                        "data-[selected='true']:bg-[#e8f5e9] data-[selected='true']:text-gray-800",
                        "hover:bg-[#e8f5e9]",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {option.icon && (
                          <div className="flex-shrink-0 text-gray-500">
                            {option.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {value === option.value && (
                        <Check className="ml-2 h-4 w-4 text-[#00B900] flex-shrink-0" />
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
        <p id={errorId} className="mt-1.5 text-sm text-red-500 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
