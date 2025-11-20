"use client";

type HeatmapProps = {
  data: {
    hourly: Array<{
      hour: number;
      inbound: number;
      outbound: number;
    }>;
    weekday: Array<{
      day: number;
      dayName: string;
      inbound: number;
      outbound: number;
    }>;
  };
};

export function Heatmap({ data }: HeatmapProps) {
  // 時間帯×曜日のマトリックスを作成
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // ランダムデータ生成（実際のデータがない場合のプロトタイプ用）
  const heatmapData: number[][] = weekdays.map((_, dayIndex) => {
    return hours.map((hour) => {
      // 実際のアプリケーションではここでAPIから取得したデータを使用
      const hourData = data.hourly.find(h => h.hour === hour);
      const dayData = data.weekday.find(d => d.day === dayIndex);

      if (hourData && dayData) {
        // 時間と曜日のデータを組み合わせて推定値を計算
        const hourActivity = hourData.inbound + hourData.outbound;
        const dayActivity = dayData.inbound + dayData.outbound;
        const avgActivity = (hourActivity + dayActivity) / 2;
        return Math.round(avgActivity / 10); // スケールダウン
      }
      return 0;
    });
  });

  const maxValue = Math.max(...heatmapData.flat(), 1);

  const getColor = (value: number) => {
    if (value === 0) return "#FFFEF5";
    const intensity = value / maxValue;
    if (intensity > 0.75) return "#00B900";
    if (intensity > 0.5) return "#4EBF00";
    if (intensity > 0.25) return "#8FD400";
    return "#FFE500";
  };

  const cellSize = 30;
  const labelWidth = 30;
  const labelHeight = 25;

  return (
    <div className="overflow-x-auto border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
        時間帯×曜日 アクティビティヒートマップ
      </h3>
      <div className="inline-block">
        <div className="mb-2 flex">
          <div style={{ width: labelWidth }} />
          {hours.map((hour) => {
            if (hour % 3 === 0) {
              return (
                <div
                  key={hour}
                  style={{ width: cellSize * 3 }}
                  className="text-center text-xs font-mono text-black/60"
                >
                  {hour}時
                </div>
              );
            }
            return null;
          })}
        </div>

        {weekdays.map((day, dayIndex) => (
          <div key={dayIndex} className="flex items-center">
            <div
              style={{ width: labelWidth }}
              className="pr-2 text-right text-xs font-bold text-black"
            >
              {day}
            </div>
            {hours.map((hour) => {
              const value = heatmapData[dayIndex][hour];
              return (
                <div
                  key={hour}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getColor(value),
                  }}
                  className="group relative border border-black"
                  title={`${day}曜日 ${hour}時: ${value}`}
                >
                  {/* ツールチップ */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap border-2 border-black bg-white px-2 py-1 text-xs font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:block">
                    {day}曜日 {hour}時<br />
                    アクティビティ: {value}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* 凡例 */}
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-black/60">
          <span>少ない</span>
          <div className="flex border-2 border-black">
            {["#FFFEF5", "#FFE500", "#8FD400", "#4EBF00", "#00B900"].map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color, width: 20, height: 20 }}
                className="border-r border-black last:border-r-0"
              />
            ))}
          </div>
          <span>多い</span>
        </div>
      </div>
    </div>
  );
}
