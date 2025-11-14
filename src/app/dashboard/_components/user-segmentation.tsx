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
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">ユーザーセグメント</h2>
          <Tag className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">タグがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">ユーザーセグメント</h2>
        <Tag className="h-5 w-5 text-[#FFE500]" />
      </div>

      <ul className="space-y-2">
        {data.slice(0, 8).map((tag) => (
          <li
            key={tag.id}
            className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-[#FFFEF5] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 flex-shrink-0 border-2 border-black"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm font-bold text-black truncate">{tag.name}</span>
            </div>
            <div className="flex items-center gap-1 text-black/60 flex-shrink-0 ml-2">
              <Users className="h-3 w-3" />
              <span className="text-sm font-bold font-mono">{tag.userCount}</span>
            </div>
          </li>
        ))}
      </ul>

      {data.length > 8 && (
        <p className="mt-3 text-xs font-bold text-black/60 text-center">
          他 {data.length - 8} 個のタグ
        </p>
      )}

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">
          タグ付けされたユーザー: <span className="text-black font-bold">{totalTaggedUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
