-- KPI Config (single row, key = "main", value = JSONB)
CREATE TABLE IF NOT EXISTS kpi_config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Task catalog
CREATE TABLE IF NOT EXISTS kpi_catalog (
  id     BIGSERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  type   TEXT,
  points NUMERIC(6,2) DEFAULT 2.0,
  base   TEXT
);

-- Month index
CREATE TABLE IF NOT EXISTS kpi_months (
  key   TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

-- Tasks per month
CREATE TABLE IF NOT EXISTS kpi_tasks (
  id        BIGSERIAL PRIMARY KEY,
  month_key TEXT NOT NULL REFERENCES kpi_months(key) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  assignee  TEXT NOT NULL,
  project   TEXT,
  package   TEXT
);

CREATE INDEX IF NOT EXISTS kpi_tasks_month_key_idx ON kpi_tasks(month_key);

-- Manager inputs per designer per month
CREATE TABLE IF NOT EXISTS kpi_manager_inputs (
  month_key TEXT NOT NULL REFERENCES kpi_months(key) ON DELETE CASCADE,
  assignee  TEXT NOT NULL,
  inputs    JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (month_key, assignee)
);

-- RLS
ALTER TABLE kpi_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_catalog        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_months         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_manager_inputs ENABLE ROW LEVEL SECURITY;

-- Policies (anon + authenticated — no user auth in this app)
CREATE POLICY "anon_select_config" ON kpi_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_config" ON kpi_config FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_config" ON kpi_config FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_config" ON kpi_config FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "anon_select_catalog" ON kpi_catalog FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_catalog" ON kpi_catalog FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_catalog" ON kpi_catalog FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_catalog" ON kpi_catalog FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "anon_select_months" ON kpi_months FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_months" ON kpi_months FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_months" ON kpi_months FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_months" ON kpi_months FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "anon_select_tasks" ON kpi_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_tasks" ON kpi_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_tasks" ON kpi_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_tasks" ON kpi_tasks FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "anon_select_manager_inputs" ON kpi_manager_inputs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_manager_inputs" ON kpi_manager_inputs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_manager_inputs" ON kpi_manager_inputs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_manager_inputs" ON kpi_manager_inputs FOR DELETE TO anon, authenticated USING (true);
