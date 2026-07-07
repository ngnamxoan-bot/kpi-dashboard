import React, { useState } from "react";
import { RadialProgress, DonutChart, HorizontalBarChart } from "./SvgCharts";

export default function DesignerProfile({ 
  scorecards, 
  selectedDesignerName, 
  setSelectedDesignerName,
  onEditDesigner,
  isManager
}) {
  const [taskSearch, setTaskSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("All");
  const [pageSize, setPageSize] = useState("50");
  const [currentPage, setCurrentPage] = useState(1);

  const currentIdx = scorecards.findIndex(sc => sc.designerName === selectedDesignerName);
  const sc = scorecards[currentIdx] || scorecards[0];

  if (!sc) {
    return <div style={{ color: "var(--text-muted)", padding: "2rem" }}>No designer selected.</div>;
  }

  // Browse controls
  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + scorecards.length) % scorecards.length;
    setSelectedDesignerName(scorecards[prevIdx].designerName);
  };

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % scorecards.length;
    setSelectedDesignerName(scorecards[nextIdx].designerName);
  };

  // 1. Data mapping for workload charts
  // Donut chart of packages
  const packageColors = {
    PROX5: "#00f2fe",
    PROX4: "#3b82f6",
    PROX3: "#9d4edd",
    SEM: "#c8b6ff",
    SE1: "#f59e0b",
    E0: "#ef4444"
  };

  const packageData = Object.keys(sc.packageCounts).map(pkg => ({
    label: pkg,
    value: sc.packageCounts[pkg],
    color: packageColors[pkg] || "#64748b"
  })).filter(item => item.value > 0);

  // Group tasks by category using the pre-computed category from kpiCalculator
  const categories = {};
  sc.tasks.forEach(task => {
    const cat = task.category || "Khác";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const categoryPalette = ["#00f2fe","#9d4edd","#f59e0b","#10b981","#ef4444","#ec4899","#8b5cf6","#6b7280","#3b82f6","#f97316"];

  const categoryData = Object.keys(categories).map((cat, idx) => ({
    label: cat,
    value: categories[cat],
    color: categoryPalette[idx % categoryPalette.length]
  })).sort((a, b) => b.value - a.value);

  // 2. Filter tasks table
  const filteredTasks = sc.tasks.filter(task => {
    const matchesPackage = packageFilter === "All" || task.package === packageFilter;
    const matchesSearch = 
      task.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
      task.project.toLowerCase().includes(taskSearch.toLowerCase());
    return matchesPackage && matchesSearch;
  });

  const totalTasks = filteredTasks.length;
  const isAll = pageSize === "All";
  const sizeVal = isAll ? totalTasks : Number(pageSize);
  const totalPages = isAll ? 1 : Math.ceil(totalTasks / sizeVal);
  const activePage = Math.max(1, Math.min(currentPage, totalPages));
  
  const displayedTasks = isAll 
    ? filteredTasks 
    : filteredTasks.slice((activePage - 1) * sizeVal, activePage * sizeVal);

  const startIndex = totalTasks === 0 ? 0 : (activePage - 1) * sizeVal + 1;
  const endIndex = Math.min(activePage * sizeVal, totalTasks);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Selector and Browse controls */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={handlePrev} className="btn btn-secondary" style={{ padding: "0.5rem 0.75rem" }}>
            ← Prev
          </button>
          <div style={{ width: "220px" }}>
            <select 
              value={selectedDesignerName} 
              onChange={(e) => setSelectedDesignerName(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600, fontSize: "0.95rem" }}
            >
              {scorecards.map(s => (
                <option key={s.designerName} value={s.designerName}>
                  {s.designerName} ({s.group})
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleNext} className="btn btn-secondary" style={{ padding: "0.5rem 0.75rem" }}>
            Next →
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Designer Rank: <strong style={{ color: "white", fontSize: "1.05rem" }}>#{sc.rank}</strong> of {scorecards.length}
          </span>
          {isManager && (
            <button 
              onClick={() => onEditDesigner(sc.designerName)}
              className="btn btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
            >
              Edit Manager Inputs
            </button>
          )}
        </div>
      </div>

      {/* KPI Scores Breakdown Cards Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr repeat(4, 1fr)",
        gap: "1.25rem"
      }} className="grid-responsive-breakdown">
        {/* Circle Radial Progress */}
        <div className="glass-card glow-cyan" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px" }}>
          <RadialProgress value={sc.tongDiemKpi} size={150} strokeWidth={11} />
        </div>

        {/* 1. Quantity points card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Quantity (60%)</span>
            <h4 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.25rem 0 0.5rem", color: "white" }}>{sc.diemSoLuong.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 60</span></h4>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Tasks: <strong>{sc.totalTasks}</strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Points thô: <strong>{sc.totalPointsTho.toFixed(1)}</strong>
            </div>
          </div>
          <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "1rem" }}>
            <div style={{ height: "100%", width: `${(sc.diemSoLuong/60)*100}%`, background: "var(--primary)" }} />
          </div>
        </div>

        {/* 2. Difficulty points card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Difficulty (15%)</span>
            <h4 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.25rem 0 0.5rem", color: "white" }}>{sc.diemDoKho.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 15</span></h4>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Avg Coefficient: <strong>{sc.totalTasks > 0 ? sc.avgDifficultyCoefficient.toFixed(2) : "—"}</strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Classified: <strong>{sc.daPhanLoaiGoi}</strong> / {sc.totalTasks}
            </div>
          </div>
          <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "1rem" }}>
            <div style={{ height: "100%", width: `${(sc.diemDoKho/15)*100}%`, background: "var(--secondary)" }} />
          </div>
        </div>

        {/* 3. Quality points card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Quality (15%)</span>
            <h4 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.25rem 0 0.5rem", color: "white" }}>
              {sc.diemChatLuong !== null ? sc.diemChatLuong.toFixed(1) : "—"} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 15</span>
            </h4>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Avg Quality Rating:
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--primary)", marginTop: "2px" }}>
              {sc.qualityRating !== null ? `⭐️ ${Number(sc.qualityRating).toFixed(1)} / 3.0` : "❌ Unevaluated"}
            </div>
          </div>
          <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "1rem" }}>
            <div style={{ height: "100%", width: `${sc.diemChatLuong ? (sc.diemChatLuong/15)*100 : 0}%`, background: "var(--success)" }} />
          </div>
        </div>

        {/* 4. Bonus / Penalty card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Bonus & Penalties</span>
            <h4 style={{ 
              fontSize: "1.6rem", 
              fontWeight: 700, 
              margin: "0.25rem 0 0.5rem", 
              color: sc.diemBonusTre < 0 ? "var(--danger)" : "white" 
            }}>
              {sc.diemBonusTre >= 0 ? `+${sc.diemBonusTre.toFixed(1)}` : sc.diemBonusTre.toFixed(1)}
            </h4>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Bonus: <strong style={{ color: "var(--success)" }}>+{sc.bonusScore}</strong> ({sc.bonusNotes || "No notes"})
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Late Tasks: <strong style={{ color: "var(--danger)" }}>{sc.lateTasks}</strong> ({sc.lateDays} days late)
            </div>
          </div>
        </div>
      </div>

      {/* CSS Hack for grid layout on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .grid-responsive-breakdown {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .grid-responsive-breakdown {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Workload breakdown charts */}
      <div className="grid-two-cols" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        {/* Left: Packages Donut */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.75rem" }}>
            Service Package Workload Distribution
          </h3>
          <div style={{ padding: "0.5rem 0" }}>
            <DonutChart data={packageData} />
          </div>
        </div>

        {/* Right: Task Categories horizontal bar */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.75rem" }}>
            Task Type Category Workload
          </h3>
          <div style={{ padding: "0.25rem 0" }}>
            {categoryData.length > 0 ? (
              <HorizontalBarChart data={categoryData} barColor="var(--secondary)" />
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>
                No tasks available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task History Table */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Completed Tasks Log</h3>
          
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Search tasks */}
            <input 
              type="text" 
              placeholder="Search tasks or project..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="form-input"
              style={{ width: "200px", padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}
            />

            {/* Page size selection */}
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: "110px", padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}
            >
              <option value="10">Show 10</option>
              <option value="50">Show 50</option>
              <option value="100">Show 100</option>
              <option value="All">Show All</option>
            </select>

            {/* Package selection filter */}
            <select 
              value={packageFilter} 
              onChange={(e) => { setPackageFilter(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: "120px", padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}
            >
              <option value="All">All Packages</option>
              <option value="PROX5">PROX5</option>
              <option value="PROX4">PROX4</option>
              <option value="PROX3">PROX3</option>
              <option value="SEM">SEM</option>
              <option value="SE1">SE1</option>
              <option value="E0">E0</option>
              <option value="null">Unclassified</option>
            </select>
          </div>
        </div>

        <div className="table-container" style={{ maxHeight: isAll ? "none" : "400px", overflowY: "auto" }}>
          <table className="kpi-table" style={{ borderCollapse: "separate" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>No.</th>
                <th>Task Title</th>
                <th>Project Name</th>
                <th style={{ width: "110px", textAlign: "center" }}>Package</th>
                <th style={{ width: "90px", textAlign: "center" }}>KPI Points</th>
              </tr>
            </thead>
            <tbody>
              {displayedTasks.length > 0 ? (
                displayedTasks.map((task, idx) => {
                  const hasPackage = task.package;
                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {isAll ? idx + 1 : (activePage - 1) * sizeVal + idx + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{task.project}</td>
                      <td style={{ textAlign: "center" }}>
                        {hasPackage ? (
                          <span style={{
                            display: "inline-block",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: `${packageColors[task.package]}15`,
                            color: packageColors[task.package],
                            border: `1px solid ${packageColors[task.package]}30`
                          }}>
                            {task.package}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>
                        {task.calculatedPoints.toFixed(1)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No tasks match the search or filter settings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isAll && totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-muted)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)"
          }}>
            <span>
              Showing {startIndex}-{endIndex} of {totalTasks} tasks
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={activePage === 1}
                className="btn btn-secondary"
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", opacity: activePage === 1 ? 0.5 : 1, cursor: activePage === 1 ? "not-allowed" : "pointer" }}
              >
                Previous
              </button>
              <span>Page {activePage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={activePage === totalPages}
                className="btn btn-secondary"
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", opacity: activePage === totalPages ? 0.5 : 1, cursor: activePage === totalPages ? "not-allowed" : "pointer" }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {(isAll || totalPages <= 1) && totalTasks > 0 && (
          <div style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-muted)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            textAlign: "left"
          }}>
            Showing all {totalTasks} tasks
          </div>
        )}
      </div>
    </div>
  );
}
