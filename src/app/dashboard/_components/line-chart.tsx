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
      <div className="flex items-center justify-center border-2 border-black bg-white p-8" style={{ height }}>
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
      className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
