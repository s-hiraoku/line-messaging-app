"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

const dropdownVariants = cva(
  'w-full rounded-lg border bg-slate-900/50 px-4 py-2 text-slate-100 transition-all duration-200 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-slate-700/50 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50',
        error:
          'border-red-500/50 hover:border-red-400/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const menuVariants = cva(
  'absolute z-50 w-full mt-2 rounded-lg border bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-slate-700/50',
        error: 'border-red-500/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  description?: string;
}

export interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

export interface DropdownProps extends VariantProps<typeof dropdownVariants> {
  /** 選択された値 */
  value?: string | string[];
  /** 値が変更されたときのコールバック */
  onChange?: (value: string | string[]) => void;
  /** オプションの配列 */
  options?: DropdownOption[];
  /** グループ化されたオプション */
  groups?: DropdownGroup[];
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 検索機能を有効にする */
  searchable?: boolean;
  /** 検索のプレースホルダー */
  searchPlaceholder?: string;
  /** マルチセレクトを有効にする */
  multiple?: boolean;
  /** 無効状態 */
  disabled?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** カスタムクラス名 */
  className?: string;
  /** 最大選択数（multipleがtrueの場合） */
  maxSelections?: number;
  /** オプションがない場合のメッセージ */
  noOptionsMessage?: string;
}

export function Dropdown({
  value,
  onChange,
  options = [],
  groups = [],
  placeholder = '選択してください',
  searchable = false,
  searchPlaceholder = '検索...',
  multiple = false,
  disabled = false,
  error,
  variant,
  size,
  className,
  maxSelections,
  noOptionsMessage = 'オプションがありません',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasError = !!error;
  const effectiveVariant = hasError ? 'error' : variant;

  // オプションを統合（通常のoptionsとgroupsの両方をサポート）
  const allOptions = useMemo(() => {
    if (groups.length > 0) {
      return groups.flatMap(group => group.options);
    }
    return options;
  }, [options, groups]);

  // 検索フィルタリング
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;

    const query = searchQuery.toLowerCase();
    return allOptions.filter(option =>
      option.label.toLowerCase().includes(query) ||
      option.description?.toLowerCase().includes(query)
    );
  }, [allOptions, searchQuery]);

  // グループ化されたオプションをフィルタリング
  const filteredGroups = useMemo(() => {
    if (groups.length === 0) return [];
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups
      .map(group => ({
        ...group,
        options: group.options.filter(option =>
          option.label.toLowerCase().includes(query) ||
          option.description?.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.options.length > 0);
  }, [groups, searchQuery]);

  // 選択された値を配列として取得
  const selectedValues = useMemo((): string[] => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value as string] : [];
    }
    return value ? [value as string] : [];
  }, [value, multiple]);

  // 選択されたオプションのラベルを取得
  const selectedLabel = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;

    if (multiple) {
      const selectedOptions = allOptions.filter(opt =>
        selectedValues.includes(opt.value)
      );
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length}件選択中`;
    }

    const selected = allOptions.find(opt => opt.value === selectedValues[0]);
    return selected?.label || placeholder;
  }, [selectedValues, allOptions, placeholder, multiple]);

  // オプションが選択されているかチェック
  const isSelected = useCallback((optionValue: string) => {
    return selectedValues.includes(optionValue);
  }, [selectedValues]);

  // オプション選択ハンドラー
  const handleSelect = useCallback((optionValue: string) => {
    if (!onChange) return;

    if (multiple) {
      let newValues: string[];
      if (isSelected(optionValue)) {
        newValues = selectedValues.filter(v => v !== optionValue);
      } else if (maxSelections && selectedValues.length >= maxSelections) {
        newValues = selectedValues;
      } else {
        newValues = [...selectedValues, optionValue];
      }

      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  }, [multiple, isSelected, selectedValues, onChange, maxSelections]);

  // 外部クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ドロップダウンが開いたときに検索入力にフォーカス
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // キーボードナビゲーション
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const displayedOptions = groups.length > 0
      ? filteredGroups.flatMap(g => g.options)
      : filteredOptions;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (displayedOptions[highlightedIndex] && !displayedOptions[highlightedIndex].disabled) {
          handleSelect(displayedOptions[highlightedIndex].value);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < displayedOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
    }
  }, [disabled, isOpen, highlightedIndex, filteredOptions, filteredGroups, groups.length, handleSelect]);

  // 選択をクリア
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(multiple ? [] : '');
    }
  }, [onChange, multiple]);

  // オプションのレンダリング
  const renderOption = (option: DropdownOption, index: number) => {
    const selected = isSelected(option.value);
    const highlighted = index === highlightedIndex;

    return (
      <div
        key={option.value}
        onClick={() => !option.disabled && handleSelect(option.value)}
        className={clsx(
          'px-4 py-2.5 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3',
          {
            'bg-blue-500/20 text-blue-300': highlighted && !option.disabled,
            'bg-slate-800/50': selected && !highlighted,
            'text-slate-400 cursor-not-allowed opacity-50': option.disabled,
            'hover:bg-slate-800/70': !option.disabled && !highlighted,
          }
        )}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {option.icon && (
            <div className="flex-shrink-0 text-slate-400">
              {option.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className={clsx('truncate', selected && 'font-medium text-blue-300')}>
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs text-slate-500 truncate mt-0.5">
                {option.description}
              </div>
            )}
          </div>
        </div>
        {selected && (
          <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={clsx('relative w-full', className)}>
      {/* ドロップダウントリガー */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={clsx(
          dropdownVariants({ variant: effectiveVariant, size }),
          {
            'opacity-50 cursor-not-allowed': disabled,
            'ring-2': isOpen,
          }
        )}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={clsx('truncate flex-1', selectedValues.length === 0 && 'text-slate-500')}>
            {selectedLabel}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {selectedValues.length > 0 && !disabled && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-slate-800 rounded transition-colors"
                type="button"
                aria-label="選択をクリア"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <ChevronDown
              className={clsx(
                'h-5 w-5 text-slate-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={menuVariants({ variant: effectiveVariant })}
          role="listbox"
          aria-multiselectable={multiple}
        >
          {/* 検索入力 */}
          {searchable && (
            <div className="p-2 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* オプションリスト */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {groups.length > 0 ? (
              // グループ化されたオプション
              filteredGroups.length > 0 ? (
                filteredGroups.map((group, groupIndex) => (
                  <div key={group.label}>
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50 sticky top-0">
                      {group.label}
                    </div>
                    {group.options.map((option, optionIndex) => {
                      const globalIndex = filteredGroups
                        .slice(0, groupIndex)
                        .reduce((acc, g) => acc + g.options.length, 0) + optionIndex;
                      return renderOption(option, globalIndex);
                    })}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  {noOptionsMessage}
                </div>
              )
            ) : (
              // 通常のオプション
              filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => renderOption(option, index))
              ) : (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  {noOptionsMessage}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}

      {/* カスタムスクロールバーのスタイル */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>
  );
}
