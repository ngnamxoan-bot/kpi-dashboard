-- ============================================================
-- MAC MEDIA KPI Dashboard – Supabase Schema
-- Chạy toàn bộ script này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── kpi_config (singleton row id=1) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_config (
  id                integer PRIMARY KEY DEFAULT 1,
  weights           jsonb   NOT NULL DEFAULT '{"quantity":60,"difficulty":15,"quality":15,"bonus":10}',
  target_points     numeric NOT NULL DEFAULT 150,
  warning_threshold numeric NOT NULL DEFAULT 85,
  coefficients      jsonb   NOT NULL DEFAULT '{"PROX5":1.5,"PROX4":1.3,"PROX3":1.1,"SEM":1.0,"SE1":0.9,"E0":0.7}',
  hs_min            numeric NOT NULL DEFAULT 0.7,
  hs_max            numeric NOT NULL DEFAULT 1.5,
  hs_default        numeric NOT NULL DEFAULT 1.0,
  penalty_task      numeric NOT NULL DEFAULT -2.0,
  penalty_day       numeric NOT NULL DEFAULT -0.5,
  daily_post_points numeric NOT NULL DEFAULT 1.0,
  other_points      numeric NOT NULL DEFAULT 2.0,
  manager_password  text    NOT NULL DEFAULT 'macmedia123',
  updated_at        timestamptz DEFAULT now()
);
ALTER TABLE kpi_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kpi_config"  ON kpi_config;
DROP POLICY IF EXISTS "anon_insert_kpi_config"  ON kpi_config;
DROP POLICY IF EXISTS "anon_update_kpi_config"  ON kpi_config;
DROP POLICY IF EXISTS "anon_delete_kpi_config"  ON kpi_config;
CREATE POLICY "anon_select_kpi_config" ON kpi_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_kpi_config" ON kpi_config FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_kpi_config" ON kpi_config FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_kpi_config" ON kpi_config FOR DELETE TO anon, authenticated USING (true);

-- ─── kpi_catalog ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_catalog (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  category   text    NOT NULL,
  type       text    NOT NULL,
  points     numeric NOT NULL,
  base       text,
  sort_order integer DEFAULT 0
);
ALTER TABLE kpi_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kpi_catalog" ON kpi_catalog;
DROP POLICY IF EXISTS "anon_insert_kpi_catalog" ON kpi_catalog;
DROP POLICY IF EXISTS "anon_update_kpi_catalog" ON kpi_catalog;
DROP POLICY IF EXISTS "anon_delete_kpi_catalog" ON kpi_catalog;
CREATE POLICY "anon_select_kpi_catalog" ON kpi_catalog FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_kpi_catalog" ON kpi_catalog FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_kpi_catalog" ON kpi_catalog FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_kpi_catalog" ON kpi_catalog FOR DELETE TO anon, authenticated USING (true);

-- ─── kpi_months ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_months (
  key        text PRIMARY KEY,
  label      text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE kpi_months ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kpi_months" ON kpi_months;
DROP POLICY IF EXISTS "anon_insert_kpi_months" ON kpi_months;
DROP POLICY IF EXISTS "anon_update_kpi_months" ON kpi_months;
DROP POLICY IF EXISTS "anon_delete_kpi_months" ON kpi_months;
CREATE POLICY "anon_select_kpi_months" ON kpi_months FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_kpi_months" ON kpi_months FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_kpi_months" ON kpi_months FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_kpi_months" ON kpi_months FOR DELETE TO anon, authenticated USING (true);

-- ─── kpi_tasks ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_tasks (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key text NOT NULL REFERENCES kpi_months(key) ON DELETE CASCADE,
  title     text NOT NULL DEFAULT '',
  assignee  text NOT NULL DEFAULT '',
  project   text NOT NULL DEFAULT '',
  package   text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kpi_tasks_month_key ON kpi_tasks(month_key);
CREATE INDEX IF NOT EXISTS idx_kpi_tasks_assignee  ON kpi_tasks(assignee);
ALTER TABLE kpi_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kpi_tasks" ON kpi_tasks;
DROP POLICY IF EXISTS "anon_insert_kpi_tasks" ON kpi_tasks;
DROP POLICY IF EXISTS "anon_update_kpi_tasks" ON kpi_tasks;
DROP POLICY IF EXISTS "anon_delete_kpi_tasks" ON kpi_tasks;
CREATE POLICY "anon_select_kpi_tasks" ON kpi_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_kpi_tasks" ON kpi_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_kpi_tasks" ON kpi_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_kpi_tasks" ON kpi_tasks FOR DELETE TO anon, authenticated USING (true);

-- ─── kpi_manager_inputs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_manager_inputs (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key     text    NOT NULL REFERENCES kpi_months(key) ON DELETE CASCADE,
  designer_name text    NOT NULL,
  quality       numeric,
  late_tasks    integer NOT NULL DEFAULT 0,
  late_days     numeric NOT NULL DEFAULT 0,
  bonus         numeric NOT NULL DEFAULT 0,
  bonus_notes   text    NOT NULL DEFAULT '',
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(month_key, designer_name)
);
CREATE INDEX IF NOT EXISTS idx_kpi_manager_inputs_month ON kpi_manager_inputs(month_key);
ALTER TABLE kpi_manager_inputs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kpi_manager_inputs" ON kpi_manager_inputs;
DROP POLICY IF EXISTS "anon_insert_kpi_manager_inputs" ON kpi_manager_inputs;
DROP POLICY IF EXISTS "anon_update_kpi_manager_inputs" ON kpi_manager_inputs;
DROP POLICY IF EXISTS "anon_delete_kpi_manager_inputs" ON kpi_manager_inputs;
CREATE POLICY "anon_select_kpi_manager_inputs" ON kpi_manager_inputs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_kpi_manager_inputs" ON kpi_manager_inputs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_kpi_manager_inputs" ON kpi_manager_inputs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_kpi_manager_inputs" ON kpi_manager_inputs FOR DELETE TO anon, authenticated USING (true);
