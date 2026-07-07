import React, { useState } from "react";

export default function ConfigPanel({ config, setConfig, catalog, setCatalog, onClearAllData, isSaving }) {
  const [activeSubTab, setActiveSubTab] = useState("general");
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("");
  const [newCatPoints, setNewCatPoints] = useState(2.0);
  const [newCatBase, setNewCatBase] = useState("");
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleWeightChange = (key, val) => {
    setConfig((prev) => ({
      ...prev,
      weights: { ...prev.weights, [key]: parseFloat(val) || 0 },
    }));
  };

  const handleCoefficientChange = (pkg, val) => {
    setConfig((prev) => ({
      ...prev,
      coefficients: { ...prev.coefficients, [pkg]: parseFloat(val) || 1 },
    }));
  };

  const handleGeneralChange = (key, val) => {
    setConfig((prev) => ({ ...prev, [key]: parseFloat(val) || val }));
  };

  const handleAddCatalog = () => {
    if (!newCatName.trim()) return;
    setCatalog((prev) => [
      ...prev,
      { name: newCatName.trim(), type: newCatType.trim(), points: parseFloat(newCatPoints) || 2, base: newCatBase.trim() },
    ]);
    setNewCatName(""); setNewCatType(""); setNewCatPoints(2.0); setNewCatBase("");
  };

  const handleRemoveCatalog = (idx) => {
    setCatalog((prev) => prev.filter((_, i) => i !== idx));
  };

  const SUBTABS = [
    { id: "general", label: "Tổng quan" },
    { id: "packages", label: "Hệ số gói" },
    { id: "catalog", label: "Bảng điểm task" },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
          </svg>
          Rules & Settings
        </div>
      </div>

      <div className="page-body">
        <div className="tab-bar">
          {SUBTABS.map((t) => (
            <button key={t.id} className={`tab-item${activeSubTab === t.id ? " active" : ""}`} onClick={() => setActiveSubTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: GENERAL ── */}
        {activeSubTab === "general" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Weights */}
            <div className="card">
              <div className="card-header"><h3>Trọng số điểm</h3></div>
              <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {[
                  { key: "taskScore", label: "Điểm Task" },
                  { key: "qualityScore", label: "Chất lượng" },
                  { key: "attitudeScore", label: "Thái độ" },
                ].map(({ key, label }) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input
                      type="number" step="0.05" min="0" max="1"
                      className="form-input"
                      value={config.weights[key]}
                      onChange={(e) => handleWeightChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Task targets */}
            <div className="card">
              <div className="card-header"><h3>Ngưỡng task & hệ số</h3></div>
              <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {[
                  { key: "taskTarget", label: "Task target" },
                  { key: "hsDefault", label: "Hệ số mặc định" },
                  { key: "hsMin", label: "Hệ số tối thiểu" },
                  { key: "hsMax", label: "Hệ số tối đa" },
                ].map(({ key, label }) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input
                      type="number" step="0.05"
                      className="form-input"
                      value={config[key]}
                      onChange={(e) => handleGeneralChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Admin password */}
            <div className="card">
              <div className="card-header"><h3>Admin Password</h3></div>
              <div className="card-body">
                <div className="form-group" style={{ maxWidth: "320px" }}>
                  <label className="form-label">Manager / Admin Password</label>
                  <input
                    type="password"
                    className="form-input"
                    style={{ fontFamily: "monospace" }}
                    value={config.managerPassword || "macmedia123"}
                    onChange={(e) => handleGeneralChange("managerPassword", e.target.value)}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Dùng để mở khoá chỉnh sửa, import CSV và cấu hình
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{
              border: "1px solid rgba(197,0,27,0.35)",
              background: "rgba(197,0,27,0.04)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
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
                  className="btn btn-danger"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => { setShowDangerConfirm(true); setConfirmText(""); }}
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
                    placeholder="Gõ XOA ở đây…"
                    className="form-input"
                    style={{ maxWidth: "260px", fontFamily: "monospace", fontWeight: 700 }}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      className="btn"
                      disabled={confirmText !== "XOA" || isSaving}
                      onClick={() => { onClearAllData(); setShowDangerConfirm(false); setConfirmText(""); }}
                      style={{
                        background: confirmText === "XOA" && !isSaving ? "var(--danger)" : "rgba(197,0,27,0.3)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      {isSaving ? "Đang xoá…" : "Xác nhận xoá"}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setShowDangerConfirm(false); setConfirmText(""); }}>
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: PACKAGES ── */}
        {activeSubTab === "packages" && (
          <div className="card">
            <div className="card-header"><h3>Hệ số gói dịch vụ</h3></div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
              {Object.keys(config.coefficients).map((pkg) => (
                <div key={pkg} className="form-group">
                  <label className="form-label">{pkg}</label>
                  <input
                    type="number" step="0.05" min="0.1" max="5"
                    className="form-input"
                    style={{ fontWeight: 700 }}
                    value={config.coefficients[pkg]}
                    onChange={(e) => handleCoefficientChange(pkg, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: CATALOG ── */}
        {activeSubTab === "catalog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Add new */}
            <div className="card">
              <div className="card-header"><h3>Thêm loại task mới</h3></div>
              <div className="card-body" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
                <div className="form-group">
                  <label className="form-label">Tên task</label>
                  <input className="form-input" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="vd: Post Design" />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại</label>
                  <input className="form-input" value={newCatType} onChange={(e) => setNewCatType(e.target.value)} placeholder="design" />
                </div>
                <div className="form-group">
                  <label className="form-label">Điểm gốc</label>
                  <input type="number" step="0.5" className="form-input" value={newCatPoints} onChange={(e) => setNewCatPoints(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn vị</label>
                  <input className="form-input" value={newCatBase} onChange={(e) => setNewCatBase(e.target.value)} placeholder="per post" />
                </div>
                <button className="btn btn-primary" onClick={handleAddCatalog} style={{ height: "36px" }}>Thêm</button>
              </div>
            </div>

            {/* Table */}
            <div className="card">
              <div className="card-header">
                <h3>Bảng điểm task</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{catalog.length} loại</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Tên task</th>
                      <th>Loại</th>
                      <th style={{ textAlign: "right" }}>Điểm gốc</th>
                      <th>Đơn vị</th>
                      <th style={{ textAlign: "center" }}>Xoá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{item.type}</td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--primary)", fontWeight: 700 }}>{item.points}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.base}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                            onClick={() => handleRemoveCatalog(idx)}
                          >
                            Xoá
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
