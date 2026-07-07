import React, { useState } from "react";

export default function ManagerInputModal({ designerName, initialInputs, onSave, onClose }) {
  const [inputs, setInputs] = useState(initialInputs || { bonus: 0, penalty: 0, qualityScore: 7, attitudeScore: 7 });

  const handleChange = (key, val) => {
    setInputs((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Đánh giá quản lý — {designerName}</h2>
          <button className="btn btn-ghost" style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Điểm chất lượng (0–10)</label>
              <input
                type="number" min="0" max="10" step="0.5"
                className="form-input"
                value={inputs.qualityScore}
                onChange={(e) => handleChange("qualityScore", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Điểm thái độ (0–10)</label>
              <input
                type="number" min="0" max="10" step="0.5"
                className="form-input"
                value={inputs.attitudeScore}
                onChange={(e) => handleChange("attitudeScore", e.target.value)}
              />
            </div>
          </div>
          <hr className="divider" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ color: "var(--primary)" }}>Bonus (điểm cộng thêm)</label>
              <input
                type="number" min="0" step="1"
                className="form-input"
                style={{ borderColor: "rgba(7,30,114,0.3)" }}
                value={inputs.bonus}
                onChange={(e) => handleChange("bonus", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: "var(--danger)" }}>Penalty (điểm trừ)</label>
              <input
                type="number" min="0" step="1"
                className="form-input"
                style={{ borderColor: "rgba(197,0,27,0.3)" }}
                value={inputs.penalty}
                onChange={(e) => handleChange("penalty", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" onClick={() => onSave(inputs)}>Lưu đánh giá</button>
        </div>
      </div>
    </div>
  );
}
