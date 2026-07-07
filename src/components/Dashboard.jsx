import React, { useMemo } from "react";
import { getStatusBadgeClass, getStatusLabel } from "../utils/kpiCalculator";

function RankBadge({ rank }) {
  const cls = rank === 1 ? "rank-badge top1" : rank === 2 ? "rank-badge top2" : rank === 3 ? "rank-badge top3" : "rank-badge normal";
  return <span className={cls}>{rank}</span>;
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ results, monthLabel, onViewProfile, onOpenManagerInput, isUnlocked }) {
  const stats = useMemo(() => {
    if (!results.length) return null;
    const avg = results.reduce((s, r) => s + r.finalScore, 0) / results.length;
    const top = results[0];
    const taskTotal = results.reduce((s, r) => s + r.taskCount, 0);
    const passing = results.filter((r) => r.finalScore >= 7).length;
    return { avg, top, taskTotal, passing };
  }, [results]);

  if (!results.length) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ marginTop: "4rem" }}>
          <div className="empty-state-icon">📊</div>
          <h3>Chưa có dữ liệu</h3>
          <p>Import CSV để bắt đầu xem KPI</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
          </svg>
          Dashboard — {monthLabel}
        </div>
        {isUnlocked && (
          <button className="btn btn-secondary" style={{ fontSize: "0.78rem" }} onClick={() => onOpenManagerInput && onOpenManagerInput(results[0]?.name)}>
            Nhập đánh giá quản lý
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Stats row */}
        {stats && (
          <div className="stat-grid">
            <StatCard label="Điểm TB toàn team" value={stats.avg.toFixed(2)} sub="/ 10.00" />
            <StatCard label="Tổng task tháng" value={stats.taskTotal.toLocaleString()} sub="tasks hoàn thành" />
            <StatCard label="Nhân sự đạt" value={`${stats.passing}/${results.length}`} sub="KPI ≥ 7.0" />
            <StatCard label="Top tháng này" value={stats.top.name} sub={`${stats.top.finalScore.toFixed(2)} điểm`} />
          </div>
        )}

        {/* Ranking table */}
        <div className="card">
          <div className="card-header">
            <h3>Bảng xếp hạng KPI</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{results.length} nhân sự</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Nhân sự</th>
                  <th>Nhóm</th>
                  <th>Task</th>
                  <th>Điểm Task</th>
                  <th>Chất lượng</th>
                  <th>Thái độ</th>
                  <th>Điểm cuối</th>
                  <th>Trạng thái</th>
                  {isUnlocked && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={r.name}>
                    <td><RankBadge rank={idx + 1} /></td>
                    <td>
                      <span
                        className="designer-name"
                        onClick={() => onViewProfile(r.name)}
                      >
                        {r.name}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{r.group}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.taskCount}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--primary)", fontWeight: 600 }}>{r.taskScore.toFixed(2)}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.qualityScore.toFixed(1)}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.attitudeScore.toFixed(1)}</td>
                    <td>
                      <span style={{
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: r.finalScore >= 7 ? "var(--primary)" : "var(--danger)",
                      }}>
                        {r.finalScore.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(r.status)}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    {isUnlocked && (
                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
                          onClick={() => onOpenManagerInput(r.name)}
                        >
                          Đánh giá
                        </button>
                      </td>
                    )}
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
