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
  DEFAULT_MONTH_KEY,
  DEFAULT_MONTH_LABEL,
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

import "./index.css";
import "./App.css";

// ─── Lock Screen ─────────────────────────────────────────────────────────────

function LockScreen({ onUnlock, error }) {
  const [pw, setPw] = useState("");
  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <text x="14" y="20" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter,sans-serif">M</text>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, background: "var(--brand-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.25rem" }}>
            MAC MEDIA KPI
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Nhập mật khẩu để tiếp tục</div>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="password"
            className="form-input"
            placeholder="Mật khẩu"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock(pw)}
            autoFocus
            style={{ textAlign: "center", fontFamily: "monospace", letterSpacing: "0.1em" }}
          />
          {error && <div style={{ fontSize: "0.78rem", color: "var(--danger)", textAlign: "center" }}>{error}</div>}
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => onUnlock(pw)}>
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Auth
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Loading
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [catalog, setCatalogState] = useState(DEFAULT_CATALOG);
  const [monthsData, setMonthsData] = useState({ [DEFAULT_MONTH_KEY]: { label: DEFAULT_MONTH_LABEL } });
  const [currentMonthKey, setCurrentMonthKey] = useState(DEFAULT_MONTH_KEY);
  // monthCache: { [monthKey]: { tasks, managerInputs } }
  const [monthCache, setMonthCache] = useState({});

  // UI
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDesignerName, setSelectedDesignerName] = useState(null);
  const [managerInputTarget, setManagerInputTarget] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  // ── Boot ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [cfg, cat, months] = await Promise.all([fetchConfig(), fetchCatalog(), fetchMonths()]);

        if (!cfg) {
          // First boot — seed data
          await seedDefaultData(
            DEFAULT_CONFIG, DEFAULT_CATALOG,
            DEFAULT_MONTH_KEY, DEFAULT_MONTH_LABEL,
            DEFAULT_TASKS, DEFAULT_MANAGER_INPUTS
          );
          setConfigState(DEFAULT_CONFIG);
          setCatalogState(DEFAULT_CATALOG);
          setMonthsData({ [DEFAULT_MONTH_KEY]: { label: DEFAULT_MONTH_LABEL } });
        } else {
          setConfigState(cfg);
          if (cat.length) setCatalogState(cat);
          if (Object.keys(months).length) {
            setMonthsData(months);
            const latestKey = Object.keys(months).sort().reverse()[0];
            setCurrentMonthKey(latestKey);
          }
        }
      } catch (err) {
        showToast("Lỗi kết nối DB: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch month tasks when month changes ──────────────────────────────────

  useEffect(() => {
    if (!currentMonthKey || monthCache[currentMonthKey]) return;
    (async () => {
      try {
        const [tasks, managerInputs] = await Promise.all([
          fetchTasks(currentMonthKey),
          fetchManagerInputs(currentMonthKey),
        ]);
        setMonthCache((prev) => ({ ...prev, [currentMonthKey]: { tasks, managerInputs } }));
      } catch (err) {
        showToast("Lỗi tải dữ liệu: " + err.message);
      }
    })();
  }, [currentMonthKey]);

  // ── Save config ───────────────────────────────────────────────────────────

  const setConfig = useCallback(async (updater) => {
    setConfigState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveConfig(next).catch((e) => showToast("Lỗi lưu config: " + e.message));
      return next;
    });
  }, [showToast]);

  const setCatalog = useCallback(async (updater) => {
    setCatalogState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCatalog(next).catch((e) => showToast("Lỗi lưu catalog: " + e.message));
      return next;
    });
  }, [showToast]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleUnlock = (pw) => {
    if (pw === (config.managerPassword || "macmedia123")) {
      setIsUnlocked(true);
      setLoginError("");
    } else {
      setLoginError("Mật khẩu không đúng");
    }
  };

  // ── Import tasks ──────────────────────────────────────────────────────────

  const handleImportTasks = async (monthKey, label, tasks) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await importTasks(monthKey, label, tasks);
      setMonthsData((prev) => ({ ...prev, [monthKey]: { label } }));
      setMonthCache((prev) => ({ ...prev, [monthKey]: { tasks, managerInputs: prev[monthKey]?.managerInputs || {} } }));
      setCurrentMonthKey(monthKey);
      setActiveTab("dashboard");
      showToast(`Đã import ${tasks.length} tasks cho ${label}!`);
    } catch (err) {
      showToast("Lỗi import: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Clear all data ────────────────────────────────────────────────────────

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

  // ── View designer profile ─────────────────────────────────────────────────

  const handleViewProfile = (name) => {
    setSelectedDesignerName(name);
    setActiveTab("profiles");
  };

  // ── Manager input modal ───────────────────────────────────────────────────

  const handleOpenManagerInput = (name) => setManagerInputTarget(name);

  const handleSaveManagerInput = async (inputs) => {
    if (!managerInputTarget) return;
    setIsSaving(true);
    try {
      await saveManagerInput(currentMonthKey, managerInputTarget, inputs);
      setMonthCache((prev) => {
        const cur = prev[currentMonthKey] || { tasks: [], managerInputs: {} };
        return {
          ...prev,
          [currentMonthKey]: {
            ...cur,
            managerInputs: { ...cur.managerInputs, [managerInputTarget]: inputs },
          },
        };
      });
      showToast(`Đã lưu đánh giá cho ${managerInputTarget}`);
    } catch (err) {
      showToast("Lỗi lưu đánh giá: " + err.message);
    } finally {
      setIsSaving(false);
      setManagerInputTarget(null);
    }
  };

  // ── Compute KPI ───────────────────────────────────────────────────────────

  const currentCache = monthCache[currentMonthKey] || { tasks: [], managerInputs: {} };
  const results = calculateKPI(DEFAULT_DESIGNERS, currentCache.tasks, currentCache.managerInputs, catalog, config);
  const selectedResult = results.find((r) => r.name === selectedDesignerName) || null;
  const monthLabel = monthsData[currentMonthKey]?.label || currentMonthKey;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--brand-gradient)" }} />
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Đang tải…</div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <>
        <LockScreen onUnlock={handleUnlock} error={loginError} />
        <Toast message={toast} />
      </>
    );
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        monthsData={monthsData}
        currentMonthKey={currentMonthKey}
        setCurrentMonthKey={setCurrentMonthKey}
        isUnlocked={isUnlocked}
        onLogout={() => setIsUnlocked(false)}
      >
        {activeTab === "dashboard" && (
          <Dashboard
            results={results}
            monthLabel={monthLabel}
            onViewProfile={handleViewProfile}
            onOpenManagerInput={handleOpenManagerInput}
            isUnlocked={isUnlocked}
          />
        )}

        {activeTab === "profiles" && (
          <DesignerProfile
            result={selectedResult || results[0] || null}
            onBack={() => setActiveTab("dashboard")}
            isUnlocked={isUnlocked}
            onOpenManagerInput={handleOpenManagerInput}
          />
        )}

        {activeTab === "workload" && (
          <WorkloadReport results={results} monthLabel={monthLabel} />
        )}

        {activeTab === "import" && (
          <CSVImporter
            onImport={handleImportTasks}
            monthsData={monthsData}
            currentMonthKey={currentMonthKey}
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
      </Layout>

      {managerInputTarget && (
        <ManagerInputModal
          designerName={managerInputTarget}
          initialInputs={currentCache.managerInputs[managerInputTarget]}
          onSave={handleSaveManagerInput}
          onClose={() => setManagerInputTarget(null)}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
