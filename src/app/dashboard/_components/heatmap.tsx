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
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
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
                  className="group relative rounded-sm transition-all duration-300"
                  title={`${day}曜日 ${hour}時: ${value}`}
                >
                  {/* ツールチップ */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-2 py-1 text-xs font-mono shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:block">
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
          <div className="flex overflow-hidden rounded-xl shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            {["#FFFEF5", "#FFE500", "#8FD400", "#4EBF00", "#00B900"].map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color, width: 20, height: 20 }}
              />
            ))}
          </div>
          <span>多い</span>
        </div>
      </div>
    </div>
  );
}
