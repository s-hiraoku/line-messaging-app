import { Activity } from "lucide-react";

type WeeklyActivityData = {
  date: string;
  inbound: number;
  outbound: number;
};

type Props = {
  data: WeeklyActivityData[];
};

export function WeeklyActivityChart({ data }: Props) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.inbound, d.outbound)),
    1
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
  };

  if (data.length === 0) {
    return (
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">週間アクティビティ</h2>
          <Activity className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">データがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">週間アクティビティ</h2>
        <Activity className="h-5 w-5 text-[#00B900]" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00B900] border-2 border-black" />
          <span className="text-xs font-bold uppercase tracking-wider text-black/60">受信</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FFE500] border-2 border-black" />
          <span className="text-xs font-bold uppercase tracking-wider text-black/60">送信</span>
        </div>
      </div>

      {/* チャート */}
      <div className="space-y-3 p-3 border-2 border-black bg-[#FFFEF5]">
        {data.map((item, index) => {
          const inboundWidth = maxValue > 0 ? (item.inbound / maxValue) * 100 : 0;
          const outboundWidth = maxValue > 0 ? (item.outbound / maxValue) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-black/60">{formatDate(item.date)}</span>
                <span className="font-mono text-black/60">
                  受信: {item.inbound} / 送信: {item.outbound}
                </span>
              </div>
              <div className="space-y-1">
                {/* 受信バー */}
                <div className="h-2 w-full border-2 border-black bg-white">
                  <div
                    className="h-full bg-[#00B900] transition-all"
                    style={{ width: `${inboundWidth}%` }}
                  />
                </div>
                {/* 送信バー */}
                <div className="h-2 w-full border-2 border-black bg-white">
                  <div
                    className="h-full bg-[#FFE500] transition-all"
                    style={{ width: `${outboundWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">過去7日間のメッセージ送受信状況</p>
      </div>
    </article>
  );
}
