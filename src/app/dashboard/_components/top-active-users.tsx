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
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">アクティブユーザー</h2>
          <Users className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">データがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">アクティブユーザー</h2>
        <Users className="h-5 w-5 text-[#00B900]" />
      </div>

      <ul className="space-y-3">
        {data.map((user, index) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-2 border-2 border-black bg-white hover:bg-[#FFFEF5] transition-colors"
          >
            <div className="flex-shrink-0 w-6 text-center">
              <span className="text-sm font-bold text-black/60">#{index + 1}</span>
            </div>
            <div className="flex-shrink-0">
              {user.pictureUrl ? (
                <Image
                  src={user.pictureUrl}
                  alt={user.displayName}
                  width={40}
                  height={40}
                  className="border-2 border-black"
                />
              ) : (
                <div className="w-10 h-10 border-2 border-black bg-[#FFFEF5] flex items-center justify-center">
                  <Users className="h-5 w-5 text-black/60" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black truncate">
                {user.displayName}
              </p>
              <div className="flex items-center gap-1 text-xs font-mono text-black/60">
                <MessageCircle className="h-3 w-3" />
                <span>{user.messageCount} メッセージ</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">
          メッセージ数が多い順にランキング表示
        </p>
      </div>
    </article>
  );
}
