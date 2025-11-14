'use client';

import { useState, KeyboardEvent } from 'react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
}

export function KeywordInput({ keywords, onChange, maxKeywords = 20 }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();

      if (keywords.includes(trimmedValue)) {
        // Keyword already exists
        return;
      }

      if (keywords.length >= maxKeywords) {
        // Max keywords reached
        return;
      }

      onChange([...keywords, trimmedValue]);
      setInputValue('');
    }
  };

  const removeKeyword = (index: number) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 border-2 border-black bg-[#FFFEF5] text-black text-sm font-mono"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="font-bold hover:text-red-600 transition-colors"
              aria-label={`Remove ${keyword}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="キーワードを入力してEnterキーで追加"
        className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono text-black placeholder-black/40 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all disabled:opacity-50"
        disabled={keywords.length >= maxKeywords}
      />
      <p className="text-xs font-mono text-black/60">
        {keywords.length} / {maxKeywords} キーワード
      </p>
    </div>
  );
}
