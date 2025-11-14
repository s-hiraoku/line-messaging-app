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
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">ユーザー成長</h2>
          <TrendingUp className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">データがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">ユーザー成長</h2>
        <TrendingUp className="h-5 w-5 text-[#00B900]" />
      </div>

      {/* チャート */}
      <div className="relative h-40 flex items-end justify-between gap-1 bg-[#FFFEF5] p-3 border-2 border-black">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                {/* ツールチップ */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black text-white text-xs font-bold px-2 py-1 whitespace-nowrap border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {item.count}人
                  </div>
                </div>
                {/* バー */}
                <div
                  className="w-full bg-[#00B900] border-2 border-black transition-all hover:bg-[#00B900]/80"
                  style={{ height: `${height}%`, minHeight: item.count > 0 ? "4px" : "0" }}
                />
              </div>
              {/* 日付ラベル */}
              <span className="text-[10px] font-mono text-black/60 mt-2">
                {formatDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">
          過去30日間の新規ユーザー: <span className="text-[#00B900] font-bold">{totalNewUsers}</span> 人
        </p>
      </div>
    </article>
  );
}
