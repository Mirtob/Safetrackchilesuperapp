-- ============================================================
-- SafeTrack Chile — Schema Supabase (PostgreSQL)
-- Pega este script en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── TABLAS ────────────────────────────────────────────────────────────────────

-- Perfil extendido del usuario (se crea automáticamente al registrarse)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Empresas cliente del prevencionista
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  rut             TEXT,
  address         TEXT,
  city            TEXT,
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  industry        TEXT DEFAULT 'General',
  risk_level      TEXT DEFAULT 'Medio' CHECK (risk_level IN ('Bajo', 'Medio', 'Alto')),
  worker_count    INTEGER DEFAULT 0,
  contract_start  DATE,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Sucursales de cada empresa
CREATE TABLE IF NOT EXISTS branches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  contact_person  TEXT,
  phone           TEXT,
  worker_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Relación usuario ↔ empresa (muchos a muchos)
CREATE TABLE IF NOT EXISTS user_company_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role          TEXT DEFAULT 'prevencionista',
  billable_rate DECIMAL(10,2),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Trabajadores de cada empresa
CREATE TABLE IF NOT EXISTS workers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  rut         TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  job_title   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, rut)
);

-- Charlas de seguridad
CREATE TABLE IF NOT EXISTS safety_talks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id        UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_by       UUID REFERENCES auth.users(id) NOT NULL,
  title            TEXT NOT NULL,
  topic            TEXT,
  talk_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  location         TEXT,
  lat              DECIMAL(9,6),
  lng              DECIMAL(9,6),
  pdf_url          TEXT,
  drive_file_id    TEXT,
  status           TEXT DEFAULT 'completed',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Firmas digitales (una por trabajador por charla)
CREATE TABLE IF NOT EXISTS signatures (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talk_id        UUID REFERENCES safety_talks(id) ON DELETE CASCADE NOT NULL,
  worker_id      UUID REFERENCES workers(id) ON DELETE SET NULL,
  worker_name    TEXT NOT NULL,
  worker_rut     TEXT,
  signature_data TEXT NOT NULL,  -- canvas en base64
  signed_at      TIMESTAMPTZ DEFAULT NOW(),
  ip_address     TEXT,
  lat            DECIMAL(9,6),
  lng            DECIMAL(9,6),
  legal_hash     TEXT           -- SHA-256 para validez legal (Ley 19.799)
);

-- Suscripciones SaaS (modelo de cobro al prevencionista)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan                        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
  status                      TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_end          TIMESTAMPTZ,
  mercadopago_subscription_id TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRIGGERS updated_at ───────────────────────────────────────────────────────

CREATE TRIGGER trg_profiles_updated_at       BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at      BEFORE UPDATE ON companies      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_branches_updated_at       BEFORE UPDATE ON branches       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_workers_updated_at        BEFORE UPDATE ON workers        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_safety_talks_updated_at   BEFORE UPDATE ON safety_talks   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at  BEFORE UPDATE ON subscriptions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ÍNDICES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_branches_company         ON branches(company_id);
CREATE INDEX IF NOT EXISTS idx_ucr_user                 ON user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_ucr_company              ON user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_company          ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_branch           ON workers(branch_id);
CREATE INDEX IF NOT EXISTS idx_safety_talks_company     ON safety_talks(company_id);
CREATE INDEX IF NOT EXISTS idx_safety_talks_created_by  ON safety_talks(created_by);
CREATE INDEX IF NOT EXISTS idx_signatures_talk          ON signatures(talk_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_talks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve y edita solo el suyo
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Companies: solo las que el usuario administra
CREATE POLICY "companies_select" ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));
CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "companies_update" ON companies FOR UPDATE
  USING (id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));
CREATE POLICY "companies_delete" ON companies FOR DELETE
  USING (id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Branches: accesibles si tienes rol en la empresa
CREATE POLICY "branches_by_company" ON branches FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Roles: ves solo los tuyos
CREATE POLICY "roles_own" ON user_company_roles FOR ALL USING (user_id = auth.uid());

-- Workers: accesibles si tienes rol en la empresa
CREATE POLICY "workers_by_company" ON workers FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Safety talks: las de tus empresas
CREATE POLICY "talks_by_company" ON safety_talks FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Signatures: a través de las charlas de tus empresas
CREATE POLICY "signatures_by_talk" ON signatures FOR ALL
  USING (talk_id IN (
    SELECT st.id FROM safety_talks st
    JOIN user_company_roles ucr ON ucr.company_id = st.company_id
    WHERE ucr.user_id = auth.uid() AND ucr.is_active = TRUE
  ));

-- Subscriptions: cada usuario ve y edita solo la suya
CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (user_id = auth.uid());

-- ── TRIGGER: setup automático al registrarse ──────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Crear suscripción free
  INSERT INTO subscriptions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── DATOS DE PRUEBA (opcional, eliminar en producción) ────────────────────────
-- Puedes insertar una empresa de prueba desde el dashboard o via la app.
