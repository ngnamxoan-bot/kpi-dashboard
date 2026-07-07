import { supabase } from "./supabase";

// ─── Config ──────────────────────────────────────────────────────────────────

function dbRowToConfig(row) {
  return {
    weights: row.weights,
    targetPoints: Number(row.target_points),
    warningThreshold: Number(row.warning_threshold),
    coefficients: row.coefficients,
    hsMin: Number(row.hs_min),
    hsMax: Number(row.hs_max),
    hsDefault: Number(row.hs_default),
    penaltyTask: Number(row.penalty_task),
    penaltyDay: Number(row.penalty_day),
    dailyPostPoints: Number(row.daily_post_points),
    otherPoints: Number(row.other_points),
    managerPassword: row.manager_password,
  };
}

function configToDbRow(cfg) {
  return {
    id: 1,
    weights: cfg.weights,
    target_points: cfg.targetPoints,
    warning_threshold: cfg.warningThreshold,
    coefficients: cfg.coefficients,
    hs_min: cfg.hsMin,
    hs_max: cfg.hsMax,
    hs_default: cfg.hsDefault,
    penalty_task: cfg.penaltyTask,
    penalty_day: cfg.penaltyDay,
    daily_post_points: cfg.dailyPostPoints,
    other_points: cfg.otherPoints,
    manager_password: cfg.managerPassword,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchConfig() {
  const { data, error } = await supabase
    .from("kpi_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data ? dbRowToConfig(data) : null;
}

export async function saveConfig(cfg) {
  const { error } = await supabase
    .from("kpi_config")
    .upsert(configToDbRow(cfg), { onConflict: "id" });
  if (error) throw error;
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

function dbRowToCatalogItem(row) {
  return {
    id: row.id,
    category: row.category,
    type: row.type,
    points: Number(row.points),
    base: row.base || "",
  };
}

export async function fetchCatalog() {
  const { data, error } = await supabase
    .from("kpi_catalog")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(dbRowToCatalogItem);
}

export async function saveCatalog(catalog) {
  // Delete all existing rows then re-insert (catalog is small, ~25 rows)
  const { error: delError } = await supabase
    .from("kpi_catalog")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
  if (delError) throw delError;

  if (catalog.length === 0) return;

  const rows = catalog.map((item, idx) => ({
    category: item.category,
    type: item.type,
    points: item.points,
    base: item.base || null,
    sort_order: idx,
  }));

  const { error } = await supabase.from("kpi_catalog").insert(rows);
  if (error) throw error;
}

// ─── Months ──────────────────────────────────────────────────────────────────

export async function fetchMonths() {
  const { data, error } = await supabase
    .from("kpi_months")
    .select("key, label")
    .order("key", { ascending: true });
  if (error) throw error;
  // Return as { key: { label } } map
  const map = {};
  (data || []).forEach((row) => {
    map[row.key] = { label: row.label };
  });
  return map;
}

export async function ensureMonth(key, label) {
  const { error } = await supabase
    .from("kpi_months")
    .upsert({ key, label }, { onConflict: "key" });
  if (error) throw error;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function fetchTasks(monthKey) {
  const { data, error } = await supabase
    .from("kpi_tasks")
    .select("title, assignee, project, package")
    .eq("month_key", monthKey);
  if (error) throw error;
  return (data || []).map((row) => ({
    title: row.title,
    assignee: row.assignee,
    project: row.project,
    package: row.package || null,
  }));
}

export async function importTasks(monthKey, label, tasks) {
  // Ensure the month row exists first
  await ensureMonth(monthKey, label);

  // Delete existing tasks for this month
  const { error: delError } = await supabase
    .from("kpi_tasks")
    .delete()
    .eq("month_key", monthKey);
  if (delError) throw delError;

  if (tasks.length === 0) return;

  // Batch insert in chunks of 500
  const CHUNK = 500;
  for (let i = 0; i < tasks.length; i += CHUNK) {
    const chunk = tasks.slice(i, i + CHUNK).map((t) => ({
      month_key: monthKey,
      title: t.title || "",
      assignee: t.assignee || "",
      project: t.project || "",
      package: t.package || null,
    }));
    const { error } = await supabase.from("kpi_tasks").insert(chunk);
    if (error) throw error;
  }
}

// ─── Manager Inputs ──────────────────────────────────────────────────────────

export async function fetchManagerInputs(monthKey) {
  const { data, error } = await supabase
    .from("kpi_manager_inputs")
    .select("designer_name, quality, late_tasks, late_days, bonus, bonus_notes")
    .eq("month_key", monthKey);
  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => {
    map[row.designer_name] = {
      quality: row.quality !== null ? Number(row.quality) : null,
      lateTasks: Number(row.late_tasks),
      lateDays: Number(row.late_days),
      bonus: Number(row.bonus),
      bonusNotes: row.bonus_notes || "",
    };
  });
  return map;
}

export async function saveManagerInput(monthKey, designerName, inputs) {
  const { error } = await supabase.from("kpi_manager_inputs").upsert(
    {
      month_key: monthKey,
      designer_name: designerName,
      quality: inputs.quality !== null && inputs.quality !== "" ? Number(inputs.quality) : null,
      late_tasks: Number(inputs.lateTasks) || 0,
      late_days: Number(inputs.lateDays) || 0,
      bonus: Number(inputs.bonus) || 0,
      bonus_notes: inputs.bonusNotes || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "month_key,designer_name" }
  );
  if (error) throw error;
}

// ─── Seed (first-time setup) ─────────────────────────────────────────────────

export async function seedDefaultData(defaultConfig, defaultCatalog, defaultTasks, defaultManagers, monthKey, monthLabel) {
  // Seed config
  await saveConfig(defaultConfig);

  // Seed catalog
  await saveCatalog(defaultCatalog);

  // Seed month + tasks + manager inputs
  await ensureMonth(monthKey, monthLabel);

  await importTasks(monthKey, monthLabel, defaultTasks);

  // Seed manager inputs
  for (const [name, inputs] of Object.entries(defaultManagers)) {
    await saveManagerInput(monthKey, name, inputs);
  }
}

// ─── Clear All Data ───────────────────────────────────────────────────────────

export async function clearAllData() {
  const { error } = await supabase
    .from("kpi_months")
    .delete()
    .neq("key", "");
  if (error) throw error;
}
