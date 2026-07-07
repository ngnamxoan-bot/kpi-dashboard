import React, { useMemo } from "react";

export default function WorkloadReport({ results, monthLabel }) {
  const projectData = useMemo(() => {
    const map = {};
    for (const r of results) {
      for (const t of r.tasks || []) {
        if (!map[t.project]) map[t.project] = { total: 0, designers: {} };
        map[t.project].total++;
        map[t.project].designers[r.name] = (map[t.project].designers[r.name] || 0) + 1;
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([project, d]) => ({ project, ...d }));
  }, [results]);

  const maxTasks = results.reduce((m, r) => Math.max(m, r.taskCount), 1);

  if (!results.length) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ marginTop: "4rem" }}>
          <div className="empty-state-icon">📋</div>
          <h3>Chưa có dữ liệu</h3>
          <p>Import CSV để xem workload report</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="7" width="4" height="8" rx="1"/><rect x="6" y="4" width="4" height="11" rx="1"/><rect x="11" y="1" width="4" height="14" rx="1"/>
          </svg>
          Workload Report — {monthLabel}
        </div>
      </div>

      <div className="page-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Per-designer workload bars */}
        <div className="card">
          <div className="card-header"><h3>Task theo nhân sự</h3></div>
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {[...results].sort((a, b) => b.taskCount - a.taskCount).map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "90px", fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)", flexShrink: 0 }}>{r.name}</div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar-track" style={{ height: "10px" }}>
                    <div className="progress-bar-fill" style={{ width: `${(r.taskCount / maxTasks) * 100}%` }} />
                  </div>
                </div>
                <div style={{ width: "40px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>
                  {r.taskCount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-project table */}
        <div className="card">
          <div className="card-header">
            <h3>Task theo dự án</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{projectData.length} dự án</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Dự án</th>
                  <th style={{ textAlign: "right" }}>Tổng task</th>
                  {results.map((r) => (
                    <th key={r.name} style={{ textAlign: "right" }}>{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectData.map(({ project, total, designers }) => (
                  <tr key={project}>
                    <td style={{ fontWeight: 600 }}>{project}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)", fontVariantNumeric: "tabular-nums" }}>{total}</td>
                    {results.map((r) => (
                      <td key={r.name} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                        {designers[r.name] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
