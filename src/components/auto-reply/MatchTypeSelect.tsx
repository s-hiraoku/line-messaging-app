'use client';

import { MatchType } from '@prisma/client';

interface MatchTypeSelectProps {
  value: MatchType;
  onChange: (value: MatchType) => void;
}

export function MatchTypeSelect({ value, onChange }: MatchTypeSelectProps) {
  const matchTypes = [
    { value: MatchType.CONTAINS, label: '部分一致', description: 'キーワードがメッセージ内に含まれていればマッチ' },
    { value: MatchType.EXACT, label: '完全一致', description: 'メッセージ全体がキーワードと完全に一致' },
    { value: MatchType.STARTS_WITH, label: '前方一致', description: 'メッセージがキーワードで始まる' },
    { value: MatchType.ENDS_WITH, label: '後方一致', description: 'メッセージがキーワードで終わる' },
  ];

  return (
    <div className="space-y-2">
      {matchTypes.map((type) => (
        <label
          key={type.value}
          className={`flex items-start p-3 rounded-xl cursor-pointer transition-all duration-300 ${
            value === type.value
              ? 'bg-[#00B900]/10 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)]'
              : 'bg-white shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#e8f5e9] hover:-translate-y-0.5'
          }`}
        >
          <input
            type="radio"
            name="matchType"
            value={type.value}
            checked={value === type.value}
            onChange={(e) => onChange(e.target.value as MatchType)}
            className="mt-1 mr-3 h-4 w-4"
          />
          <div>
            <div className="font-bold uppercase tracking-wider text-gray-800 text-sm">{type.label}</div>
            <div className="text-xs font-mono text-gray-500">{type.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
