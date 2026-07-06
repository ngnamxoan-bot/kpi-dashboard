import React from "react";

/**
 * Radial gauge to show the overall KPI score with animated gradient ring.
 */
export function RadialProgress({ value, size = 160, strokeWidth = 12, label = "KPI Score" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.max(0, Math.min(value, 120)); // Allow slightly over 100%
  const offset = circumference - (Math.min(clampedValue, 100) / 100) * circumference;

  // Determine status color
  let color = "var(--danger)";
  let filterId = "glow-red";
  if (value >= 100) {
    color = "var(--success)";
    filterId = "glow-green";
  } else if (value >= 85) {
    color = "var(--warning)";
    filterId = "glow-yellow";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <defs>
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={
            value >= 100 ? "url(#greenGrad)" :
            value >= 85 ? "url(#yellowGrad)" : "url(#redGrad)"
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${filterId})`}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </svg>
      
      {/* Center Text */}
      <div style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <span style={{
          fontSize: "1.8rem",
          fontWeight: 800,
          fontFamily: "var(--font-heading)",
          color: "white",
          letterSpacing: "-0.03em"
        }}>
          {value.toFixed(1)}%
        </span>
        <span style={{
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginTop: "2px"
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Animated Horizontal Bar Chart for comparing quantities or point contributions.
 */
export function HorizontalBarChart({ data, maxValue, barColor = "var(--primary)" }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {data.map((item, idx) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{item.value} {item.unit || ""}</span>
            </div>
            
            <div style={{
              height: "8px",
              width: "100%",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "999px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.02)"
            }}>
              <div style={{
                height: "100%",
                width: `${percentage}%`,
                background: item.color || barColor,
                borderRadius: "999px",
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: `0 0 10px 0 ${item.color || barColor}40`
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Donut Chart using SVG elements.
 */
export function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let accumulatedAngle = 0;
  
  const slices = data.map((item) => {
    if (total === 0) return null;
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      ...item,
      percentage,
      angle,
      startAngle
    };
  }).filter(Boolean);

  const size = 120;
  const radius = 40;
  const center = size / 2;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "100%" }}>
      {total > 0 ? (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {slices.map((slice, idx) => {
              const offset = circumference - (slice.percentage / 100) * circumference;
              const rotation = slice.startAngle;
              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center",
                    transition: "stroke-dashoffset 0.8s ease",
                    cursor: "pointer"
                  }}
                  title={`${slice.label}: ${slice.value}`}
                />
              );
            })}
          </svg>
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>{total}</span>
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Tasks</span>
          </div>
        </div>
      ) : (
        <div style={{
          width: size, height: size,
          borderRadius: "50%",
          border: "4px dashed rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)", fontSize: "0.8rem", flexShrink: 0
        }}>
          Empty
        </div>
      )}
      
      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
