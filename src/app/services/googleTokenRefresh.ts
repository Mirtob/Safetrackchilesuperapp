/**
 * Renovación del acceso a Google Drive — SafeTrack Chile
 *
 * El access token de Google caduca a la hora. Renovarlo requiere el
 * client_secret, que no puede estar en el navegador, así que el canje lo hace la
 * Edge Function `google-token-refresh`. Aquí vive el lado cliente: guardar el
 * refresh_token cuando Google lo entrega, y pedir un token nuevo cuando hace
 * falta.
 *
 * Si la función no está desplegada, todo esto degrada a lo anterior: el usuario
 * ve el aviso de "Drive desconectado" y reconecta a mano. Nada se rompe.
 */

import { supabase, isSupabaseConfigured } from '@/app/services/supabase';

export interface RefreshResult {
  accessToken: string;
  /** Segundos de vida que informa Google. */
  expiresIn: number;
}

/** La renovación falló de forma definitiva: hay que rehacer el OAuth. */
export class ReconnectRequiredError extends Error {
  constructor(message = 'Google pide volver a conectar la cuenta.') {
    super(message);
    this.name = 'ReconnectRequiredError';
  }
}

/**
 * Guarda el refresh_token que Supabase entrega al terminar el OAuth.
 *
 * Solo llega una vez, en el evento SIGNED_IN, y únicamente porque el login pide
 * `access_type=offline` con `prompt=consent`. Si se pierde, el usuario tendría
 * que reconectar cada hora.
 *
 * Nunca se lee de vuelta desde el navegador: la tabla no concede SELECT sobre
 * esta columna. Un fallo aquí no interrumpe el login.
 */
export const storeRefreshToken = async (refreshToken: string): Promise<void> => {
  if (!isSupabaseConfigured || !refreshToken) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('google_oauth_tokens')
      .upsert(
        { user_id: user.id, refresh_token: refreshToken, last_error: null },
        { onConflict: 'user_id' }
      );

    if (error) {
      // Lo más probable: la migración 003 todavía no se ejecutó. La app sigue
      // funcionando con reconexión manual.
      console.warn('[Drive] no se pudo guardar el refresh token:', error.message);
    }
  } catch (err) {
    console.warn('[Drive] error guardando el refresh token:', (err as Error).message);
  }
};

/** Olvida el refresh token del usuario (logout o desconexión de Drive). */
export const clearRefreshToken = async (): Promise<void> => {
  if (!isSupabaseConfigured) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('google_oauth_tokens').delete().eq('user_id', user.id);
  } catch {
    // Sin conexión no se puede limpiar; el token del servidor caducará solo.
  }
};

/**
 * Pide un access token nuevo a la Edge Function.
 *
 * Devuelve null cuando la renovación no está disponible (función sin desplegar,
 * sin sesión, error de red): el llamador debe tratarlo como "no se pudo, sigue
 * el camino manual". Lanza ReconnectRequiredError solo cuando Google dice
 * explícitamente que el permiso ya no sirve.
 */
export const refreshDriveAccessToken = async (): Promise<RefreshResult | null> => {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase.functions.invoke('google-token-refresh', {
      method: 'POST',
    });

    if (error) {
      // supabase-js empaqueta el cuerpo del error; un 409 significa que el
      // permiso se revocó y no tiene sentido reintentar.
      const status = (error as { context?: { status?: number } })?.context?.status;
      if (status === 409) throw new ReconnectRequiredError();

      console.warn('[Drive] renovación no disponible:', error.message);
      return null;
    }

    if (data?.reconnect) throw new ReconnectRequiredError();
    if (!data?.access_token) return null;

    return { accessToken: data.access_token, expiresIn: Number(data.expires_in) || 3600 };
  } catch (err) {
    if (err instanceof ReconnectRequiredError) throw err;
    console.warn('[Drive] fallo al renovar:', (err as Error).message);
    return null;
  }
};
