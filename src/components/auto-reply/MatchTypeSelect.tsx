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
          className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
            value === type.value
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
          }`}
        >
          <input
            type="radio"
            name="matchType"
            value={type.value}
            checked={value === type.value}
            onChange={(e) => onChange(e.target.value as MatchType)}
            className="mt-1 mr-3"
          />
          <div>
            <div className="font-medium text-slate-200">{type.label}</div>
            <div className="text-sm text-slate-400">{type.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
