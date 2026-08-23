-- ============================================================
-- SafeTrack Chile — Refresh token de Google para renovar Drive
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
--
-- El access token de Google dura ~1h. Renovarlo exige el client_secret, que
-- jamás puede viajar al navegador. La Edge Function `google-token-refresh` hace
-- ese canje del lado del servidor y necesita leer el refresh_token del usuario.
--
-- SEGURIDAD — por qué las policies son asimétricas:
-- El refresh_token es una credencial de larga duración: con él se obtiene acceso
-- al Drive del usuario indefinidamente. Por eso el navegador puede ESCRIBIR el
-- suyo (al terminar el OAuth) pero NO puede LEERLO de vuelta. No hay policy de
-- SELECT para `authenticated`, así que ni un XSS en la app podría extraerlo.
-- Solo la Edge Function, que usa la service_role key y salta RLS, puede leerlo.
--
-- Es idempotente: se puede correr más de una vez.
-- ============================================================

CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  refresh_token  TEXT NOT NULL,
  -- Diagnóstico: permite ver si la renovación viene fallando sin exponer el token.
  last_refresh_at TIMESTAMPTZ,
  last_error      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Escribir el propio token: sí.
DROP POLICY IF EXISTS "google_tokens_insert_own" ON google_oauth_tokens;
CREATE POLICY "google_tokens_insert_own" ON google_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "google_tokens_update_own" ON google_oauth_tokens;
CREATE POLICY "google_tokens_update_own" ON google_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Borrar el propio token: sí (al cerrar sesión o desconectar Drive).
DROP POLICY IF EXISTS "google_tokens_delete_own" ON google_oauth_tokens;
CREATE POLICY "google_tokens_delete_own" ON google_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Leerlo: NO. Deliberadamente no existe policy de SELECT.

DROP TRIGGER IF EXISTS google_oauth_tokens_updated_at ON google_oauth_tokens;
CREATE TRIGGER google_oauth_tokens_updated_at
  BEFORE UPDATE ON google_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Vista de solo diagnóstico: el usuario puede comprobar si su conexión a Drive
-- está sana sin poder ver el token. security_invoker respeta las policies de
-- quien consulta, y aquí filtramos a la propia fila.
CREATE OR REPLACE VIEW google_oauth_status
WITH (security_invoker = true) AS
SELECT
  user_id,
  (refresh_token IS NOT NULL) AS has_refresh_token,
  last_refresh_at,
  last_error,
  updated_at
FROM google_oauth_tokens
WHERE user_id = auth.uid();

-- La vista necesita su propia policy de lectura sobre la tabla base, acotada a
-- las columnas que expone. Como RLS no distingue columnas, se concede SELECT
-- solo sobre las columnas no sensibles.
REVOKE ALL ON google_oauth_tokens FROM anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON google_oauth_tokens TO authenticated;
GRANT SELECT (user_id, last_refresh_at, last_error, updated_at)
  ON google_oauth_tokens TO authenticated;

DROP POLICY IF EXISTS "google_tokens_select_own_metadata" ON google_oauth_tokens;
CREATE POLICY "google_tokens_select_own_metadata" ON google_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON google_oauth_status TO authenticated;
