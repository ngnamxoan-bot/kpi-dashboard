import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import DesignerProfile from "./components/DesignerProfile";
import CSVImporter from "./components/CSVImporter";
import ConfigPanel from "./components/ConfigPanel";
import ManagerInputModal from "./components/ManagerInputModal";
import WorkloadReport from "./components/WorkloadReport";

import {
  DEFAULT_CONFIG,
  DEFAULT_CATALOG,
  DEFAULT_DESIGNERS,
  DEFAULT_TASKS,
  DEFAULT_MANAGER_INPUTS,
} from "./data/defaultData";
import { calculateKPI } from "./utils/kpiCalculator";
import {
  fetchConfig,
  saveConfig,
  fetchCatalog,
  saveCatalog,
  fetchMonths,
  fetchTasks,
  fetchManagerInputs,
  importTasks,
  saveManagerInput,
  seedDefaultData,
  clearAllData,
} from "./lib/db";

const DEFAULT_MONTH_KEY = "2026-06";
const DEFAULT_MONTH_LABEL = "Tháng 06/2026";

export default function App() {
  // ── Loading / error state ─────────────────────────────────────────────────
  const [dbStatus, setDbStatus] = useState("loading"); // "loading" | "seeding" | "ready" | "error"
  const [dbError, setDbError] = useState("");

  // ── Core app state ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDesignerName, setSelectedDesignerName] = useState("Helia");
  const [editingDesignerName, setEditingDesignerName] = useState(null);

  const [isManager, setIsManager] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [currentMonthKey, setCurrentMonthKey] = useState(DEFAULT_MONTH_KEY);
  const [monthsData, setMonthsData] = useState({});

  // Per-month task + managerInputs cache: { [monthKey]: { tasks, managerInputs } }
  const [monthCache, setMonthCache] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  // Debounce refs for auto-save
  const configSaveTimer = useRef(null);
  const catalogSaveTimer = useRef(null);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  // ── Initial load from Supabase ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Check if config exists – if not, seed defaults
        let cfg = await fetchConfig();
        const needsSeed = !cfg;

        if (needsSeed) {
          setDbStatus("seeding");
          await seedDefaultData(
            DEFAULT_CONFIG,
            DEFAULT_CATALOG,
            DEFAULT_TASKS,
            DEFAULT_MANAGER_INPUTS,
            DEFAULT_MONTH_KEY,
            DEFAULT_MONTH_LABEL
          );
          cfg = DEFAULT_CONFIG;
        }

        // 2. Load catalog and months in parallel
        const [cat, months] = await Promise.all([fetchCatalog(), fetchMonths()]);

        if (cancelled) return;

        setConfig(cfg);
        setCatalog(cat.length > 0 ? cat : DEFAULT_CATALOG);

        const resolvedMonths =
          Object.keys(months).length > 0
            ? months
            : { [DEFAULT_MONTH_KEY]: { label: DEFAULT_MONTH_LABEL } };
        setMonthsData(resolvedMonths);

        // 3. Load data for the latest month
        const monthKeys = Object.keys(resolvedMonths).sort();
        const activeKey = monthKeys[monthKeys.length - 1];
        setCurrentMonthKey(activeKey);

        const [tasks, managerInputs] = await Promise.all([
          fetchTasks(activeKey),
          fetchManagerInputs(activeKey),
        ]);

        if (cancelled) return;

        setMonthCache({ [activeKey]: { tasks, managerInputs } });
        setDbStatus("ready");
      } catch (err) {
        if (!cancelled) {
          console.error("DB init error:", err);
          setDbError(err.message || String(err));
          setDbStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load month data when switching months ─────────────────────────────────
  useEffect(() => {
    if (dbStatus !== "ready") return;
    if (monthCache[currentMonthKey]) return;

    let cancelled = false;
    async function loadMonth() {
      try {
        const [tasks, managerInputs] = await Promise.all([
          fetchTasks(currentMonthKey),
          fetchManagerInputs(currentMonthKey),
        ]);
        if (cancelled) return;
        setMonthCache((prev) => ({
          ...prev,
          [currentMonthKey]: { tasks, managerInputs },
        }));
      } catch (err) {
        console.error("Error loading month:", err);
        showToast("Lỗi tải dữ liệu tháng: " + err.message);
      }
    }
    loadMonth();
    return () => {
      cancelled = true;
    };
  }, [currentMonthKey, dbStatus, monthCache, showToast]);

  // ── Auto-save config (debounced 1s after change) ──────────────────────────
  useEffect(() => {
    if (dbStatus !== "ready") return;
    clearTimeout(configSaveTimer.current);
    configSaveTimer.current = setTimeout(async () => {
      try { await saveConfig(config); } catch (e) { console.error(e); }
    }, 1000);
    return () => clearTimeout(configSaveTimer.current);
  }, [config, dbStatus]);

  // ── Auto-save catalog (debounced 1s after change) ─────────────────────────
  useEffect(() => {
    if (dbStatus !== "ready") return;
    clearTimeout(catalogSaveTimer.current);
    catalogSaveTimer.current = setTimeout(async () => {
      try { await saveCatalog(catalog); } catch (e) { console.error(e); }
    }, 1000);
    return () => clearTimeout(catalogSaveTimer.current);
  }, [catalog, dbStatus]);

  // ── Derived values ────────────────────────────────────────────────────────
  const activeMonthData = monthCache[currentMonthKey] || { tasks: [], managerInputs: {} };

  const scorecards = calculateKPI(
    DEFAULT_DESIGNERS,
    activeMonthData.tasks,
    activeMonthData.managerInputs,
    config,
    catalog
  );

  const totalTasksCount = activeMonthData.tasks.length;

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleLoginSubmit = () => {
    const correctPassword = config.managerPassword || "macmedia123";
    if (loginPassword === correctPassword) {
      setIsManager(true);
      setShowLoginModal(false);
      setLoginPassword("");
      setLoginError("");
      showToast("Đã đăng nhập quản trị thành công!");
    } else {
      setLoginError("Sai mật khẩu. Vui lòng thử lại.");
    }
  };

  const handleManualSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await Promise.all([saveConfig(config), saveCatalog(catalog)]);
      showToast("Đã lưu toàn bộ cấu hình thành công!");
    } catch (err) {
      showToast("Lỗi lưu dữ liệu: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManagerInputs = async (name, inputs) => {
    try {
      await saveManagerInput(currentMonthKey, name, inputs);
      setMonthCache((prev) => ({
        ...prev,
        [currentMonthKey]: {
          ...prev[currentMonthKey],
          managerInputs: {
            ...(prev[currentMonthKey]?.managerInputs || {}),
            [name]: inputs,
          },
        },
      }));
      setEditingDesignerName(null);
      showToast(`Đã lưu đánh giá cho ${name}`);
    } catch (err) {
      showToast("Lỗi lưu đánh giá: " + err.message);
    }
  };

  const handleImportTasks = async (monthKey, label, newTasks) => {
    try {
      setIsSaving(true);
      await importTasks(monthKey, label, newTasks);

      const [months, tasks, managerInputs] = await Promise.all([
        fetchMonths(),
        fetchTasks(monthKey),
        fetchManagerInputs(monthKey),
      ]);

      setMonthsData(months);
      setMonthCache((prev) => ({ ...prev, [monthKey]: { tasks, managerInputs } }));
      setCurrentMonthKey(monthKey);
      setSelectedDesignerName(DEFAULT_DESIGNERS[0]?.name || "");
      setActiveTab("dashboard");
      showToast(`Đã import ${newTasks.length} task cho ${label}!`);
    } catch (err) {
      showToast("Lỗi import: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAllData = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await clearAllData();
      setMonthsData({ [DEFAULT_MONTH_KEY]: { label: DEFAULT_MONTH_LABEL } });
      setMonthCache({ [DEFAULT_MONTH_KEY]: { tasks: [], managerInputs: {} } });
      setCurrentMonthKey(DEFAULT_MONTH_KEY);
      setActiveTab("import");
      showToast("Đã xoá toàn bộ dữ liệu task. Hãy import CSV mới!");
    } catch (err) {
      showToast("Lỗi xoá dữ liệu: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProfile = (name) => {
    setSelectedDesignerName(name);
    setActiveTab("profiles");
  };

  const exportToCSV = () => {
    const headers = [
      "Hạng","Designer","Nhóm","Tổng số task","Tổng điểm thô",
      "PROX5","PROX4","PROX3","SEM","SE1","SE0","E0","KHAC","Đã phân loại gói",
      "Hệ số độ khó TB","Điểm số lượng","Điểm độ khó",
      "Chất lượng TB (1-3)","Điểm chất lượng",
      "Số task trễ hạn","Tổng ngày trễ","Điểm bonus","Ghi chú bonus",
      "Điểm bonus/trễ","TỔNG ĐIỂM KPI (%)","Trạng thái",
    ];
    const rows = scorecards.map((sc) => [
      sc.rank, sc.designerName, sc.group, sc.totalTasks,
      sc.totalPointsTho.toFixed(1),
      sc.packageCounts.PROX5, sc.packageCounts.PROX4, sc.packageCounts.PROX3,
      sc.packageCounts.SEM, sc.packageCounts.SE1, sc.packageCounts.SE0, sc.packageCounts.E0, sc.packageCounts.KHAC,
      sc.daPhanLoaiGoi, sc.avgDifficultyCoefficient.toFixed(2),
      sc.diemSoLuong.toFixed(1), sc.diemDoKho.toFixed(1),
      sc.qualityRating !== null ? sc.qualityRating : "",
      sc.diemChatLuong !== null ? sc.diemChatLuong.toFixed(1) : "",
      sc.lateTasks, sc.lateDays, sc.bonusScore,
      `"${(sc.bonusNotes || "").replace(/"/g, '""')}"`,
      sc.diemBonusTre.toFixed(1), sc.tongDiemKpi.toFixed(1), sc.trangThai,
    ]);
    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KPI_${currentMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Loading / error screens ───────────────────────────────────────────────
  if (dbStatus === "loading" || dbStatus === "seeding") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
        background: "var(--bg-dark)"
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          border: "3px solid rgba(0,242,254,0.12)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.9s linear infinite"
        }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>
            {dbStatus === "seeding" ? "Đang khởi tạo dữ liệu…" : "Đang kết nối Supabase…"}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            {dbStatus === "seeding"
              ? "Lần đầu chạy – đang seed dữ liệu tháng 06/2026"
              : "Vui lòng chờ…"}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (dbStatus === "error") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "1.5rem",
        background: "var(--bg-dark)", padding: "2rem"
      }}>
        <div style={{
          maxWidth: "560px", width: "100%",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "16px", padding: "2rem",
          display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)" }}>
            Không thể kết nối cơ sở dữ liệu
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Hãy đảm bảo đã chạy script SQL để tạo bảng trước khi dùng app.
          </p>
          <code style={{
            background: "rgba(0,0,0,0.4)", padding: "0.75rem 1rem",
            borderRadius: "8px", fontSize: "0.75rem", color: "var(--danger)",
            wordBreak: "break-all", lineHeight: 1.6
          }}>
            {dbError}
          </code>
          <div style={{
            background: "rgba(0,242,254,0.04)",
            border: "1px solid rgba(0,242,254,0.15)",
            borderRadius: "10px", padding: "1rem",
            fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 2
          }}>
            <strong style={{ color: "var(--primary)" }}>Hướng dẫn setup:</strong><br />
            1. Vào <strong>Supabase Dashboard → SQL Editor</strong><br />
            2. Mở file <code style={{ color: "var(--primary)" }}>supabase/schema.sql</code> trong project<br />
            3. Copy toàn bộ và nhấn Run<br />
            4. Reload trang này
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ alignSelf: "flex-start" }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
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
        showToast("Đã đăng xuất chế độ quản trị.");
      }}
      onManualSave={handleManualSave}
      isSaving={isSaving}
    >
      {/* Toast notification */}
      {toastMsg && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "rgba(7,19,44,0.95)", color: "white",
          padding: "0.85rem 1.5rem", borderRadius: "var(--radius-md)",
          boxShadow: "0 10px 25px rgba(0,242,254,0.15)",
          zIndex: 2000, fontSize: "0.85rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "0.5rem",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,242,254,0.25)",
          animation: "fadeIn 0.3s ease"
        }}>
          {toastMsg}
        </div>
      )}

      {activeTab === "dashboard" && (
        <Dashboard
          scorecards={scorecards}
          onEditDesigner={setEditingDesignerName}
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
          onEditDesigner={setEditingDesignerName}
          isManager={isManager}
        />
      )}

      {activeTab === "report" && <WorkloadReport scorecards={scorecards} />}

      {activeTab === "import" && (
        <CSVImporter
          onImportTasks={handleImportTasks}
          officialDesigners={DEFAULT_DESIGNERS}
          config={config}
          monthsData={monthsData}
          isSaving={isSaving}
        />
      )}

      {activeTab === "settings" && (
        <ConfigPanel
          config={config}
          setConfig={setConfig}
          catalog={catalog}
          setCatalog={setCatalog}
          onClearAllData={handleClearAllData}
          isSaving={isSaving}
        />
      )}

      {editingDesignerName && (
        <ManagerInputModal
          designerName={editingDesignerName}
          currentInputs={activeMonthData.managerInputs[editingDesignerName]}
          onSave={handleSaveManagerInputs}
          onClose={() => setEditingDesignerName(null)}
        />
      )}

      {showLoginModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(7,9,19,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: "360px", padding: "2rem",
            display: "flex", flexDirection: "column", gap: "1.25rem",
            position: "relative"
          }}>
            <button
              onClick={() => { setShowLoginModal(false); setLoginPassword(""); setLoginError(""); }}
              style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "transparent", border: "none",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem"
              }}
            >✕</button>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>
              Đăng nhập quản trị
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Nhập mật khẩu để mở khóa import CSV, cấu hình và đánh giá.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <input
                type="password"
                placeholder="Mật khẩu..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleLoginSubmit(); }}
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
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
