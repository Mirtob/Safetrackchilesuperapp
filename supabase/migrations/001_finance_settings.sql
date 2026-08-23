-- ============================================================
-- SafeTrack Chile — Configuración financiera del profesional
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
--
-- 1. Crea `finance_settings`: los parámetros del módulo de finanzas que antes
--    estaban hardcodeados (tasa de retención, moneda, categorías de gasto,
--    tarifas por defecto, datos del emisor).
--
--    Se guarda como JSONB a propósito: agregar un parámetro nuevo no requiere
--    otra migración ni un redespliegue.
--
-- 2. Libera el CHECK de `professional_expenses.category`, que limitaba los
--    gastos a seis categorías fijas e impedía que el usuario creara las suyas.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

-- ── 1. Tabla de configuración ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_settings (
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  settings    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve y edita solo su propia configuración.
DROP POLICY IF EXISTS "finance_settings_select_own" ON finance_settings;
CREATE POLICY "finance_settings_select_own" ON finance_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_settings_insert_own" ON finance_settings;
CREATE POLICY "finance_settings_insert_own" ON finance_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_settings_update_own" ON finance_settings;
CREATE POLICY "finance_settings_update_own" ON finance_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_settings_delete_own" ON finance_settings;
CREATE POLICY "finance_settings_delete_own" ON finance_settings
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS finance_settings_updated_at ON finance_settings;
CREATE TRIGGER finance_settings_updated_at
  BEFORE UPDATE ON finance_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Categorías de gasto libres ────────────────────────────────────────────
-- El CHECK original solo aceptaba transport/fuel/food/accommodation/materials/
-- other, así que cualquier categoría creada por el usuario era rechazada por la
-- base. Se reemplaza por una validación mínima: no vacía.

ALTER TABLE professional_expenses
  DROP CONSTRAINT IF EXISTS professional_expenses_category_check;

ALTER TABLE professional_expenses
  ALTER COLUMN category SET DEFAULT 'other';

ALTER TABLE professional_expenses
  DROP CONSTRAINT IF EXISTS professional_expenses_category_not_blank;

ALTER TABLE professional_expenses
  ADD CONSTRAINT professional_expenses_category_not_blank
  CHECK (category IS NOT NULL AND length(trim(category)) > 0);
