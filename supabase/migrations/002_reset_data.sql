-- ============================================================
-- SafeTrack Chile — Limpieza total de datos operacionales
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
--
-- ⚠️  DESTRUCTIVO E IRREVERSIBLE.
--
-- Deja la app vacía para que el usuario cargue sus empresas reales. Borra
-- empresas, sucursales, trabajadores, activos, inspecciones, incidentes,
-- charlas, firmas, boletas, horas y gastos.
--
-- LO QUE **NO** SE BORRA:
--   · auth.users        → tu cuenta de acceso sigue existiendo
--   · profiles          → tu perfil (nombre, avatar)
--   · subscriptions     → tu plan contratado
--   · finance_settings  → tu configuración de finanzas
--
-- CÓMO USARLO: corre el PASO 1 solo, revisa los números, y si estás de acuerdo
-- corre el PASO 2. El PASO 3 confirma que quedó todo en cero.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PASO 1 — INVENTARIO: qué se va a borrar (no borra nada)
-- ════════════════════════════════════════════════════════════

SELECT 'companies'                  AS tabla, COUNT(*) AS registros FROM companies
UNION ALL SELECT 'branches',                  COUNT(*) FROM branches
UNION ALL SELECT 'user_company_roles',        COUNT(*) FROM user_company_roles
UNION ALL SELECT 'workers',                   COUNT(*) FROM workers
UNION ALL SELECT 'assets',                    COUNT(*) FROM assets
UNION ALL SELECT 'inspections',               COUNT(*) FROM inspections
UNION ALL SELECT 'incidents',                 COUNT(*) FROM incidents
UNION ALL SELECT 'incident_actions',          COUNT(*) FROM incident_actions
UNION ALL SELECT 'incident_medical_records',  COUNT(*) FROM incident_medical_records
UNION ALL SELECT 'safety_kits',               COUNT(*) FROM safety_kits
UNION ALL SELECT 'inspection_config_elements',COUNT(*) FROM inspection_config_elements
UNION ALL SELECT 'client_billing_profiles',   COUNT(*) FROM client_billing_profiles
UNION ALL SELECT 'invoices',                  COUNT(*) FROM invoices
UNION ALL SELECT 'professional_time_entries', COUNT(*) FROM professional_time_entries
UNION ALL SELECT 'professional_expenses',     COUNT(*) FROM professional_expenses
UNION ALL SELECT 'scheduled_events',          COUNT(*) FROM scheduled_events
UNION ALL SELECT 'inspector_access_links',    COUNT(*) FROM inspector_access_links
UNION ALL SELECT 'emergency_qr_codes',        COUNT(*) FROM emergency_qr_codes
UNION ALL SELECT 'safety_talks',              COUNT(*) FROM safety_talks
UNION ALL SELECT 'signatures',                COUNT(*) FROM signatures
ORDER BY registros DESC, tabla;

-- Comprobación de seguridad: esto NO debe quedar en cero después del borrado.
SELECT COUNT(*) AS cuentas_de_usuario_que_se_conservan FROM auth.users;

-- Y por si el proyecto tiene tablas que este script no contempla:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- ════════════════════════════════════════════════════════════
-- PASO 2 — BORRADO  (descomenta el bloque completo para ejecutar)
-- ════════════════════════════════════════════════════════════
--
-- Va dentro de una transacción: si algo falla, no se borra nada a medias.
-- TRUNCATE ... CASCADE arrastra las tablas dependientes, y RESTART IDENTITY
-- reinicia los contadores para que la numeración parta limpia.

/*
BEGIN;

TRUNCATE TABLE
  signatures,
  safety_talks,
  emergency_qr_codes,
  inspector_access_links,
  scheduled_events,
  professional_expenses,
  professional_time_entries,
  invoices,
  client_billing_profiles,
  inspection_config_elements,
  safety_kits,
  incident_medical_records,
  incident_actions,
  incidents,
  inspections,
  assets,
  workers,
  user_company_roles,
  branches,
  companies
RESTART IDENTITY CASCADE;

COMMIT;
*/


-- ════════════════════════════════════════════════════════════
-- PASO 3 — VERIFICACIÓN: todo en cero, cuenta intacta
-- ════════════════════════════════════════════════════════════

/*
SELECT 'companies' AS tabla, COUNT(*) AS quedan FROM companies
UNION ALL SELECT 'workers',      COUNT(*) FROM workers
UNION ALL SELECT 'assets',       COUNT(*) FROM assets
UNION ALL SELECT 'inspections',  COUNT(*) FROM inspections
UNION ALL SELECT 'incidents',    COUNT(*) FROM incidents
UNION ALL SELECT 'invoices',     COUNT(*) FROM invoices
UNION ALL SELECT 'safety_talks', COUNT(*) FROM safety_talks;

-- Estas dos deben seguir teniendo tus datos:
SELECT COUNT(*) AS usuarios_intactos FROM auth.users;
SELECT COUNT(*) AS perfiles_intactos FROM profiles;
*/
