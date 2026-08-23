-- ============================================================
-- SafeTrack Chile — Contactos de envío, valor HH y faenas por GPS
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
--
-- Tres cosas que hoy no tenían dónde guardarse:
--
-- 1. CONTACTOS DE ENVÍO. La pantalla de Envío de Documentos usaba destinatarios
--    de ejemplo escritos en el código. Ahora cada empresa guarda su WhatsApp y
--    sus correos de RRHH, y se piden al crearla.
--
-- 2. VALOR HH POR EMPRESA. Ya existía `client_billing_profiles.hourly_rate`,
--    pero faltaba la política de pago (diaria, semanal, quincenal o mensual)
--    para saber cada cuánto cerrar el resumen que va a la boleta.
--
-- 3. FAENAS AUTOMÁTICAS. `professional_time_entries` se llenaba a mano. Estas
--    columnas registran si la faena la abrió y cerró el GPS, cuándo se avisó a
--    cada parte, y en qué sucursal ocurrió.
--
-- Es idempotente: se puede correr más de una vez.
-- ============================================================


-- ── 1. Contactos de envío y geocerca por empresa ─────────────────────────────

ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Varios correos: RRHH, prevención, gerencia. Un solo campo no alcanzaba.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_emails TEXT[] DEFAULT '{}';

-- Radio en metros para dar por iniciada la faena al llegar. 150 m cubre el
-- error típico del GPS en un recinto industrial sin disparar falsos positivos
-- desde la calle.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS geofence_radius_m INTEGER DEFAULT 150
  CHECK (geofence_radius_m BETWEEN 30 AND 2000);

-- A quién avisar cuando el prevencionista entra o sale de faena.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notify_on_arrival BOOLEAN DEFAULT TRUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notify_on_departure BOOLEAN DEFAULT TRUE;


-- ── 2. Política de pago y valor HH ───────────────────────────────────────────

ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

ALTER TABLE client_billing_profiles
  DROP CONSTRAINT IF EXISTS client_billing_profiles_billing_cycle_check;

ALTER TABLE client_billing_profiles
  ADD CONSTRAINT client_billing_profiles_billing_cycle_check
  CHECK (billing_cycle IN ('daily', 'weekly', 'biweekly', 'monthly'));

-- Minutos mínimos para que una visita se considere facturable. Evita que un
-- paso frente a la planta genere un cobro de dos minutos.
ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS min_billable_minutes INTEGER DEFAULT 15
  CHECK (min_billable_minutes BETWEEN 0 AND 480);


-- ── 3. Faenas abiertas y cerradas por GPS ────────────────────────────────────

ALTER TABLE professional_time_entries
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Distingue la faena que abrió el GPS de la que el usuario cargó a mano.
ALTER TABLE professional_time_entries
  ADD COLUMN IF NOT EXISTS auto_started BOOLEAN DEFAULT FALSE;

ALTER TABLE professional_time_entries
  ADD COLUMN IF NOT EXISTS auto_ended BOOLEAN DEFAULT FALSE;

-- Coordenadas de entrada y salida: respaldo de que la faena ocurrió en terreno.
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS start_lat DECIMAL(9,6);
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS start_lng DECIMAL(9,6);
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS end_lat DECIMAL(9,6);
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS end_lng DECIMAL(9,6);

-- Marca temporal del aviso a cada parte, para no notificar dos veces la misma
-- llegada si la app se recarga.
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS arrival_notified_at TIMESTAMPTZ;
ALTER TABLE professional_time_entries ADD COLUMN IF NOT EXISTS departure_notified_at TIMESTAMPTZ;

-- Marca la faena ya incluida en una boleta, para no cobrarla de nuevo.
ALTER TABLE professional_time_entries
  ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ;

ALTER TABLE professional_time_entries
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Buscar la faena abierta de una empresa es la consulta más frecuente del
-- seguimiento por GPS: ocurre en cada lectura de posición.
CREATE INDEX IF NOT EXISTS idx_time_entries_open
  ON professional_time_entries (created_by, company_id)
  WHERE status = 'in-progress';

-- Los resúmenes por período recorren las faenas cerradas y sin facturar.
CREATE INDEX IF NOT EXISTS idx_time_entries_uninvoiced
  ON professional_time_entries (company_id, entry_date)
  WHERE invoiced_at IS NULL;
