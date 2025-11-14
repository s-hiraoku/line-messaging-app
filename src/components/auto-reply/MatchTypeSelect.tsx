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
          className={`flex items-start p-3 border-2 border-black cursor-pointer transition-all ${
            value === type.value
              ? 'bg-[#00B900]/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white hover:bg-[#FFFEF5] hover:translate-x-[1px] hover:translate-y-[1px]'
          }`}
        >
          <input
            type="radio"
            name="matchType"
            value={type.value}
            checked={value === type.value}
            onChange={(e) => onChange(e.target.value as MatchType)}
            className="mt-1 mr-3 h-4 w-4 border-2 border-black"
          />
          <div>
            <div className="font-bold uppercase tracking-wider text-black text-sm">{type.label}</div>
            <div className="text-xs font-mono text-black/60">{type.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
