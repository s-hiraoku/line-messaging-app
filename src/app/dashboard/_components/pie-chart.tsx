"use client";

type PieChartProps = {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  size?: number;
};

const DEFAULT_COLORS = [
  "#00B900",
  "#FFE500",
  "#FF6B6B",
  "#4ECDC4",
  "#95A99C",
  "#FF8B94",
  "#FDCA40",
  "#41EAD4",
];

export function PieChart({ data, size = 300 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white/80 p-8 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300" style={{ width: size, height: size }}>
        <p className="text-sm font-mono text-black/60">データがありません</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size, size) / 2 - 40;

  type SliceData = {
    path: string;
    color: string;
    label: string;
    percentage: string;
    value: number;
    labelX: number;
    labelY: number;
    endAngle: number;
  };

  const slices = data.reduce<SliceData[]>((acc, item, index) => {
    const prevAngle = index === 0 ? -Math.PI / 2 : acc[index - 1].endAngle;
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = prevAngle;
    const endAngle = prevAngle + angle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // ラベル位置（中間角度）
    const midAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY + labelRadius * Math.sin(midAngle);

    acc.push({
      path,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      label: item.label,
      percentage: percentage.toFixed(1),
      value: item.value,
      labelX,
      labelY,
      endAngle,
    });

    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <svg
        width={size}
        height={size}
        className="rounded-2xl bg-white/80 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
      >
        {slices.map((slice, i) => (
          <g key={i}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
            />
            {/* パーセンテージ表示 */}
            {parseFloat(slice.percentage) > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
                fill="#000"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* 凡例 */}
      <div className="grid grid-cols-2 gap-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl bg-white/80 p-2 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div
              className="h-4 w-4 rounded-md"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-black">{slice.label}</p>
              <p className="text-xs font-mono text-black/60">{slice.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
