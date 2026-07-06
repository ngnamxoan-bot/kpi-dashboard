import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import DesignerProfile from "./components/DesignerProfile";
import CSVImporter from "./components/CSVImporter";
import ConfigPanel from "./components/ConfigPanel";
import ManagerInputModal from "./components/ManagerInputModal";
import WorkloadReport from "./components/WorkloadReport";

// Initial static data and calculation utility
import { 
  DEFAULT_CONFIG, 
  DEFAULT_CATALOG, 
  DEFAULT_DESIGNERS, 
  DEFAULT_TASKS, 
  DEFAULT_MANAGER_INPUTS 
} from "./data/defaultData";
import { calculateKPI } from "./utils/kpiCalculator";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDesignerName, setSelectedDesignerName] = useState("Helia");
  const [editingDesignerName, setEditingDesignerName] = useState(null);

  const [isManager, setIsManager] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  // Core state with local storage fallback
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("kpi_config");
    const parsed = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    if (!parsed.managerPassword) {
      parsed.managerPassword = "macmedia123";
    }
    return parsed;
  });

  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem("kpi_catalog");
    return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
  });

  const [currentMonthKey, setCurrentMonthKey] = useState(() => {
    const saved = localStorage.getItem("kpi_current_month_key");
    return saved || "2026-06";
  });

  const [monthsData, setMonthsData] = useState(() => {
    const saved = localStorage.getItem("kpi_months_data");
    if (saved) {
      return JSON.parse(saved);
    }
    // Migration fallback for old single-month database
    const oldTasks = localStorage.getItem("kpi_tasks");
    const oldInputs = localStorage.getItem("kpi_manager_inputs");
    if (oldTasks || oldInputs) {
      return {
        "2026-06": {
          label: "Tháng 06/2026",
          tasks: oldTasks ? JSON.parse(oldTasks) : DEFAULT_TASKS,
          managerInputs: oldInputs ? JSON.parse(oldInputs) : DEFAULT_MANAGER_INPUTS
        }
      };
    }
    // Initialize with June 2026 default data
    return {
      "2026-06": {
        label: "Tháng 06/2026",
        tasks: DEFAULT_TASKS,
        managerInputs: DEFAULT_MANAGER_INPUTS
      }
    };
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem("kpi_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("kpi_catalog", JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem("kpi_current_month_key", currentMonthKey);
  }, [currentMonthKey]);

  useEffect(() => {
    localStorage.setItem("kpi_months_data", JSON.stringify(monthsData));
  }, [monthsData]);

  // Perform KPI Calculations dynamically
  const activeMonth = (monthsData && monthsData[currentMonthKey]) || { tasks: [], managerInputs: {} };
  
  const scorecards = calculateKPI(
    DEFAULT_DESIGNERS,
    activeMonth.tasks || [],
    activeMonth.managerInputs || {},
    config,
    catalog
  );

  // Total tasks count for current month
  const totalTasksCount = activeMonth.tasks ? activeMonth.tasks.length : 0;
  const activeManagerInputs = activeMonth.managerInputs || {};

  // Actions
  const handleEditDesigner = (name) => {
    setEditingDesignerName(name);
  };

  const handleLoginSubmit = () => {
    const correctPassword = config.managerPassword || "macmedia123";
    if (loginPassword === correctPassword) {
      setIsManager(true);
      setShowLoginModal(false);
      setLoginPassword("");
      setLoginError("");
      showToast("🔓 Đã đăng nhập quản trị thành công!");
    } else {
      setLoginError("Incorrect password. Please try again.");
    }
  };

  const handleManualSave = () => {
    localStorage.setItem("kpi_config", JSON.stringify(config));
    localStorage.setItem("kpi_catalog", JSON.stringify(catalog));
    localStorage.setItem("kpi_current_month_key", currentMonthKey);
    localStorage.setItem("kpi_months_data", JSON.stringify(monthsData));
    showToast("💾 Đã lưu toàn bộ cấu hình và dữ liệu thành công!");
  };

  const handleSaveManagerInputs = (name, inputs) => {
    setMonthsData(prev => ({
      ...prev,
      [currentMonthKey]: {
        ...prev[currentMonthKey],
        managerInputs: {
          ...(prev[currentMonthKey]?.managerInputs || {}),
          [name]: inputs
        }
      }
    }));
    setEditingDesignerName(null);
  };

  const createDefaultManagerInputs = () => {
    const inputs = {};
    DEFAULT_DESIGNERS.forEach(d => {
      inputs[d.name] = {
        quality: null,
        lateTasks: 0,
        lateDays: 0,
        bonus: 0,
        bonusNotes: ""
      };
    });
    return inputs;
  };

  const handleImportTasks = (monthKey, label, newTasks, newIgnored) => {
    setMonthsData(prev => {
      const existingInputs = prev[monthKey]?.managerInputs;
      const initialInputs = existingInputs || createDefaultManagerInputs();

      return {
        ...prev,
        [monthKey]: {
          label,
          tasks: newTasks,
          managerInputs: initialInputs
        }
      };
    });
    
    setCurrentMonthKey(monthKey);

    // Select first designer as default profile view
    if (DEFAULT_DESIGNERS.length > 0) {
      setSelectedDesignerName(DEFAULT_DESIGNERS[0].name);
    }
    
    // Navigate back to Dashboard to see updated results
    setActiveTab("dashboard");
  };

  const handleViewProfile = (name) => {
    setSelectedDesignerName(name);
    setActiveTab("profiles");
  };

  // Export computed KPI scorecard back to CSV
  const exportToCSV = () => {
    const headers = [
      "Hạng",
      "Designer",
      "Nhóm",
      "Tổng số task",
      "Tổng điểm thô (loại task)",
      "PROX5",
      "PROX4",
      "PROX3",
      "SEM",
      "SE1",
      "E0",
      "Đã phân loại gói",
      "Hệ số độ khó TB",
      "Điểm số lượng",
      "Điểm độ khó",
      "Chất lượng TB (1-5)",
      "Điểm chất lượng",
      "Số task trễ hạn",
      "Tổng ngày trễ",
      "Điểm bonus",
      "Ghi chú bonus",
      "Điểm bonus/trễ",
      "TỔNG ĐIỂM KPI (%)",
      "Trạng thái"
    ];

    const rows = scorecards.map(sc => [
      sc.rank,
      sc.designerName,
      sc.group,
      sc.totalTasks,
      sc.totalPointsTho.toFixed(1),
      sc.packageCounts.PROX5,
      sc.packageCounts.PROX4,
      sc.packageCounts.PROX3,
      sc.packageCounts.SEM,
      sc.packageCounts.SE1,
      sc.packageCounts.E0,
      sc.daPhanLoaiGoi,
      sc.avgDifficultyCoefficient.toFixed(2),
      sc.diemSoLuong.toFixed(1),
      sc.diemDoKho.toFixed(1),
      sc.qualityRating !== null ? sc.qualityRating : "",
      sc.diemChatLuong !== null ? sc.diemChatLuong.toFixed(1) : "",
      sc.lateTasks,
      sc.lateDays,
      sc.bonusScore,
      `"${sc.bonusNotes.replace(/"/g, '""')}"`,
      sc.diemBonusTre.toFixed(1),
      sc.tongDiemKpi.toFixed(1),
      sc.trangThai
    ]);

    const csvContent = "\uFEFF" + [ // Add BOM for Excel UTF-8 support
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bảng_điểm_KPI_Designer_Xuất_Excel.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      totalTasks={totalTasksCount}
      targetPoints={config.targetPoints}
      currentMonthKey={currentMonthKey}
      setCurrentMonthKey={setCurrentMonthKey}
      monthsData={monthsData}
      isManager={isManager}
      onLoginClick={() => setShowLoginModal(true)}
      onLogout={() => {
        setIsManager(false);
        setActiveTab("dashboard");
        showToast("🔒 Đã đăng xuất chế độ quản trị.");
      }}
      onManualSave={handleManualSave}
    >
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "rgba(7, 19, 44, 0.9)",
          color: "white",
          padding: "0.85rem 1.5rem",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 10px 25px rgba(0, 242, 254, 0.15)",
          zIndex: 2000,
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          transition: "all 0.3s ease"
        }}>
          {toastMsg}
        </div>
      )}
      {/* Active page rendering */}
      {activeTab === "dashboard" && (
        <Dashboard 
          scorecards={scorecards}
          onEditDesigner={handleEditDesigner}
          onViewProfile={handleViewProfile}
          exportToCSV={exportToCSV}
          isManager={isManager}
        />
      )}

      {activeTab === "profiles" && (
        <DesignerProfile 
          scorecards={scorecards}
          selectedDesignerName={selectedDesignerName}
          setSelectedDesignerName={setSelectedDesignerName}
          onEditDesigner={handleEditDesigner}
          isManager={isManager}
        />
      )}

      {activeTab === "report" && (
        <WorkloadReport 
          scorecards={scorecards}
        />
      )}

      {activeTab === "import" && (
        <CSVImporter 
          onImportTasks={handleImportTasks}
          officialDesigners={DEFAULT_DESIGNERS}
          config={config}
          monthsData={monthsData}
        />
      )}

      {activeTab === "settings" && (
        <ConfigPanel 
          config={config}
          setConfig={setConfig}
          catalog={catalog}
          setCatalog={setCatalog}
        />
      )}

      {/* Metric entry modal Overlay */}
      {editingDesignerName && (
        <ManagerInputModal 
          designerName={editingDesignerName}
          currentInputs={activeManagerInputs[editingDesignerName]}
          onSave={handleSaveManagerInputs}
          onClose={() => setEditingDesignerName(null)}
        />
      )}

      {/* Passcode Login Modal */}
      {showLoginModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(7, 9, 19, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: "360px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            position: "relative"
          }}>
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setLoginPassword("");
                setLoginError("");
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "1.2rem"
              }}
            >
              ✕
            </button>
            
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>Manager Auth Panel</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Enter the manager password to unlock editing, catalog config, and CSV ingestion tools.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <input 
                type="password"
                placeholder="Password..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoginSubmit();
                }}
                className="form-input"
                style={{ fontFamily: "monospace" }}
                autoFocus
              />
              {loginError && (
                <span style={{ fontSize: "0.75rem", color: "var(--danger)", fontWeight: 600 }}>
                  {loginError}
                </span>
              )}
            </div>
            
            <button 
              onClick={handleLoginSubmit}
              className="btn btn-primary"
              style={{ justifyContent: "center" }}
            >
              Unlock Manager Options
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
