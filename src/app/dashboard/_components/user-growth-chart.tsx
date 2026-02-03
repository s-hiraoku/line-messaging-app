import { TrendingUp } from "lucide-react";

type UserGrowthData = {
  date: string;
  count: number;
};

type Props = {
  data: UserGrowthData[];
};

export function UserGrowthChart({ data }: Props) {
  const totalNewUsers = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (data.length === 0) {
    return (
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">ユーザー成長</h2>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">ユーザー成長</h2>
        <TrendingUp className="h-5 w-5 text-[#00B900]" />
      </div>

      {/* チャート */}
      <div className="relative h-40 flex items-end justify-between gap-1 rounded-xl bg-[#e8f5e9] p-3 shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)]">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                {/* ツールチップ */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 whitespace-nowrap rounded-lg shadow-lg">
                    {item.count}人
                  </div>
                </div>
                {/* バー */}
                <div
                  className="w-full rounded-t-md bg-[#00B900] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all hover:brightness-110"
                  style={{ height: `${height}%`, minHeight: item.count > 0 ? "4px" : "0" }}
                />
              </div>
              {/* 日付ラベル */}
              <span className="text-[10px] font-mono text-gray-500 mt-2">
                {formatDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          過去30日間の新規ユーザー: <span className="text-[#00B900] font-bold">{totalNewUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
