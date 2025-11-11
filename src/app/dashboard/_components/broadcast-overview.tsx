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
        return "text-slate-400 bg-slate-500/20";
      case "SCHEDULED":
        return "text-yellow-400 bg-yellow-500/20";
      case "SENDING":
        return "text-blue-400 bg-blue-500/20";
      case "SENT":
        return "text-emerald-400 bg-emerald-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
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
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">配信ステータス</h2>
        <Link
          href="/dashboard/broadcasts"
          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
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
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30"
          >
            <div className={`p-2 rounded ${getStatusColor(stat.status)}`}>
              {getStatusIcon(stat.status)}
            </div>
            <div>
              <p className="text-xs text-slate-400">{getStatusLabel(stat.status)}</p>
              <p className="text-xl font-semibold text-white">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最近の配信 */}
      {recentBroadcasts.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-medium text-slate-300 mb-3">最近の配信</h3>
          <ul className="space-y-2">
            {recentBroadcasts.map((broadcast) => (
              <li
                key={broadcast.id}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-800/40 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{broadcast.title}</p>
                  <p className="text-xs text-slate-400">
                    {broadcast.scheduledAt
                      ? `予約: ${formatDateTime(broadcast.scheduledAt)}`
                      : `作成: ${formatDateTime(broadcast.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`ml-2 flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${getStatusColor(broadcast.status)}`}
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
