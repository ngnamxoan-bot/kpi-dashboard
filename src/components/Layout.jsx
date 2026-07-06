import React from "react";

// Inline SVG Icons
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconReport = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  totalTasks, 
  targetPoints,
  currentMonthKey,
  setCurrentMonthKey,
  monthsData,
  isManager,
  onLoginClick,
  onLogout,
  onManualSave
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { id: "profiles", label: "Designer Profiles", icon: <IconProfile /> },
    { id: "report", label: "Workload Report", icon: <IconReport /> },
    ...(isManager ? [
      { id: "import", label: "CSV Import", icon: <IconUpload /> },
      { id: "settings", label: "Rules & Settings", icon: <IconSettings /> },
    ] : [])
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-muted)",
        position: "fixed",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 100
      }}>
        <div>
          {/* Logo Brand */}
          <div style={{
            padding: "2rem 1.5rem",
            borderBottom: "1px solid var(--border-muted)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px 0 var(--primary-glow)",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "#070913"
            }}>
              M
            </div>
            <div>
              <h1 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "white" }}>MAC MEDIA</h1>
              <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--primary)" }}>KPI System</span>
            </div>
          </div>

          {/* Month Switcher Dropdown */}
          <div style={{
            padding: "1.25rem 1.25rem 0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}>
            <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: 600 }}>Active Month</span>
            <select
              value={currentMonthKey}
              onChange={(e) => setCurrentMonthKey(e.target.value)}
              className="form-select"
              style={{
                background: "rgba(15, 19, 44, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--primary)"
              }}
            >
              {Object.keys(monthsData || {}).map(key => (
                <option key={key} value={key}>
                  {monthsData[key]?.label || key}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: isActive ? "rgba(0, 242, 254, 0.08)" : "transparent",
                    border: "none",
                    color: isActive ? "var(--primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9rem",
                    transition: "var(--transition-smooth)",
                    borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: "1.5rem",
          borderTop: "1px solid var(--border-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem"
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Data:</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>{monthsData[currentMonthKey]?.label || currentMonthKey}</span>
          <span style={{ fontSize: "0.65rem", color: "var(--primary)", marginTop: "0.5rem" }}>v1.0.0 · Live calculated</span>

          <button 
            onClick={isManager ? onLogout : onLoginClick}
            className="btn"
            style={{
              marginTop: "0.75rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.75rem",
              background: isManager ? "rgba(239, 68, 68, 0.1)" : "rgba(0, 242, 254, 0.1)",
              color: isManager ? "var(--danger)" : "var(--primary)",
              border: isManager ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(0, 242, 254, 0.3)",
              width: "100%",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {isManager ? "🔒 Log Out Admin" : "🔓 Admin Login"}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Topbar header */}
        <header style={{
          marginLeft: "var(--sidebar-width)",
          height: "70px",
          borderBottom: "1px solid var(--border-muted)",
          backdropFilter: "blur(8px)",
          background: "rgba(7, 9, 19, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2.5rem",
          position: "sticky",
          top: 0,
          zIndex: 90
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>
            {activeTab === "dashboard" ? "Team KPI Scoreboard" :
             activeTab === "profiles" ? "Designer Performance Profiles" :
             activeTab === "report" ? "Workload & Package Analytics" :
             activeTab === "import" ? "Ingest Task Data" : "Configuration Settings"}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Manual Save Button */}
            <button
              onClick={onManualSave}
              className="btn btn-primary"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                gap: "0.4rem",
                display: "inline-flex",
                alignItems: "center",
                background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
                boxShadow: "0 0 10px 0 var(--secondary-glow)",
                border: "none",
                cursor: "pointer"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Lưu dữ liệu
            </button>

            {/* Quick Stat Badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-muted)",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8rem"
            }}>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Total Tasks: </span>
                <span style={{ fontWeight: 700, color: "white" }}>{totalTasks}</span>
              </div>
              <div style={{ width: "1px", height: "16px", backgroundColor: "var(--border-muted)" }} />
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Target: </span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{targetPoints} pts</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
