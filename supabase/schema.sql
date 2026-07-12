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
  mutual          TEXT,
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
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id         UUID REFERENCES branches(id) ON DELETE SET NULL,
  rut               TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  job_title         TEXT,
  department        TEXT,
  sector            TEXT,
  address           TEXT,
  emergency_contact TEXT,
  emergency_phone   TEXT,
  contract_type     TEXT DEFAULT 'indefinido' CHECK (contract_type IN ('indefinido', 'plazo-fijo', 'honorarios')),
  start_date        DATE DEFAULT CURRENT_DATE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, rut)
);

-- Activos/equipos de cada empresa (maquinaria, herramientas, vehículos, instalaciones)
CREATE TABLE IF NOT EXISTS assets (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id             UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  code                   TEXT NOT NULL,
  name                   TEXT NOT NULL,
  asset_type             TEXT,
  category               TEXT DEFAULT 'equipo' CHECK (category IN ('maquinaria', 'herramienta', 'equipo', 'vehiculo', 'instalacion')),
  brand                  TEXT,
  model                  TEXT,
  serial_number          TEXT,
  sector                 TEXT,
  location               TEXT,
  acquisition_date       DATE,
  acquisition_cost       DECIMAL(12,2),
  status                 TEXT DEFAULT 'operativo' CHECK (status IN ('operativo', 'mantenimiento', 'fuera-servicio', 'baja')),
  condition              TEXT DEFAULT 'bueno' CHECK (condition IN ('excelente', 'bueno', 'regular', 'malo')),
  responsible            TEXT,
  next_inspection_date   DATE,
  last_inspection_date   DATE,
  inspection_frequency   TEXT DEFAULT 'mensual' CHECK (inspection_frequency IN ('semanal', 'quincenal', 'mensual', 'trimestral', 'semestral', 'anual')),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- Charlas de seguridad (también respalda charlas EPP e inducciones, y sirve de "documento" para la bóveda)
-- Kits de EPP predefinidos por empresa (agiliza la entrega de EPP)
-- Inspecciones puntuales (sector/activo, descripción, fotos, firma)
CREATE TABLE IF NOT EXISTS inspections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
  asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES auth.users(id) NOT NULL,
  sector          TEXT,
  asset_name      TEXT,
  description     TEXT,
  location        TEXT,
  photos          TEXT[] DEFAULT '{}',
  signature_data  TEXT,
  checklist_items JSONB,
  status          TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'fault-reported')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Accidentes/incidentes laborales
CREATE TABLE IF NOT EXISTS incidents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id          UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_by         UUID REFERENCES auth.users(id) NOT NULL,
  code               TEXT UNIQUE NOT NULL DEFAULT ('INC-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  incident_type      TEXT NOT NULL, -- accident, near-miss, unsafe-condition, unsafe-act, equipment-failure, spill, fire, environmental, other
  severity           TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title              TEXT NOT NULL,
  description        TEXT,
  sector             TEXT,
  location           TEXT,
  affected_workers   JSONB DEFAULT '[]', -- [{id, name, rut, position, department}]
  immediate_actions  TEXT,
  photos             TEXT[] DEFAULT '{}',
  signature_data     TEXT,
  status             TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'corrective-actions', 'monitoring', 'closed')),
  medical_attention  BOOLEAN DEFAULT FALSE,
  leave_days         INTEGER DEFAULT 0,
  estimated_cost     DECIMAL(12,2) DEFAULT 0,
  closed_at          TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Acciones correctivas/preventivas de seguimiento de un incidente
CREATE TABLE IF NOT EXISTS incident_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id   UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  action_type   TEXT DEFAULT 'other' CHECK (action_type IN ('medical', 'investigation', 'corrective', 'preventive', 'training', 'infrastructure', 'communication', 'other')),
  title         TEXT NOT NULL,
  description   TEXT,
  responsible   TEXT,
  deadline      TIMESTAMPTZ,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  completed_at  TIMESTAMPTZ,
  evidence      TEXT[] DEFAULT '{}',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Registros médicos asociados a un incidente
CREATE TABLE IF NOT EXISTS incident_medical_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id         UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  worker_id           UUID REFERENCES workers(id) ON DELETE SET NULL,
  worker_name         TEXT NOT NULL,
  injury_type         TEXT,
  injury_severity     TEXT DEFAULT 'leve' CHECK (injury_severity IN ('leve', 'moderada', 'grave', 'fatal')),
  medical_attention   TEXT DEFAULT 'primeros-auxilios' CHECK (medical_attention IN ('primeros-auxilios', 'centro-medico', 'hospital', 'mutualidad', 'no-requerida')),
  diagnosis           TEXT,
  treatment           TEXT,
  medical_leave       BOOLEAN DEFAULT FALSE,
  leave_days          INTEGER,
  leave_start_date    DATE,
  leave_end_date      DATE,
  work_restrictions   TEXT,
  follow_up_required  BOOLEAN DEFAULT FALSE,
  next_checkup        DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_kits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  kit_name    TEXT NOT NULL,
  description TEXT,
  epp_items   TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Elementos configurables de inspección: sectores, activos y puntos de control (árbol autorreferenciado)
CREATE TABLE IF NOT EXISTS inspection_config_elements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL CHECK (element_type IN ('sector', 'activo', 'checkpoint')),
  name        TEXT NOT NULL,
  description TEXT,
  parent_id   UUID REFERENCES inspection_config_elements(id) ON DELETE CASCADE,
  risk_level  TEXT DEFAULT 'medio' CHECK (risk_level IN ('bajo', 'medio', 'alto', 'critico')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Códigos QR de acceso de emergencia (botón de pánico) por empresa
-- Enlaces de acceso temporal para paquetes de documentación (Modo Fiscalización)
-- Eventos del calendario/itinerario (vencimientos legales, rutinas, inspecciones recurrentes, capacitaciones)
CREATE TABLE IF NOT EXISTS scheduled_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_by            UUID REFERENCES auth.users(id) NOT NULL,
  title                 TEXT NOT NULL,
  event_type            TEXT DEFAULT 'routine' CHECK (event_type IN ('legal', 'routine', 'inspection', 'training')),
  event_date            DATE NOT NULL,
  event_time            TEXT,
  location              TEXT,
  priority              TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  deadline_note         TEXT,
  status                TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'completed')),
  is_recurring          BOOLEAN DEFAULT FALSE,
  recurrence_frequency  TEXT CHECK (recurrence_frequency IN ('mensual', 'trimestral', 'semestral', 'anual')),
  last_completed_date   DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspector_access_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_by   UUID REFERENCES auth.users(id) NOT NULL,
  token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  period_label TEXT,
  document_count INTEGER DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_qr_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  is_active    BOOLEAN DEFAULT TRUE,
  usage_count  INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_talks (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  branch_id               UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_by              UUID REFERENCES auth.users(id) NOT NULL,
  title                   TEXT NOT NULL,
  topic                   TEXT,
  talk_type               TEXT DEFAULT 'talk' CHECK (talk_type IN ('talk', 'epp', 'induction')),
  talk_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes        INTEGER,
  location                TEXT,
  lat                     DECIMAL(9,6),
  lng                     DECIMAL(9,6),
  pdf_url                 TEXT,
  drive_file_id           TEXT,
  status                  TEXT DEFAULT 'completed',
  epp_items               JSONB,
  -- Firma/aprobación gerencial (ManagerSignaturePortal)
  manager_approval_status TEXT DEFAULT 'pending' CHECK (manager_approval_status IN ('pending', 'approved', 'rejected')),
  manager_approved_by     TEXT,
  manager_approved_at     TIMESTAMPTZ,
  manager_reject_reason   TEXT,
  integrity_hash          TEXT,
  approval_lat            DECIMAL(9,6),
  approval_lng            DECIMAL(9,6),
  -- Envío para firma remota (RemoteSignature)
  sent_via                TEXT CHECK (sent_via IN ('whatsapp', 'email')),
  sent_to                 TEXT,
  sent_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
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
CREATE TRIGGER trg_assets_updated_at         BEFORE UPDATE ON assets         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inspections_updated_at    BEFORE UPDATE ON inspections    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_incidents_updated_at      BEFORE UPDATE ON incidents      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_incident_actions_updated_at BEFORE UPDATE ON incident_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_safety_kits_updated_at    BEFORE UPDATE ON safety_kits    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scheduled_events_updated_at BEFORE UPDATE ON scheduled_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inspection_elements_updated_at BEFORE UPDATE ON inspection_config_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_qr_codes_updated_at       BEFORE UPDATE ON emergency_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_safety_talks_updated_at   BEFORE UPDATE ON safety_talks   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at  BEFORE UPDATE ON subscriptions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ÍNDICES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_branches_company         ON branches(company_id);
CREATE INDEX IF NOT EXISTS idx_ucr_user                 ON user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_ucr_company              ON user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_company          ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_branch           ON workers(branch_id);
CREATE INDEX IF NOT EXISTS idx_assets_company           ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_inspections_company       ON inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_incidents_company         ON incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_incident_actions_incident ON incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_medical_incident ON incident_medical_records(incident_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_company  ON scheduled_events(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_date      ON scheduled_events(event_date);
CREATE INDEX IF NOT EXISTS idx_safety_kits_company       ON safety_kits(company_id);
CREATE INDEX IF NOT EXISTS idx_inspection_elements_company ON inspection_config_elements(company_id);
CREATE INDEX IF NOT EXISTS idx_inspection_elements_parent  ON inspection_config_elements(parent_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_company          ON emergency_qr_codes(company_id);
CREATE INDEX IF NOT EXISTS idx_inspector_links_company   ON inspector_access_links(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token            ON emergency_qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_safety_talks_company     ON safety_talks(company_id);
CREATE INDEX IF NOT EXISTS idx_safety_talks_created_by  ON safety_talks(created_by);
CREATE INDEX IF NOT EXISTS idx_signatures_talk          ON signatures(talk_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_kits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_config_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_access_links ENABLE ROW LEVEL SECURITY;
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

-- Assets: accesibles si tienes rol en la empresa
CREATE POLICY "assets_by_company" ON assets FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Inspecciones: accesibles si tienes rol en la empresa
CREATE POLICY "inspections_by_company" ON inspections FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Incidentes: accesibles si tienes rol en la empresa
CREATE POLICY "incidents_by_company" ON incidents FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Acciones de incidente: a través del incidente de tus empresas
CREATE POLICY "incident_actions_by_incident" ON incident_actions FOR ALL
  USING (incident_id IN (
    SELECT i.id FROM incidents i
    JOIN user_company_roles ucr ON ucr.company_id = i.company_id
    WHERE ucr.user_id = auth.uid() AND ucr.is_active = TRUE
  ));

-- Registros médicos: a través del incidente de tus empresas
CREATE POLICY "incident_medical_by_incident" ON incident_medical_records FOR ALL
  USING (incident_id IN (
    SELECT i.id FROM incidents i
    JOIN user_company_roles ucr ON ucr.company_id = i.company_id
    WHERE ucr.user_id = auth.uid() AND ucr.is_active = TRUE
  ));

-- Eventos de calendario: accesibles si tienes rol en la empresa
CREATE POLICY "scheduled_events_by_company" ON scheduled_events FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Safety kits: accesibles si tienes rol en la empresa
CREATE POLICY "safety_kits_by_company" ON safety_kits FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Elementos de inspección: accesibles si tienes rol en la empresa
CREATE POLICY "inspection_elements_by_company" ON inspection_config_elements FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Códigos QR de emergencia: accesibles si tienes rol en la empresa
CREATE POLICY "qr_codes_by_company" ON emergency_qr_codes FOR ALL
  USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = TRUE));

-- Enlaces de fiscalización: accesibles si tienes rol en la empresa
CREATE POLICY "inspector_links_by_company" ON inspector_access_links FOR ALL
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
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Crear suscripción free
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── DATOS DE PRUEBA (opcional, eliminar en producción) ────────────────────────
-- Puedes insertar una empresa de prueba desde el dashboard o via la app.
