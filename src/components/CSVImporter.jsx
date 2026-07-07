import React, { useState } from "react";

/**
 * Robust CSV parser supporting RFC 4180 (quoted values, escaped quotes, newlines in quotes).
 */
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  
  return lines;
}

export default function CSVImporter({
  onImportTasks,
  officialDesigners,
  config,
  monthsData,
  isSaving
}) {
  const [csvText, setCsvText] = useState("");
  const [parsedPreview, setParsedPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");

  const [targetMonthOption, setTargetMonthOption] = useState("existing"); // "existing" or "new"
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const keys = Object.keys(monthsData || {});
    return keys[keys.length - 1] || "2026-06";
  });
  const [newMonthVal, setNewMonthVal] = useState("07");
  const [newYearVal, setNewYearVal] = useState("2026");

  const officialNames = new Set(officialDesigners.map(d => d.name));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVContent(event.target.result);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!csvText.trim()) {
      setErrorMsg("Please paste some CSV data first.");
      return;
    }
    setFileName("Pasted Content");
    processCSVContent(csvText);
  };

  const processCSVContent = (content) => {
    setErrorMsg("");
    setParsedPreview(null);

    try {
      const rows = parseCSV(content);
      if (rows.length < 2) {
        setErrorMsg("CSV must contain at least a header row and one data row.");
        return;
      }

      // Map Headers
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const titleIdx = headers.findIndex(h => h === "title" || h === "tiêu đề" || h.includes("task"));
      const assigneeIdx = headers.findIndex(h => h === "assignee" || h === "người thực hiện" || h.includes("giao"));
      const projectIdx = headers.findIndex(h => h === "project name" || h === "dự án" || h.includes("project"));
      const goiIdx = headers.findIndex(h => h === "gói" || h === "goi" || h === "package");

      if (titleIdx === -1) {
        setErrorMsg("Could not find 'Title' column in headers. Found: " + rows[0].join(", "));
        return;
      }
      if (assigneeIdx === -1) {
        setErrorMsg("Could not find 'Assignee' column in headers. Found: " + rows[0].join(", "));
        return;
      }

      const tasks = [];
      const ignoredTasks = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || row.every(cell => !cell.trim())) continue; // Skip empty rows

        const title = row[titleIdx] ? row[titleIdx].trim() : "";
        const assignee = row[assigneeIdx] ? row[assigneeIdx].trim() : "";
        const project = projectIdx !== -1 && row[projectIdx] ? row[projectIdx].trim() : "";
        
        // Determine package
        let pkg = null;
        if (goiIdx !== -1 && row[goiIdx]) {
          pkg = row[goiIdx].trim();
        } else if (project) {
          // If no package column, parse package from project name like in Excel
          const projUpper = project.toUpperCase();
          if (projUpper.includes("PROX5")) pkg = "PROX5";
          else if (projUpper.includes("PROX4")) pkg = "PROX4";
          else if (projUpper.includes("PROX3")) pkg = "PROX3";
          else if (projUpper.includes("SEM")) pkg = "SEM";
          else if (projUpper.includes("SE1")) pkg = "SE1";
          else if (projUpper.includes("SE0")) pkg = "SE0";
          else if (projUpper.includes("E0")) pkg = "E0";
          else pkg = "KHAC";
        }

        // Clean package value
        if (pkg === "" || pkg === "nan" || pkg === "undefined") {
          pkg = null;
        }

        const taskObj = {
          title,
          assignee,
          project,
          package: pkg
        };

        if (officialNames.has(assignee)) {
          tasks.push(taskObj);
        } else {
          ignoredTasks.push(taskObj);
        }
      }

      setParsedPreview({
        tasks,
        ignoredTasks,
        totalRows: tasks.length + ignoredTasks.length
      });

    } catch (err) {
      setErrorMsg("Error parsing CSV: " + err.message);
    }
  };

  const handleApply = () => {
    if (!parsedPreview) return;
    
    let key = selectedMonthKey;
    let label = monthsData[selectedMonthKey]?.label || "";
    
    if (targetMonthOption === "new") {
      key = `${newYearVal}-${newMonthVal}`;
      label = `Tháng ${newMonthVal}/${newYearVal}`;
    }

    onImportTasks(key, label, parsedPreview.tasks, parsedPreview.ignoredTasks);
    
    // Reset state
    setCsvText("");
    setParsedPreview(null);
    setFileName("");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Configuration & Selection Panel */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Monthly Task Log Ingestion
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Import raw task exports from the app (needs at least <strong>Title</strong> and <strong>Assignee</strong> columns). If <strong>Project name</strong> is provided, the system will automatically parse service package designations (PROX5–E0) to compute difficulty coefficients.
          </p>
        </div>

        {/* Target Month Selector UI */}
        <div style={{
          background: "rgba(255,255,255,0.01)",
          padding: "1.25rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "white" }}>Target Month Selection</h4>
          
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
              <input 
                type="radio" 
                name="targetMonthOption" 
                value="existing"
                checked={targetMonthOption === "existing"}
                onChange={() => setTargetMonthOption("existing")}
                style={{ accentColor: "var(--primary)" }}
              />
              Import into an existing month
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
              <input 
                type="radio" 
                name="targetMonthOption" 
                value="new"
                checked={targetMonthOption === "new"}
                onChange={() => setTargetMonthOption("new")}
                style={{ accentColor: "var(--primary)" }}
              />
              Create a new month
            </label>
          </div>

          {targetMonthOption === "existing" ? (
            <div style={{ width: "260px" }}>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="form-select"
              >
                {Object.keys(monthsData || {}).map(key => (
                  <option key={key} value={key}>
                    {monthsData[key]?.label || key}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ width: "140px" }}>
                <select
                  value={newMonthVal}
                  onChange={(e) => setNewMonthVal(e.target.value)}
                  className="form-select"
                >
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: "140px" }}>
                <input 
                  type="number"
                  min="2020"
                  max="2035"
                  value={newYearVal}
                  onChange={(e) => setNewYearVal(e.target.value)}
                  className="form-input"
                  placeholder="Năm"
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem" }} className="grid-responsive-import">
          {/* File Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderRight: "1px solid var(--border-muted)", paddingRight: "2rem" }} className="import-col-left">
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Option 1: Upload CSV File</h4>
            
            <div style={{
              border: "2px dashed var(--border-muted)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem 1rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              backgroundColor: "rgba(255, 255, 255, 0.01)"
            }}
            onClick={() => document.getElementById("csvFile").click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-muted)"}
            >
              <input 
                type="file" 
                id="csvFile" 
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>Browse files</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>CSV format up to 5MB</p>
            </div>
            {fileName && <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>Selected: {fileName}</span>}
          </div>

          {/* Paste CSV text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Option 2: Paste CSV Text</h4>
            <textarea 
              rows="6"
              placeholder="Paste raw CSV contents here..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="form-input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
            />
            <button onClick={handlePasteSubmit} className="btn btn-secondary" style={{ alignSelf: "flex-end", padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
              Parse Paste Data
            </button>
          </div>
        </div>
      </div>

      {/* CSS Hack for responsive layout */}
      <style>{`
        @media (max-width: 768px) {
          .grid-responsive-import {
            grid-template-columns: 1fr !important;
          }
          .import-col-left {
            border-right: none !important;
            border-bottom: 1px solid var(--border-muted);
            padding-right: 0 !important;
            padding-bottom: 2rem;
          }
        }
      `}</style>

      {/* Errors display */}
      {errorMsg && (
        <div className="glass-card badge-danger" style={{ color: "var(--danger)", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)" }}>
          <strong>Error: </strong> {errorMsg}
        </div>
      )}

      {/* Preview Section */}
      {parsedPreview && (
        <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", border: "1px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-muted)", paddingBottom: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Data Parsing Summary</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Parsed from: {fileName}</span>
            </div>
            <button onClick={handleApply} disabled={isSaving} className="btn btn-primary" style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? "not-allowed" : "pointer" }}>
              {isSaving ? "Đang lưu lên Supabase…" : "Apply Data to Scoreboard"}
            </button>
          </div>

          {/* Stats Counters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Parsed Rows</span>
              <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{parsedPreview.totalRows}</h4>
            </div>
            <div style={{ background: "var(--success-glow)", padding: "1rem", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>Official Designer Tasks</span>
              <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{parsedPreview.tasks.length}</h4>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "1rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ignored (AM / Interns)</span>
              <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-muted)" }}>{parsedPreview.ignoredTasks.length}</h4>
            </div>
          </div>

          {/* Task Preview Table */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Task Log Preview (First 5 tasks)</h4>
            <div className="table-container">
              <table className="kpi-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Project Name</th>
                    <th style={{ textAlign: "center", width: "120px" }}>Package</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedPreview.tasks.slice(0, 5).map((t, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      <td style={{ color: "var(--primary)", fontWeight: 600 }}>{t.assignee}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.project}</td>
                      <td style={{ textAlign: "center" }}>
                        {t.package ? (
                          <span className="badge badge-success" style={{ padding: "0.2rem 0.5rem" }}>{t.package}</span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>
                        )}
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
  );
}
