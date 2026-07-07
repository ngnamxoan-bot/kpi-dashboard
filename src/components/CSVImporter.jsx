import React, { useState, useRef } from "react";

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    rows.push(row);
  }
  return rows;
}

function normalizeTask(row) {
  const title = row["title"] || row["task"] || row["tên task"] || row["ten task"] || "";
  const assignee = row["assignee"] || row["designer"] || row["người thực hiện"] || row["nguoi thuc hien"] || "";
  const project = row["project"] || row["dự án"] || row["du an"] || row["client"] || "";
  const pkg = row["package"] || row["gói"] || row["goi"] || row["pkg"] || null;
  return { title: title.trim(), assignee: assignee.trim(), project: project.trim(), package: pkg ? pkg.trim() : null };
}

export default function CSVImporter({ onImport, monthsData, currentMonthKey, isSaving }) {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState(null);
  const [monthKey, setMonthKey] = useState(currentMonthKey || "");
  const [monthLabel, setMonthLabel] = useState("");
  const [isNewMonth, setIsNewMonth] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      const rows = parseCSV(text);
      const tasks = rows.map(normalizeTask).filter((t) => t.title && t.assignee);
      setPreview({ total: rows.length, valid: tasks.length, sample: tasks.slice(0, 5), tasks });
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = () => {
    if (!preview) return;
    const key = isNewMonth ? monthKey : (currentMonthKey || monthKey);
    const label = isNewMonth ? monthLabel : (monthsData[currentMonthKey]?.label || currentMonthKey);
    onImport(key, label, preview.tasks);
  };

  const monthKeys = Object.keys(monthsData).sort().reverse();

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 11V3M5 6l3-3 3 3"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
          </svg>
          Import CSV
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Upload card */}
          <div className="card">
            <div className="card-header"><h3>Upload file CSV</h3></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Month selection */}
              <div className="form-group">
                <label className="form-label">Tháng</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <button
                    className={`btn${!isNewMonth ? " btn-primary" : " btn-secondary"}`}
                    style={{ fontSize: "0.78rem", flex: 1 }}
                    onClick={() => setIsNewMonth(false)}
                  >
                    Tháng hiện tại
                  </button>
                  <button
                    className={`btn${isNewMonth ? " btn-primary" : " btn-secondary"}`}
                    style={{ fontSize: "0.78rem", flex: 1 }}
                    onClick={() => setIsNewMonth(true)}
                  >
                    Tháng mới
                  </button>
                </div>
                {isNewMonth ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      placeholder="Key (vd: 2024-07)"
                      value={monthKey}
                      onChange={(e) => setMonthKey(e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="Tên hiển thị (vd: Tháng 7/2024)"
                      value={monthLabel}
                      onChange={(e) => setMonthLabel(e.target.value)}
                    />
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={currentMonthKey}
                    disabled
                  >
                    {monthKeys.map((k) => (
                      <option key={k} value={k}>{monthsData[k]?.label || k}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* File picker */}
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "10px",
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) { fileRef.current.files = e.dataTransfer.files; handleFile({ target: { files: [file] } }); }
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }}>📂</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Kéo thả hoặc click để chọn file
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Hỗ trợ .csv (UTF-8)
                </div>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
              </div>

              {/* CSV format guide */}
              <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "0.85rem 1rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  Định dạng CSV
                </div>
                <code style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  title, assignee, project, package
                </code>
              </div>

              {preview && (
                <button
                  className="btn btn-primary"
                  disabled={isSaving || (isNewMonth && (!monthKey || !monthLabel))}
                  onClick={handleImport}
                  style={{ width: "100%" }}
                >
                  {isSaving ? "Đang import…" : `Import ${preview.valid.toLocaleString()} tasks`}
                </button>
              )}
            </div>
          </div>

          {/* Preview card */}
          {preview && (
            <div className="card">
              <div className="card-header">
                <h3>Preview</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {preview.valid} hợp lệ / {preview.total} dòng
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Assignee</th>
                      <th>Project</th>
                      <th>Package</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample.map((t, i) => (
                      <tr key={i}>
                        <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</td>
                        <td style={{ color: "var(--primary)", fontWeight: 600 }}>{t.assignee}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.project}</td>
                        <td style={{ color: "var(--text-muted)" }}>{t.package || "—"}</td>
                      </tr>
                    ))}
                    {preview.valid > 5 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.78rem" }}>
                          … và {preview.valid - 5} task khác
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
