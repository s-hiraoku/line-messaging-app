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
      "bg-black",
      "bg-[#00B900]/70",
      "bg-[#FFE500]/70",
      "bg-black/70",
      "bg-[#00B900]/50",
      "bg-[#FFE500]/50",
      "bg-black/50",
    ];
    return colors[index % colors.length];
  };

  if (data.length === 0) {
    return (
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">メッセージタイプ分布</h2>
          <PieChart className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">データがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">メッセージタイプ分布</h2>
        <PieChart className="h-5 w-5 text-black" />
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-black">{getTypeLabel(item.type)}</span>
                <span className="font-mono text-black/60">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 w-full border-2 border-black bg-white">
                <div
                  className={`h-full ${getTypeColor(index)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">
          過去30日間の合計: <span className="text-black font-bold">{total}</span> メッセージ
        </p>
      </div>
    </article>
  );
}
