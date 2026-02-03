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
      "bg-[#00B900]",
      "bg-[#FFE500]",
      "bg-gray-700",
      "bg-[#00B900]/70",
      "bg-[#FFE500]/70",
      "bg-gray-500",
      "bg-[#00B900]/50",
      "bg-[#FFE500]/50",
      "bg-gray-400",
    ];
    return colors[index % colors.length];
  };

  if (data.length === 0) {
    return (
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">メッセージタイプ分布</h2>
          <PieChart className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">データがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">メッセージタイプ分布</h2>
        <PieChart className="h-5 w-5 text-gray-600" />
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800">{getTypeLabel(item.type)}</span>
                <span className="font-mono text-gray-500">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                <div
                  className={`h-full rounded-full ${getTypeColor(index)} shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          過去30日間の合計: <span className="text-gray-800 font-bold">{total}</span> メッセージ
        </p>
      </div>
    </article>
  );
}
