import React, { useState } from "react";

export default function Dashboard({ 
  scorecards, 
  onEditDesigner, 
  onViewProfile,
  exportToCSV,
  isManager
}) {
  const [groupFilter, setGroupFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters and sorting logic (sort by rank ascending, i.e., highest score first)
  const filteredScorecards = scorecards
    .filter(sc => {
      const matchesGroup = groupFilter === "All" || sc.group === groupFilter;
      const matchesStatus = statusFilter === "All" || sc.trangThai === statusFilter;
      const matchesSearch = sc.designerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesStatus && matchesSearch;
    })
    .sort((a, b) => a.rank - b.rank);

  // Calculate team summaries from filtered list
  const totalTasksSum = filteredScorecards.reduce((a, b) => a + b.totalTasks, 0);
  const totalPointsThoSum = filteredScorecards.reduce((a, b) => a + b.totalPointsTho, 0);
  
  // Calculate average difficulty of designers with tasks
  const designersWithTasks = filteredScorecards.filter(sc => sc.totalTasks > 0);
  const avgDifficulty = designersWithTasks.length > 0
    ? designersWithTasks.reduce((a, b) => a + b.avgDifficultyCoefficient, 0) / designersWithTasks.length
    : 0;

  // Status distributions
  const goodCount = filteredScorecards.filter(sc => sc.trangThai === "🌟 Good").length;
  const datCount = filteredScorecards.filter(sc => sc.trangThai === "✅ Đạt").length;
  const ganCount = filteredScorecards.filter(sc => sc.trangThai === "⚠️ Gần đạt").length;
  const chuaCount = filteredScorecards.filter(sc => sc.trangThai === "❌ Chưa đạt").length;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* 1. Header Summaries Grid */}
      <div className="grid-stats">
        {/* Stat Card 1 */}
        <div className="glass-card glow-cyan" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Team Completed Tasks</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>{totalTasksSum}</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "1rem" }}>
            Σ Thô points: {totalPointsThoSum.toFixed(0)}
          </span>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-card glow-purple" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Average Difficulty Coeff</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>{avgDifficulty.toFixed(2)}</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--secondary)", marginTop: "1rem" }}>
            Workload complexity index
          </span>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Target Completion Rate</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>
              {scorecards.length > 0 ? ((scorecards.filter(sc => sc.trangThai !== "❌ Chưa đạt").length / scorecards.length) * 100).toFixed(0) : 0}%
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "1rem" }}>
            Designers close to or meeting target
          </span>
        </div>

        {/* Stat Card 4 - Status breakdown */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>KPI Status Counts</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--secondary)" }}>🌟 Good:</span>
              <span style={{ fontWeight: 700, color: "white" }}>{goodCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--success)" }}>✅ Đạt:</span>
              <span style={{ fontWeight: 700, color: "white" }}>{datCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--warning)" }}>⚠️ Gần đạt:</span>
              <span style={{ fontWeight: 700, color: "white" }}>{ganCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--danger)" }}>❌ Chưa đạt:</span>
              <span style={{ fontWeight: 700, color: "white" }}>{chuaCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scoreboard Filters Bar */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flex: 1 }}>
          {/* Search bar */}
          <div style={{ minWidth: "240px", flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search designer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Group Filter */}
          <div style={{ width: "160px" }}>
            <select 
              value={groupFilter} 
              onChange={(e) => setGroupFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Groups</option>
              <option value="Media Key">Media Key</option>
              <option value="Media CTV">Media CTV</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ width: "160px" }}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Statuses</option>
              <option value="🌟 Good">🌟 Good</option>
              <option value="✅ Đạt">✅ Đạt</option>
              <option value="⚠️ Gần đạt">⚠️ Gần đạt</option>
              <option value="❌ Chưa đạt">❌ Chưa đạt</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div>
          <button 
            onClick={exportToCSV}
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* 3. KPI Leaderboard Table */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Designer KPI Rankings</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Showing {filteredScorecards.length} of {scorecards.length} designers</span>
        </div>
        
        <div className="table-container">
          <table className="kpi-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>Rank</th>
                <th>Designer</th>
                <th>Group</th>
                <th style={{ textAlign: "center" }}>Tasks</th>
                <th style={{ textAlign: "center" }}>Thô Points</th>
                <th style={{ textAlign: "center" }}>Diff Coeff</th>
                <th style={{ textAlign: "center" }}>Quantity (60%)</th>
                <th style={{ textAlign: "center" }}>Diff (15%)</th>
                <th style={{ textAlign: "center" }}>Quality (15%)</th>
                <th style={{ textAlign: "center" }}>Bonus/Late (10%)</th>
                <th style={{ textAlign: "center", color: "white" }}>Total KPI (%)</th>
                <th style={{ width: "130px", textAlign: "center" }}>Status</th>
                <th style={{ width: "120px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScorecards.length > 0 ? (
                filteredScorecards.map((sc, index) => {
                  let rankColor = "white";
                  let rankBg = "transparent";
                  
                  if (sc.rank === 1) {
                    rankColor = "#ffd700"; // gold
                    rankBg = "rgba(255, 215, 0, 0.1)";
                  } else if (sc.rank === 2) {
                    rankColor = "#c0c0c0"; // silver
                    rankBg = "rgba(192, 192, 192, 0.1)";
                  } else if (sc.rank === 3) {
                    rankColor = "#cd7f32"; // bronze
                    rankBg = "rgba(205, 127, 50, 0.1)";
                  }

                  const qualityDisp = sc.qualityRating !== null ? `${Number(sc.qualityRating).toFixed(1)}/3` : "—";
                  const statusClass = 
                    sc.trangThai === "🌟 Good" ? "badge-good" :
                    sc.trangThai === "✅ Đạt" ? "badge-success" :
                    sc.trangThai === "⚠️ Gần đạt" ? "badge-warning" : "badge-danger";

                  return (
                    <tr key={sc.designerName}>
                      {/* Rank */}
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: rankBg,
                          color: rankColor,
                          fontWeight: 700,
                          fontSize: "0.85rem"
                        }}>
                          {sc.rank}
                        </span>
                      </td>
                      
                      {/* Designer Name */}
                      <td>
                        <button 
                          onClick={() => onViewProfile(sc.designerName)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            outline: "none",
                            padding: "0"
                          }}
                        >
                          {sc.designerName}
                        </button>
                      </td>

                      {/* Group */}
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{sc.group}</span>
                      </td>

                      {/* Tasks count */}
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{sc.totalTasks}</td>
                      
                      {/* Thô points */}
                      <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{sc.totalPointsTho.toFixed(1)}</td>

                      {/* Difficulty Coeff */}
                      <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                        {sc.totalTasks > 0 ? sc.avgDifficultyCoefficient.toFixed(2) : "—"}
                      </td>

                      {/* Quantity points */}
                      <td style={{ textAlign: "center" }}>{sc.diemSoLuong.toFixed(1)}</td>

                      {/* Difficulty points */}
                      <td style={{ textAlign: "center" }}>{sc.diemDoKho.toFixed(1)}</td>

                      {/* Quality rating and score */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600 }}>{sc.diemChatLuong !== null ? sc.diemChatLuong.toFixed(1) : "0.0"}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>({qualityDisp})</span>
                        </div>
                      </td>

                      {/* Bonus/Late score */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ 
                            fontWeight: 600,
                            color: sc.diemBonusTre < 0 ? "var(--danger)" : "var(--text-primary)" 
                          }}>
                            {sc.diemBonusTre >= 0 ? `+${sc.diemBonusTre.toFixed(1)}` : sc.diemBonusTre.toFixed(1)}
                          </span>
                          {(sc.lateTasks > 0 || sc.bonusScore > 0) && (
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              (B:{sc.bonusScore} L:{sc.lateTasks})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total KPI Score */}
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          color: sc.trangThai === "✅ Đạt KPI" ? "var(--success)" :
                                 sc.trangThai === "⚠️ Gần đạt KPI" ? "var(--warning)" : "white"
                        }}>
                          {sc.tongDiemKpi.toFixed(1)}%
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${statusClass}`} style={{ whiteSpace: "nowrap" }}>
                          {sc.trangThai}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          {isManager && (
                            <button
                              onClick={() => onEditDesigner(sc.designerName)}
                              title="Edit Manager Metrics"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                padding: "0.4rem",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => onViewProfile(sc.designerName)}
                            title="View Performance Profile"
                            style={{
                              background: "rgba(0, 242, 254, 0.05)",
                              border: "1px solid rgba(0, 242, 254, 0.15)",
                              color: "var(--primary)",
                              cursor: "pointer",
                              padding: "0.4rem",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="13" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No designers found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
