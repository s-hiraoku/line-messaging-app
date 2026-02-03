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
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">アクティブユーザー</h2>
          <Users className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">アクティブユーザー</h2>
        <Users className="h-5 w-5 text-[#00B900]" />
      </div>

      <ul className="space-y-3">
        {data.map((user, index) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-white hover:bg-[#e8f5e9] transition-colors shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex-shrink-0 w-6 text-center">
              <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
            </div>
            <div className="flex-shrink-0">
              {user.pictureUrl ? (
                <Image
                  src={user.pictureUrl}
                  alt={user.displayName}
                  width={40}
                  height={40}
                  className="rounded-lg shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04)]">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user.displayName}
              </p>
              <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
                <MessageCircle className="h-3 w-3" />
                <span>{user.messageCount} メッセージ</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          メッセージ数が多い順にランキング表示
        </p>
      </div>
    </article>
  );
}
