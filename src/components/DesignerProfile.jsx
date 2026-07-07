import React, { useMemo } from "react";
import { getStatusBadgeClass, getStatusLabel } from "../utils/kpiCalculator";

function ScoreRow({ label, score, max = 10, danger = false }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: danger && score < 7 ? "var(--danger)" : "var(--primary)" }}>
          {typeof score === "number" ? score.toFixed(2) : score}
        </span>
      </div>
      <div className="progress-bar-track">
        <div className={`progress-bar-fill${danger && score < 7 ? " danger" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DesignerProfile({ result, onBack, isUnlocked, onOpenManagerInput }) {
  if (!result) return null;

  const tasksByProject = useMemo(() => {
    const map = {};
    for (const t of result.tasks || []) {
      if (!map[t.project]) map[t.project] = [];
      map[t.project].push(t);
    }
    return map;
  }, [result.tasks]);

  const tasksByTitle = useMemo(() => {
    const map = {};
    for (const t of result.tasks || []) {
      map[t.title] = (map[t.title] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [result.tasks]);

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", align: "center", gap: "0.75rem" }}>
          <button className="btn btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }} onClick={onBack}>
            ← Quay lại
          </button>
          <div className="page-header-title" style={{ marginLeft: "0.5rem" }}>
            {result.name}
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}> — {result.group}</span>
          </div>
        </div>
        {isUnlocked && (
          <button className="btn btn-secondary" style={{ fontSize: "0.78rem" }} onClick={() => onOpenManagerInput(result.name)}>
            Chỉnh đánh giá
          </button>
        )}
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Left: Score card */}
          <div className="card">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Avatar + name */}
              <div style={{ display: "flex", align: "center", gap: "1rem", alignItems: "center" }}>
                <div className="avatar avatar-lg" style={{ borderRadius: "14px" }}>
                  {result.name.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>{result.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{result.group}</div>
                </div>
              </div>

              {/* Final score */}
              <div style={{ textAlign: "center", padding: "1.25rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Điểm KPI tháng này
                </div>
                <div className={`score-hero${result.status === "fail" ? " fail" : ""}`}>
                  {result.finalScore.toFixed(2)}
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <span className={getStatusBadgeClass(result.status)}>
                    {getStatusLabel(result.status)}
                  </span>
                </div>
              </div>

              {/* Score breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <ScoreRow label="Điểm Task" score={result.taskScore} danger />
                <ScoreRow label="Chất lượng" score={result.qualityScore} danger />
                <ScoreRow label="Thái độ" score={result.attitudeScore} danger />
              </div>

              {/* Bonus/Penalty */}
              {(result.bonus !== 0 || result.penalty !== 0) && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {result.bonus !== 0 && (
                    <div style={{ flex: 1, background: "var(--primary-light)", borderRadius: "8px", padding: "0.65rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>Bonus</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)" }}>+{result.bonus}</div>
                    </div>
                  )}
                  {result.penalty !== 0 && (
                    <div style={{ flex: 1, background: "var(--danger-light)", borderRadius: "8px", padding: "0.65rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--danger)", fontWeight: 700, textTransform: "uppercase" }}>Penalty</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--danger)" }}>-{result.penalty}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Task count */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--bg)", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>Tổng task</span>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--primary)" }}>{result.taskCount}</span>
              </div>
            </div>
          </div>

          {/* Right: Task breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* By task type */}
            <div className="card">
              <div className="card-header">
                <h3>Phân loại task</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tasksByTitle.length} loại</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Loại task</th>
                      <th style={{ textAlign: "right" }}>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksByTitle.map(([title, count]) => (
                      <tr key={title}>
                        <td>{title}</td>
                        <td style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--primary)" }}>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By project */}
            <div className="card">
              <div className="card-header">
                <h3>Theo dự án</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{Object.keys(tasksByProject).length} dự án</span>
              </div>
              <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {Object.entries(tasksByProject).map(([project, ptasks]) => (
                  <div key={project} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{project}</div>
                    <div style={{ fontSize: "0.85rem", fontVariantNumeric: "tabular-nums", color: "var(--primary)", fontWeight: 700, minWidth: "2rem", textAlign: "right" }}>{ptasks.length}</div>
                    <div style={{ width: "100px" }}>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (ptasks.length / result.taskCount) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
