import { Send, Clock, CheckCircle2, FileEdit, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type BroadcastStat = {
  status: string;
  count: number;
};

type RecentBroadcast = {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
};

type Props = {
  statusData: BroadcastStat[];
  recentBroadcasts: RecentBroadcast[];
};

export function BroadcastOverview({ statusData, recentBroadcasts }: Props) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "下書き",
      SCHEDULED: "予約済み",
      SENDING: "送信中",
      SENT: "送信完了",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileEdit className="h-4 w-4" />;
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "SENDING":
        return <Send className="h-4 w-4" />;
      case "SENT":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-black bg-white border-2 border-black";
      case "SCHEDULED":
        return "text-black bg-[#FFE500] border-2 border-black";
      case "SENDING":
        return "text-white bg-[#00B900] border-2 border-black";
      case "SENT":
        return "text-white bg-[#00B900] border-2 border-black";
      default:
        return "text-black bg-white border-2 border-black";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">配信ステータス</h2>
        <Link
          href="/dashboard/broadcasts"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#00B900] hover:text-[#00B900]/80 cursor-pointer transition-colors"
        >
          すべて見る
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ステータス別集計 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {statusData.map((stat) => (
          <div
            key={stat.status}
            className="flex items-center gap-3 p-3 border-2 border-black bg-[#FFFEF5] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className={`p-2 ${getStatusColor(stat.status)}`}>
              {getStatusIcon(stat.status)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-black/60">{getStatusLabel(stat.status)}</p>
              <p className="text-xl font-bold text-black">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最近の配信 */}
      {recentBroadcasts.length > 0 && (
        <div className="pt-4 border-t-2 border-black">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-3">最近の配信</h3>
          <ul className="space-y-2">
            {recentBroadcasts.map((broadcast) => (
              <li
                key={broadcast.id}
                className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-[#FFFEF5] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate">{broadcast.title}</p>
                  <p className="text-xs font-mono text-black/60">
                    {broadcast.scheduledAt
                      ? `予約: ${formatDateTime(broadcast.scheduledAt)}`
                      : `作成: ${formatDateTime(broadcast.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(broadcast.status)}`}
                >
                  {getStatusLabel(broadcast.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
