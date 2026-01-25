import { Tag, Users } from "lucide-react";

type TagStat = {
  id: string;
  name: string;
  color: string;
  userCount: number;
};

type Props = {
  data: TagStat[];
};

export function UserSegmentation({ data }: Props) {
  const totalTaggedUsers = data.reduce((sum, tag) => sum + tag.userCount, 0);

  if (data.length === 0) {
    return (
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">ユーザーセグメント</h2>
          <Tag className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">タグがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">ユーザーセグメント</h2>
        <Tag className="h-5 w-5 text-[#FFE500]" />
      </div>

      <ul className="space-y-2">
        {data.slice(0, 8).map((tag) => (
          <li
            key={tag.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-[#e8f5e9] transition-colors shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 flex-shrink-0 rounded-sm shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm font-bold text-gray-800 truncate">{tag.name}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 flex-shrink-0 ml-2">
              <Users className="h-3 w-3" />
              <span className="text-sm font-bold font-mono">{tag.userCount}</span>
            </div>
          </li>
        ))}
      </ul>

      {data.length > 8 && (
        <p className="mt-3 text-xs font-bold text-gray-500 text-center">
          他 {data.length - 8} 個のタグ
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          タグ付けされたユーザー: <span className="text-gray-800 font-bold">{totalTaggedUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
