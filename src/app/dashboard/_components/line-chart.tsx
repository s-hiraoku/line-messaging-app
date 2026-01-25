"use client";

type LineChartProps = {
  data: Array<{
    label: string;
    value: number;
  }>;
  height?: number;
  color?: string;
  showGrid?: boolean;
};

export function LineChart({ data, height = 200, color = "#00B900", showGrid = true }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white/70 p-8 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300" style={{ height }}>
        <p className="text-sm font-mono text-black/60">データがありません</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padding = 40;
  const width = 600;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = padding + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `L ${p.x} ${p.y}`;
  }).join(' ');

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-2xl bg-white/70 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      {/* グリッドライン */}
      {showGrid && (
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + chartHeight - chartHeight * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#000"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.2"
                />
                <text
                  x={padding - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="#000"
                  opacity="0.6"
                >
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* X軸 */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Y軸 */}
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#000"
        strokeWidth="2"
      />

      {/* ラインパス */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* データポイント */}
      {points.map((point, i) => (
        <g key={i}>
          <circle
            cx={point.x}
            cy={point.y}
            r="5"
            fill={color}
            stroke="#000"
            strokeWidth="2"
          />
          {/* ラベル */}
          {i % Math.ceil(data.length / 8) === 0 && (
            <text
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="#000"
              opacity="0.6"
            >
              {point.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
