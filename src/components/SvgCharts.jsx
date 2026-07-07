import React from "react";

// Simple SVG bar chart used in profile/workload views
export function BarChart({ data, maxVal, height = 120 }) {
  if (!data.length) return null;
  const barW = Math.max(20, Math.floor(300 / data.length) - 4);
  const total = 300 + data.length * 4;
  const max = maxVal || Math.max(...data.map((d) => d.value), 1);

  return (
    <svg width={total} height={height + 24} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * height);
        const x = i * (barW + 4);
        const y = height - bh;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#01E7FF" />
                <stop offset="100%" stopColor="#010978" />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={barW} height={bh} rx="4" fill={`url(#bar-grad-${i})`} opacity="0.85" />
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="10" fill="#848484" fontFamily="Inter,sans-serif">
              {d.label.length > 6 ? d.label.slice(0, 5) + "…" : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Donut chart for score breakdown
export function DonutChart({ score, max = 10, size = 80 }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, score / max);
  const dash = pct * circ;
  const isFail = score < 7;

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E6E9F2" strokeWidth="8" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={isFail ? "#C5001B" : "url(#donut-grad)"}
        strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#010978" />
          <stop offset="100%" stopColor="#01E7FF" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill={isFail ? "#C5001B" : "#071E72"} fontFamily="Inter,sans-serif">
        {score.toFixed(1)}
      </text>
    </svg>
  );
}
