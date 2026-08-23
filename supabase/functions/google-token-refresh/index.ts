/**
 * Edge Function: google-token-refresh
 *
 * Renueva el access token de Google Drive sin que el usuario tenga que volver a
 * iniciar sesión cada hora.
 *
 * Por qué existe: los access token de Google caducan a los ~60 minutos y
 * renovarlos exige el client_secret de la aplicación. Ese secreto no puede vivir
 * en el navegador — quedaría expuesto a cualquiera que abra las herramientas de
 * desarrollo. Esta función hace el canje del lado del servidor: recibe la sesión
 * del usuario, busca su refresh_token con la service_role key (que salta RLS,
 * porque el navegador no tiene permiso de leer esa columna) y le pide a Google
 * un access token nuevo.
 *
 * Contrato:
 *   POST  ·  Authorization: Bearer <access token de Supabase>
 *   200   →  { access_token, expires_in }
 *   401   →  sesión de Supabase inválida
 *   409   →  no hay refresh_token, o Google lo revocó: hay que reconectar
 *   502   →  Google respondió mal; reintentar más tarde
 *
 * Secretos necesarios (Supabase → Edge Functions → Secrets):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta la plataforma.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// El navegador llama desde el dominio de la app; se permite el preflight.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
    console.error('Faltan secretos: revisa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET');
    return json({ error: 'server_misconfigured' }, 500);
  }

  // ── 1. Identificar al usuario a partir de su sesión de Supabase ───────────
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'missing_authorization' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData?.user) return json({ error: 'invalid_session' }, 401);

  const userId = userData.user.id;

  // ── 2. Recuperar el refresh_token (solo la service_role puede leerlo) ─────
  const { data: row, error: readError } = await admin
    .from('google_oauth_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) {
    console.error('Error leyendo google_oauth_tokens:', readError.message);
    return json({ error: 'storage_error' }, 500);
  }

  if (!row?.refresh_token) {
    // Nunca se guardó, o se borró tras una revocación. El usuario debe
    // reconectar para que Google emita un refresh_token nuevo.
    return json({ error: 'no_refresh_token', reconnect: true }, 409);
  }

  // ── 3. Canjear el refresh_token por un access token nuevo ─────────────────
  let googleRes: Response;
  try {
    googleRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: row.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
  } catch (err) {
    console.error('No se pudo contactar a Google:', (err as Error).message);
    return json({ error: 'google_unreachable' }, 502);
  }

  const payload = await googleRes.json().catch(() => ({}));

  if (!googleRes.ok) {
    const reason = String(payload?.error || 'unknown');

    // invalid_grant = el usuario revocó el acceso o cambió su contraseña.
    // El refresh_token ya no sirve nunca más: se descarta para no reintentar
    // en bucle y se pide reconectar.
    if (reason === 'invalid_grant') {
      await admin.from('google_oauth_tokens').delete().eq('user_id', userId);
      return json({ error: 'refresh_token_revoked', reconnect: true }, 409);
    }

    await admin
      .from('google_oauth_tokens')
      .update({ last_error: reason.slice(0, 200) })
      .eq('user_id', userId);

    console.error('Google rechazó la renovación:', reason);
    return json({ error: 'google_error', detail: reason }, 502);
  }

  const accessToken = payload?.access_token;
  if (!accessToken) return json({ error: 'google_no_token' }, 502);

  // Google puede rotar el refresh_token; si manda uno nuevo, se guarda.
  const rotated = payload?.refresh_token;
  await admin
    .from('google_oauth_tokens')
    .update({
      ...(rotated ? { refresh_token: rotated } : {}),
      last_refresh_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('user_id', userId);

  return json(
    {
      access_token: accessToken,
      // Google suele devolver 3599; se usa 3600 como respaldo razonable.
      expires_in: Number(payload?.expires_in) || 3600,
    },
    200
  );
});
