'use client';

import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full
        transition-all duration-300
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.08)]
        ${checked ? 'bg-[#00B900] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,185,0,0.3)]' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12),0_3px_8px_rgba(0,0,0,0.1)]'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full
          bg-white transition-all duration-300
          shadow-[0_2px_6px_rgba(0,0,0,0.15)]
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
