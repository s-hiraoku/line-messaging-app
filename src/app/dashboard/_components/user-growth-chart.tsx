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
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">ユーザー成長</h2>
          <TrendingUp className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">ユーザー成長</h2>
        <TrendingUp className="h-5 w-5 text-emerald-500" />
      </div>

      {/* チャート */}
      <div className="relative h-40 flex items-end justify-between gap-1">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                {/* ツールチップ */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {item.count}人
                  </div>
                </div>
                {/* バー */}
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-400 hover:to-emerald-300"
                  style={{ height: `${height}%`, minHeight: item.count > 0 ? "4px" : "0" }}
                />
              </div>
              {/* 日付ラベル */}
              <span className="text-[10px] text-slate-500 mt-2">
                {formatDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          過去30日間の新規ユーザー: <span className="text-emerald-400 font-medium">{totalNewUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
