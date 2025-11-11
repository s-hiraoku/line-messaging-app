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
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">ユーザーセグメント</h2>
          <Tag className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">タグがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">ユーザーセグメント</h2>
        <Tag className="h-5 w-5 text-yellow-500" />
      </div>

      <ul className="space-y-2">
        {data.slice(0, 8).map((tag) => (
          <li
            key={tag.id}
            className="flex items-center justify-between p-2 rounded hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm text-slate-200 truncate">{tag.name}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 flex-shrink-0 ml-2">
              <Users className="h-3 w-3" />
              <span className="text-sm font-medium">{tag.userCount}</span>
            </div>
          </li>
        ))}
      </ul>

      {data.length > 8 && (
        <p className="mt-3 text-xs text-slate-500 text-center">
          他 {data.length - 8} 個のタグ
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          タグ付けされたユーザー: <span className="text-white font-medium">{totalTaggedUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
