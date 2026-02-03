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
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">週間アクティビティ</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">週間アクティビティ</h2>
        <Activity className="h-5 w-5 text-[#00B900]" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#00B900] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">受信</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#FFE500] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">送信</span>
        </div>
      </div>

      {/* チャート */}
      <div className="space-y-3 p-3 rounded-xl bg-[#e8f5e9] shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)]">
        {data.map((item, index) => {
          const inboundWidth = maxValue > 0 ? (item.inbound / maxValue) * 100 : 0;
          const outboundWidth = maxValue > 0 ? (item.outbound / maxValue) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-gray-500">{formatDate(item.date)}</span>
                <span className="font-mono text-gray-500">
                  受信: {item.inbound} / 送信: {item.outbound}
                </span>
              </div>
              <div className="space-y-1">
                {/* 受信バー */}
                <div className="h-2 w-full rounded-full bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                  <div
                    className="h-full rounded-full bg-[#00B900] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)] transition-all"
                    style={{ width: `${inboundWidth}%` }}
                  />
                </div>
                {/* 送信バー */}
                <div className="h-2 w-full rounded-full bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                  <div
                    className="h-full rounded-full bg-[#FFE500] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)] transition-all"
                    style={{ width: `${outboundWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">過去7日間のメッセージ送受信状況</p>
      </div>
    </article>
  );
}
