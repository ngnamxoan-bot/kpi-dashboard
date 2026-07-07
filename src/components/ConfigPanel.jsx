import React, { useState } from "react";

export default function ConfigPanel({
  config,
  setConfig,
  catalog,
  setCatalog,
  onClearAllData,
  isSaving
}) {
  const [activeSubTab, setActiveSubTab] = useState("general");

  // Local state for adding a new catalog row
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("");
  const [newCatPoints, setNewCatPoints] = useState(2.0);
  const [newCatBase, setNewCatBase] = useState("");

  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleWeightChange = (key, val) => {
    setConfig(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: Number(val)
      }
    }));
  };

  const handleGeneralChange = (key, val) => {
    setConfig(prev => ({
      ...prev,
      [key]: key === "managerPassword" ? val : Number(val)
    }));
  };

  const handleCoefficientChange = (pkg, val) => {
    setConfig(prev => ({
      ...prev,
      coefficients: {
        ...prev.coefficients,
        [pkg]: Number(val)
      }
    }));
  };

  const handleCatalogPointChange = (idx, val) => {
    const updated = [...catalog];
    updated[idx].points = Number(val);
    setCatalog(updated);
  };

  const handleCatalogBaseChange = (idx, val) => {
    const updated = [...catalog];
    updated[idx].base = val;
    setCatalog(updated);
  };

  const handleCatalogTypeChange = (idx, val) => {
    const updated = [...catalog];
    updated[idx].type = val;
    setCatalog(updated);
  };

  const handleCatalogCategoryChange = (idx, val) => {
    const updated = [...catalog];
    updated[idx].category = val;
    setCatalog(updated);
  };

  const handleDeleteCatalogRow = (idx) => {
    const updated = catalog.filter((_, i) => i !== idx);
    setCatalog(updated);
  };

  const handleAddCatalogRow = (e) => {
    e.preventDefault();
    if (!newCatType) return;
    const newRow = {
      category: newCatName || "Custom",
      type: newCatType,
      points: Number(newCatPoints),
      base: newCatBase || newCatType
    };
    setCatalog([...catalog, newRow]);
    
    // Reset form
    setNewCatName("");
    setNewCatType("");
    setNewCatPoints(2.0);
    setNewCatBase("");
  };

  // Weights checking
  const weightsSum = config.weights.quantity + config.weights.difficulty + config.weights.quality + config.weights.bonus;
  const isWeightValid = Math.abs(weightsSum - 100) < 0.01;

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
      {/* Settings Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button 
          onClick={() => setActiveSubTab("general")}
          className={`btn ${activeSubTab === "general" ? "btn-primary" : "btn-secondary"}`}
          style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
        >
          General & Weights
        </button>
        <button 
          onClick={() => setActiveSubTab("packages")}
          className={`btn ${activeSubTab === "packages" ? "btn-primary" : "btn-secondary"}`}
          style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
        >
          Package Coefficients
        </button>
        <button 
          onClick={() => setActiveSubTab("catalog")}
          className={`btn ${activeSubTab === "catalog" ? "btn-primary" : "btn-secondary"}`}
          style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
        >
          Task Point Catalog
        </button>
      </div>

      {/* Settings Details Container */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        
        {/* TAB 1: GENERAL & WEIGHTS */}
        {activeSubTab === "general" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.5rem" }}>
              General Formula & Weights
            </h3>

            {/* Weights Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Formula Weights Configuration</span>
                <span style={{ 
                  fontSize: "0.85rem", 
                  fontWeight: 700, 
                  color: isWeightValid ? "var(--success)" : "var(--danger)" 
                }}>
                  Sum: {weightsSum}% {isWeightValid ? "✓" : "(Must equal 100%)"}
                </span>
              </div>

              {/* Slider 1: Quantity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span>Quantity Score Weight:</span>
                  <span style={{ fontWeight: 700, color: "white" }}>{config.weights.quantity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={config.weights.quantity} 
                  onChange={(e) => handleWeightChange("quantity", e.target.value)}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
              </div>

              {/* Slider 2: Difficulty */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span>Difficulty Score Weight:</span>
                  <span style={{ fontWeight: 700, color: "white" }}>{config.weights.difficulty}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={config.weights.difficulty} 
                  onChange={(e) => handleWeightChange("difficulty", e.target.value)}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
              </div>

              {/* Slider 3: Quality */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span>Quality Score Weight:</span>
                  <span style={{ fontWeight: 700, color: "white" }}>{config.weights.quality}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={config.weights.quality} 
                  onChange={(e) => handleWeightChange("quality", e.target.value)}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
              </div>

              {/* Slider 4: Bonus */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span>Bonus Weight (Capped):</span>
                  <span style={{ fontWeight: 700, color: "white" }}>{config.weights.bonus}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={config.weights.bonus} 
                  onChange={(e) => handleWeightChange("bonus", e.target.value)}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
              </div>
            </div>

            {/* Threshold Constants */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Monthly Quantity Target (Points thô)
                </label>
                <input 
                  type="number" min="10"
                  value={config.targetPoints}
                  onChange={(e) => handleGeneralChange("targetPoints", e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Quantity Score reaches 100% of weight at this value</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Warning Threshold ("Gần đạt") (%)
                </label>
                <input 
                  type="number" min="0" max="100"
                  value={config.warningThreshold}
                  onChange={(e) => handleGeneralChange("warningThreshold", e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Total KPI % below this is considered "Chưa đạt"</span>
              </div>
            </div>

            {/* Lateness Penalties */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Penalty per Late Task
                </label>
                <input 
                  type="number" max="0" step="0.5"
                  value={config.penaltyTask}
                  onChange={(e) => handleGeneralChange("penaltyTask", e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Points subtracted from bonus balance</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Penalty per Overdue Day (cumulative)
                </label>
                <input 
                  type="number" max="0" step="0.1"
                  value={config.penaltyDay}
                  onChange={(e) => handleGeneralChange("penaltyDay", e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Points subtracted per calendar day of delay</span>
              </div>
            </div>

            {/* Admin Password Management */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: "1px solid var(--border-muted)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Manager/Admin Password
                </label>
                <input 
                  type="password"
                  value={config.managerPassword || "macmedia123"}
                  onChange={(e) => handleGeneralChange("managerPassword", e.target.value)}
                  className="form-input"
                  style={{ fontFamily: "monospace" }}
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Password required to unlock editing, CSV imports, and config changes</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.04)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "0.5rem"
            }}>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--danger)", marginBottom: "0.4rem" }}>
                  ⚠️ Vùng nguy hiểm
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  Xoá toàn bộ tháng, task và đánh giá quản lý trong database. Cấu hình và bảng điểm được giữ nguyên. Hành động này không thể hoàn tác.
                </p>
              </div>

              {!showDangerConfirm ? (
                <button
                  onClick={() => { setShowDangerConfirm(true); setConfirmText(""); }}
                  style={{
                    alignSelf: "flex-start",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "var(--danger)",
                    borderRadius: "8px",
                    padding: "0.55rem 1.1rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  🗑 Xoá toàn bộ dữ liệu
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--danger)", fontWeight: 600 }}>
                    Gõ <strong>XOA</strong> để xác nhận:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Gõ XOA ở đây..."
                    className="form-input"
                    style={{ maxWidth: "260px", fontFamily: "monospace", fontWeight: 700 }}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      disabled={confirmText !== "XOA" || isSaving}
                      onClick={() => {
                        onClearAllData();
                        setShowDangerConfirm(false);
                        setConfirmText("");
                      }}
                      style={{
                        background: confirmText === "XOA" && !isSaving ? "var(--danger)" : "rgba(239,68,68,0.3)",
                        border: "none",
                        color: "white",
                        borderRadius: "8px",
                        padding: "0.55rem 1.1rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: confirmText === "XOA" && !isSaving ? "pointer" : "not-allowed",
                        opacity: confirmText === "XOA" && !isSaving ? 1 : 0.6
                      }}
                    >
                      {isSaving ? "Đang xoá…" : "Xác nhận xoá"}
                    </button>
                    <button
                      onClick={() => { setShowDangerConfirm(false); setConfirmText(""); }}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-muted)",
                        color: "var(--text-secondary)",
                        borderRadius: "8px",
                        padding: "0.55rem 1.1rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PACKAGE COEFFICIENTS */}
        {activeSubTab === "packages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.5rem" }}>
              Difficulty Coefficients for Clients Packages
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem" }}>
              {Object.keys(config.coefficients).map(pkg => (
                <div key={pkg} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>{pkg}</label>
                  <input 
                    type="number" step="0.05" min="0.1" max="3"
                    value={config.coefficients[pkg]}
                    onChange={(e) => handleCoefficientChange(pkg, e.target.value)}
                    className="form-input"
                    style={{ fontWeight: 600 }}
                  />
                </div>
              ))}
            </div>

            {/* Bounds & Default coefficient */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem", borderTop: "1px solid var(--border-muted)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Default (Unclassified Task)</label>
                <input 
                  type="number" step="0.05"
                  value={config.hsDefault}
                  onChange={(e) => handleGeneralChange("hsDefault", e.target.value)}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Minimum Coeff Bound (Min)</label>
                <input 
                  type="number" step="0.05"
                  value={config.hsMin}
                  onChange={(e) => handleGeneralChange("hsMin", e.target.value)}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Maximum Coeff Bound (Max)</label>
                <input 
                  type="number" step="0.05"
                  value={config.hsMax}
                  onChange={(e) => handleGeneralChange("hsMax", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.5rem" }}>
              Note: Minimum and maximum bounds are used to normalize the average difficulty coefficient into a score between 0% and 100% of the Difficulty weight (15%).
            </p>
          </div>
        )}

        {/* TAB 3: TASK POINT CATALOG */}
        {activeSubTab === "catalog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.5rem" }}>
              Task Category Point Mapping
            </h3>

            {/* Add new category row */}
            <form onSubmit={handleAddCatalogRow} style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "flex-end",
              background: "rgba(255,255,255,0.02)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-muted)"
            }}>
              <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Group Name</span>
                <input 
                  type="text" placeholder="e.g., Video, Print" 
                  value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  className="form-input" style={{ padding: "0.5rem" }}
                />
              </div>
              <div style={{ flex: 2, minWidth: "180px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Task Type (Exact Match)</span>
                <input 
                  type="text" placeholder="e.g., [Design] Video - Ads" 
                  value={newCatType} onChange={(e) => setNewCatType(e.target.value)}
                  className="form-input" style={{ padding: "0.5rem" }} required
                />
              </div>
              <div style={{ width: "90px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>KPI Points</span>
                <input 
                  type="number" step="0.5" 
                  value={newCatPoints} onChange={(e) => setNewCatPoints(e.target.value)}
                  className="form-input" style={{ padding: "0.5rem" }} required
                />
              </div>
              <div style={{ flex: 1.5, minWidth: "150px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Base Prefix Match</span>
                <input 
                  type="text" placeholder="e.g., [Design] Video" 
                  value={newCatBase} onChange={(e) => setNewCatBase(e.target.value)}
                  className="form-input" style={{ padding: "0.5rem" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", height: "38px" }}>
                Add Row
              </button>
            </form>

            {/* Fallback default points */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Unmatched Task Fallback Points ("Post Daily" rule)</label>
                <input 
                  type="number" step="0.5"
                  value={config.dailyPostPoints}
                  onChange={(e) => handleGeneralChange("dailyPostPoints", e.target.value)}
                  className="form-input"
                  style={{ padding: "0.5rem" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Standard Fallback Points (Legacy Other)</label>
                <input 
                  type="number" step="0.5"
                  value={config.otherPoints}
                  onChange={(e) => handleGeneralChange("otherPoints", e.target.value)}
                  className="form-input"
                  style={{ padding: "0.5rem" }}
                />
              </div>
            </div>

            {/* Point Catalog Table */}
            <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
              <table className="kpi-table" style={{ borderCollapse: "separate" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Group</th>
                    <th>Task Type (Exact Match)</th>
                    <th style={{ width: "100px", textAlign: "center" }}>Points</th>
                    <th>Prefix Match</th>
                    <th style={{ width: "70px", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          type="text" value={item.category} 
                          onChange={(e) => handleCatalogCategoryChange(idx, e.target.value)}
                          className="form-input" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", background: "transparent", border: "none" }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" value={item.type} 
                          onChange={(e) => handleCatalogTypeChange(idx, e.target.value)}
                          className="form-input" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", background: "transparent", border: "none" }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input 
                          type="number" step="0.5" value={item.points} 
                          onChange={(e) => handleCatalogPointChange(idx, e.target.value)}
                          className="form-input" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", textAlign: "center", fontWeight: 700, color: "var(--primary)" }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" value={item.base || ""} 
                          onChange={(e) => handleCatalogBaseChange(idx, e.target.value)}
                          className="form-input" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", background: "transparent", border: "none" }}
                          placeholder="—"
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button 
                          onClick={() => handleDeleteCatalogRow(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--danger)",
                            cursor: "pointer",
                            fontSize: "1rem"
                          }}
                          title="Delete Row"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
