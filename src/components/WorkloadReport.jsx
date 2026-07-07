import React, { useState, useMemo } from "react";

export default function WorkloadReport({ scorecards }) {
  const [activeMetric, setActiveMetric] = useState("points"); // "points" or "tasks"

  // 1. Gather all tasks across all active designers
  const allTasks = useMemo(() => {
    return scorecards.flatMap(sc => sc.tasks || []);
  }, [scorecards]);

  // 2. Summary stats
  const totalTasks = allTasks.length;
  
  const totalCalculatedPoints = useMemo(() => {
    return allTasks.reduce((sum, t) => sum + (t.calculatedPoints || 0), 0);
  }, [allTasks]);

  const totalRawPoints = useMemo(() => {
    return allTasks.reduce((sum, t) => sum + (t.points || 0), 0);
  }, [allTasks]);

  const avgPointsPerTask = totalTasks > 0 ? (totalCalculatedPoints / totalTasks) : 0;

  // 3. Category Breakdown
  const categorySummary = useMemo(() => {
    const map = {};
    allTasks.forEach(t => {
      const cat = t.category || "Khác";
      if (!map[cat]) {
        map[cat] = { category: cat, count: 0, points: 0 };
      }
      map[cat].count += 1;
      map[cat].points += t.calculatedPoints || 0;
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        percentageCount: totalTasks > 0 ? (item.count / totalTasks) * 100 : 0,
        percentagePoints: totalCalculatedPoints > 0 ? (item.points / totalCalculatedPoints) * 100 : 0
      }))
      .sort((a, b) => b.points - a.points);
  }, [allTasks, totalTasks, totalCalculatedPoints]);

  // 4. Package Breakdown
  const packageSummary = useMemo(() => {
    const map = {
      "PROX5": { pkg: "PROX5", count: 0, points: 0, label: "PROX5 (x1.5)" },
      "PROX4": { pkg: "PROX4", count: 0, points: 0, label: "PROX4 (x1.3)" },
      "PROX3": { pkg: "PROX3", count: 0, points: 0, label: "PROX3 (x1.1)" },
      "SEM": { pkg: "SEM", count: 0, points: 0, label: "SEM (x1.0)" },
      "SE1": { pkg: "SE1", count: 0, points: 0, label: "SE1 (x0.9)" },
      "E0": { pkg: "E0", count: 0, points: 0, label: "E0 (x0.7)" },
      "Unclassified": { pkg: "Unclassified", count: 0, points: 0, label: "Không phân gói (x1.0)" }
    };

    allTasks.forEach(t => {
      const pkg = t.package || "Unclassified";
      const target = map[pkg] || map["Unclassified"];
      target.count += 1;
      target.points += t.calculatedPoints || 0;
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        percentageCount: totalTasks > 0 ? (item.count / totalTasks) * 100 : 0,
        percentagePoints: totalCalculatedPoints > 0 ? (item.points / totalCalculatedPoints) * 100 : 0
      }))
      .sort((a, b) => b.points - a.points);
  }, [allTasks, totalTasks, totalCalculatedPoints]);

  // 5. Project Breakdown (Top 10)
  const projectSummary = useMemo(() => {
    const map = {};
    allTasks.forEach(t => {
      const proj = t.project || "Không rõ dự án";
      if (!map[proj]) {
        map[proj] = { project: proj, count: 0, points: 0 };
      }
      map[proj].count += 1;
      map[proj].points += t.calculatedPoints || 0;
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        percentageCount: totalTasks > 0 ? (item.count / totalTasks) * 100 : 0,
        percentagePoints: totalCalculatedPoints > 0 ? (item.points / totalCalculatedPoints) * 100 : 0
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }, [allTasks, totalTasks, totalCalculatedPoints]);

  const packageColors = {
    PROX5: "var(--primary)",      // Cyan
    PROX4: "var(--secondary)",    // Purple
    PROX3: "var(--success)",      // Green
    SEM: "var(--warning)",        // Orange
    SE1: "#f43f5e",               // Rose
    E0: "#a7f3d0",                // Mint
    Unclassified: "#6b7280"       // Gray
  };

  const getMetricVal = (item, type = "points") => {
    if (type === "points") {
      return {
        val: item.points.toFixed(1) + " pts",
        pct: item.percentagePoints
      };
    }
    return {
      val: item.count + " tasks",
      pct: item.percentageCount
    };
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Tab Header Controls */}
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>Team Workload Report</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Aggregated statistics for all tasks and packages assigned in the active month.
          </p>
        </div>
        
        {/* Toggle metric */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "0.25rem", borderRadius: "8px", border: "1px solid var(--border-muted)" }}>
          <button 
            onClick={() => setActiveMetric("points")}
            className="btn"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.75rem",
              background: activeMetric === "points" ? "var(--primary)" : "transparent",
              color: activeMetric === "points" ? "#070913" : "var(--text-secondary)",
              border: "none",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            By KPI Points (Workload)
          </button>
          <button 
            onClick={() => setActiveMetric("tasks")}
            className="btn"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.75rem",
              background: activeMetric === "tasks" ? "var(--primary)" : "transparent",
              color: activeMetric === "tasks" ? "#070913" : "var(--text-secondary)",
              border: "none",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            By Task Count
          </button>
        </div>
      </div>

      {/* 1. Overall Team Stats Grid */}
      <div className="grid-stats">
        <div className="glass-card glow-cyan" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Team Total Tasks</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>{totalTasks}</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "1rem" }}>
            Assigned to official designers
          </span>
        </div>

        <div className="glass-card glow-purple" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Total Workload (KPI Pts)</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>{totalCalculatedPoints.toFixed(1)}</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--secondary)", marginTop: "1rem" }}>
            Thô points sum: {totalRawPoints.toFixed(1)}
          </span>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Average Effort / Task</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "white" }}>{avgPointsPerTask.toFixed(2)}</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "1rem" }}>
            Complexity weighted index per task
          </span>
        </div>
      </div>

      {/* 2. Category & Package Distribution Side-by-Side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="grid-responsive-import">
        
        {/* Column 1: Task Category Breakdown */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "white", borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.5rem" }}>
            Workload by Task Category
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {categorySummary.map((item, idx) => {
              const metric = getMetricVal(item, activeMetric);
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 600 }}>{item.category}</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      <strong>{metric.val}</strong> ({metric.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${metric.pct}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)", 
                      borderRadius: "3px" 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Package Breakdown */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "white", borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.5rem" }}>
            Workload by Service Package
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {packageSummary.map((item, idx) => {
              const metric = getMetricVal(item, activeMetric);
              const color = packageColors[item.pkg] || packageColors.Unclassified;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <span style={{ color: "var(--text-secondary)" }}>
                      <strong>{metric.val}</strong> ({metric.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${metric.pct}%`, 
                      height: "100%", 
                      background: color, 
                      borderRadius: "3px" 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Project Workload Table (Top 10) */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-muted)" }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "white" }}>Top 10 Active Projects (by Workload)</h4>
        </div>
        
        <div className="table-container">
          <table className="kpi-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>No.</th>
                <th>Project Name</th>
                <th style={{ textAlign: "center", width: "180px" }}>Tasks Count</th>
                <th style={{ textAlign: "center", width: "200px" }}>KPI Workload Points</th>
                <th style={{ textAlign: "center", width: "150px" }}>Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {projectSummary.length > 0 ? (
                projectSummary.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.project}</td>
                    <td style={{ textAlign: "center" }}>{item.count} tasks</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--primary)" }}>{item.points.toFixed(1)} pts</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.85rem", minWidth: "35px" }}>{item.percentagePoints.toFixed(1)}%</span>
                        <div style={{ width: "80px", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${item.percentagePoints}%`, height: "100%", background: "var(--primary)", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No project workload data available.
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
