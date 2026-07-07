import React, { useState, useEffect } from "react";

export default function ManagerInputModal({ 
  designerName, 
  currentInputs, 
  onSave, 
  onClose 
}) {
  const [quality, setQuality] = useState("");
  const [lateTasks, setLateTasks] = useState(0);
  const [lateDays, setLateDays] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [bonusNotes, setBonusNotes] = useState("");

  // Initialize fields when designerName/currentInputs changes
  useEffect(() => {
    if (currentInputs) {
      setQuality(currentInputs.quality !== null ? String(currentInputs.quality) : "");
      setLateTasks(currentInputs.lateTasks || 0);
      setLateDays(currentInputs.lateDays || 0);
      setBonus(currentInputs.bonus || 0);
      setBonusNotes(currentInputs.bonusNotes || "");
    }
  }, [designerName, currentInputs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(designerName, {
      quality: quality === "" ? null : Number(quality),
      lateTasks: Number(lateTasks),
      lateDays: Number(lateDays),
      bonus: Number(bonus),
      bonusNotes: bonusNotes.trim()
    });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(3, 4, 9, 0.8)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem"
    }} className="animate-fade-in">
      <div className="glass-card modal-card" style={{
        width: "100%",
        maxWidth: "500px",
        padding: "2rem",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        position: "relative"
      }}>
        {/* Close top right button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "1.2rem",
            cursor: "pointer",
            outline: "none"
          }}
        >
          ✕
        </button>

        <h3 style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "white"
        }}>
          Update Metrics
        </h3>
        <p style={{
          fontSize: "0.85rem",
          color: "var(--primary)",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          Designer: {designerName}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Quality Select */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Average Quality Rating (1 - 3)
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="form-select"
            >
              <option value="">-- Not Rated Yet (Leaves Quality at 0%) --</option>
              <option value="3">3.0 - Xuất sắc (Excellent / 100% weight)</option>
              <option value="2.5">2.5 - Tốt (Good / 83.3% weight)</option>
              <option value="2">2.0 - Đạt yêu cầu (Satisfactory / 66.7% weight)</option>
              <option value="1.5">1.5 - Cần cải thiện (Needs Improvement / 50.0% weight)</option>
              <option value="1">1.0 - Kém (Poor / 33.3% weight)</option>
            </select>
          </div>

          {/* Lateness Penalties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Overdue Tasks
              </label>
              <input 
                type="number"
                min="0"
                value={lateTasks}
                onChange={(e) => setLateTasks(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>-2.0 pts per task</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Total Days Late
              </label>
              <input 
                type="number"
                step="0.1"
                min="0"
                value={lateDays}
                onChange={(e) => setLateDays(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>-0.5 pts per day</span>
            </div>
          </div>

          {/* Bonus Points */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Bonus Points (Capped at 10%)
            </label>
            <input 
              type="number"
              step="0.5"
              min="0"
              max="15"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Bonus Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Bonus Reason / Notes
            </label>
            <textarea
              placeholder="e.g., Supported colleagues, urgent out-of-hours tasks, innovative template designs..."
              value={bonusNotes}
              onChange={(e) => setBonusNotes(e.target.value)}
              className="form-input"
              style={{ minHeight: "60px", resize: "vertical", padding: "0.5rem" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: "0.55rem 1.5rem" }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
