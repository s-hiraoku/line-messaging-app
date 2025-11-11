import { PieChart } from "lucide-react";

type MessageType = {
  type: string;
  count: number;
};

type Props = {
  data: MessageType[];
};

export function MessageTypeDistribution({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT: "テキスト",
      IMAGE: "画像",
      VIDEO: "動画",
      AUDIO: "音声",
      STICKER: "スタンプ",
      LOCATION: "位置情報",
      IMAGEMAP: "イメージマップ",
      FLEX: "Flexメッセージ",
      TEMPLATE: "テンプレート",
    };
    return labels[type] || type;
  };

  const getTypeColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  if (data.length === 0) {
    return (
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">メッセージタイプ分布</h2>
          <PieChart className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">メッセージタイプ分布</h2>
        <PieChart className="h-5 w-5 text-slate-500" />
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{getTypeLabel(item.type)}</span>
                <span className="text-slate-400">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${getTypeColor(index)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          過去30日間の合計: <span className="text-white font-medium">{total}</span> メッセージ
        </p>
      </div>
    </article>
  );
}
