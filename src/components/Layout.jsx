import React from "react";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",       icon: "grid" },
  { id: "profiles",   label: "Designer Profiles", icon: "user" },
  { id: "workload",   label: "Workload Report",  icon: "bar-chart" },
  { id: "import",     label: "CSV Import",       icon: "upload" },
  { id: "settings",   label: "Rules & Settings", icon: "settings" },
];

function Icon({ name }) {
  const icons = {
    grid: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
    user: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
      </svg>
    ),
    "bar-chart": (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="7" width="4" height="8" rx="1"/><rect x="6" y="4" width="4" height="11" rx="1"/><rect x="11" y="1" width="4" height="14" rx="1"/>
      </svg>
    ),
    upload: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 11V3M5 6l3-3 3 3"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5"/>
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
      </svg>
    ),
    logout: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function Layout({
  activeTab, setActiveTab,
  monthsData, currentMonthKey, setCurrentMonthKey,
  isUnlocked, onLogout,
  children,
}) {
  const monthKeys = Object.keys(monthsData).sort().reverse();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <text x="9" y="14" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="Inter,sans-serif">M</text>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="brand">MAC MEDIA</span>
            <span className="sub">KPI Dashboard</span>
          </div>
        </div>

        {/* Month selector */}
        <div className="sidebar-month-selector">
          <label>Tháng</label>
          <select
            value={currentMonthKey}
            onChange={(e) => setCurrentMonthKey(e.target.value)}
          >
            {monthKeys.map((k) => (
              <option key={k} value={k}>{monthsData[k]?.label || k}</option>
            ))}
          </select>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeTab === item.id ? " active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon"><Icon name={item.icon} /></span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {isUnlocked && (
            <button className="btn btn-ghost" style={{ width: "100%", color: "var(--danger)", borderColor: "rgba(197,0,27,0.2)" }} onClick={onLogout}>
              <Icon name="logout" /> Đăng xuất
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
