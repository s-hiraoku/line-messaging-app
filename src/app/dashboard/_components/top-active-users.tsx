import { Users, MessageCircle } from "lucide-react";
import Image from "next/image";

type TopUser = {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  messageCount: number;
};

type Props = {
  data: TopUser[];
};

export function TopActiveUsers({ data }: Props) {
  if (data.length === 0) {
    return (
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">アクティブユーザー</h2>
          <Users className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">アクティブユーザー</h2>
        <Users className="h-5 w-5 text-blue-500" />
      </div>

      <ul className="space-y-3">
        {data.map((user, index) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition"
          >
            <div className="flex-shrink-0 w-6 text-center">
              <span className="text-sm font-semibold text-slate-500">#{index + 1}</span>
            </div>
            <div className="flex-shrink-0">
              {user.pictureUrl ? (
                <Image
                  src={user.pictureUrl}
                  alt={user.displayName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.displayName}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MessageCircle className="h-3 w-3" />
                <span>{user.messageCount} メッセージ</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          メッセージ数が多い順にランキング表示
        </p>
      </div>
    </article>
  );
}
