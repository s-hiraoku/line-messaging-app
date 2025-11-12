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
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="hover:text-blue-300"
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
        className="w-full px-3 py-2 border border-slate-700 bg-slate-900/60 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 disabled:opacity-50"
        disabled={keywords.length >= maxKeywords}
      />
      <p className="text-sm text-slate-500">
        {keywords.length} / {maxKeywords} キーワード
      </p>
    </div>
  );
}
