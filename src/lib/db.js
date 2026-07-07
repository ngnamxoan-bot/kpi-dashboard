import { supabase } from "./supabase";

// ─── Config ───────────────────────────────────────────────────────────────────

export async function fetchConfig() {
  const { data, error } = await supabase
    .from("kpi_config")
    .select("value")
    .eq("key", "main")
    .maybeSingle();
  if (error) throw error;
  return data?.value || null;
}

export async function saveConfig(config) {
  const { error } = await supabase
    .from("kpi_config")
    .upsert({ key: "main", value: config }, { onConflict: "key" });
  if (error) throw error;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function fetchCatalog() {
  const { data, error } = await supabase
    .from("kpi_catalog")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveCatalog(catalog) {
  const { error: delError } = await supabase
    .from("kpi_catalog")
    .delete()
    .neq("id", 0);
  if (delError) throw delError;

  if (catalog.length === 0) return;
  const rows = catalog.map(({ name, type, points, base }) => ({ name, type, points, base }));
  const { error } = await supabase.from("kpi_catalog").insert(rows);
  if (error) throw error;
}

// ─── Months ───────────────────────────────────────────────────────────────────

export async function fetchMonths() {
  const { data, error } = await supabase
    .from("kpi_months")
    .select("key, label")
    .order("key", { ascending: true });
  if (error) throw error;
  const map = {};
  for (const row of data || []) map[row.key] = { label: row.label };
  return map;
}

export async function ensureMonth(key, label) {
  const { error } = await supabase
    .from("kpi_months")
    .upsert({ key, label }, { onConflict: "key" });
  if (error) throw error;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function fetchTasks(monthKey) {
  const PAGE = 1000;
  const allRows = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("kpi_tasks")
      .select("title, assignee, project, package")
      .eq("month_key", monthKey)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    allRows.push(...(data || []));
    if ((data || []).length < PAGE) break;
    offset += PAGE;
  }

  return allRows.map((row) => ({
    title: row.title,
    assignee: row.assignee,
    project: row.project,
    package: row.package || null,
  }));
}

export async function importTasks(monthKey, monthLabel, tasks) {
  await ensureMonth(monthKey, monthLabel);

  const { error: delError } = await supabase
    .from("kpi_tasks")
    .delete()
    .eq("month_key", monthKey);
  if (delError) throw delError;

  if (tasks.length === 0) return;
  const CHUNK = 500;
  for (let i = 0; i < tasks.length; i += CHUNK) {
    const chunk = tasks.slice(i, i + CHUNK).map((t) => ({
      month_key: monthKey,
      title: t.title,
      assignee: t.assignee,
      project: t.project,
      package: t.package || null,
    }));
    const { error } = await supabase.from("kpi_tasks").insert(chunk);
    if (error) throw error;
  }
}

// ─── Manager Inputs ───────────────────────────────────────────────────────────

export async function fetchManagerInputs(monthKey) {
  const { data, error } = await supabase
    .from("kpi_manager_inputs")
    .select("assignee, inputs")
    .eq("month_key", monthKey);
  if (error) throw error;
  const map = {};
  for (const row of data || []) map[row.assignee] = row.inputs;
  return map;
}

export async function saveManagerInput(monthKey, assignee, inputs) {
  const { error } = await supabase
    .from("kpi_manager_inputs")
    .upsert({ month_key: monthKey, assignee, inputs }, { onConflict: "month_key,assignee" });
  if (error) throw error;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export async function seedDefaultData(
  defaultConfig,
  defaultCatalog,
  monthKey,
  monthLabel,
  defaultTasks,
  defaultManagers
) {
  await saveConfig(defaultConfig);

  const rows = defaultCatalog.map(({ name, type, points, base }) => ({ name, type, points, base }));
  const { error: catErr } = await supabase.from("kpi_catalog").insert(rows);
  if (catErr) throw catErr;

  await importTasks(monthKey, monthLabel, defaultTasks);

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
