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
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">週間アクティビティ</h2>
          <Activity className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">週間アクティビティ</h2>
        <Activity className="h-5 w-5 text-blue-500" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">受信</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-400">送信</span>
        </div>
      </div>

      {/* チャート */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const inboundWidth = maxValue > 0 ? (item.inbound / maxValue) * 100 : 0;
          const outboundWidth = maxValue > 0 ? (item.outbound / maxValue) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{formatDate(item.date)}</span>
                <span className="text-slate-500">
                  受信: {item.inbound} / 送信: {item.outbound}
                </span>
              </div>
              <div className="space-y-1">
                {/* 受信バー */}
                <div className="h-2 w-full rounded-full bg-slate-800/50">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${inboundWidth}%` }}
                  />
                </div>
                {/* 送信バー */}
                <div className="h-2 w-full rounded-full bg-slate-800/50">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${outboundWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">過去7日間のメッセージ送受信状況</p>
      </div>
    </article>
  );
}
