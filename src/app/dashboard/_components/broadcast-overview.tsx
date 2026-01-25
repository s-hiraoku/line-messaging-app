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
        return "text-gray-600 bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8)]";
      case "SCHEDULED":
        return "text-amber-900 bg-[#FFE500] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.5)]";
      case "SENDING":
        return "text-white bg-[#00B900] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]";
      case "SENT":
        return "text-white bg-[#00B900] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]";
      default:
        return "text-gray-600 bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8)]";
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
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">配信ステータス</h2>
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
            className="flex items-center gap-3 p-3 rounded-xl bg-[#e8f5e9] shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)]"
          >
            <div className={`p-2 rounded-lg ${getStatusColor(stat.status)}`}>
              {getStatusIcon(stat.status)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{getStatusLabel(stat.status)}</p>
              <p className="text-xl font-bold text-gray-800">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最近の配信 */}
      {recentBroadcasts.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">最近の配信</h3>
          <ul className="space-y-2">
            {recentBroadcasts.map((broadcast) => (
              <li
                key={broadcast.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-[#e8f5e9] transition-colors shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{broadcast.title}</p>
                  <p className="text-xs font-mono text-gray-500">
                    {broadcast.scheduledAt
                      ? `予約: ${formatDateTime(broadcast.scheduledAt)}`
                      : `作成: ${formatDateTime(broadcast.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${getStatusColor(broadcast.status)}`}
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
