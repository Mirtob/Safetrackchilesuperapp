/**
 * Google OAuth vía Supabase — SafeTrack Chile
 *
 * Centraliza los scopes y el arranque del flujo OAuth para que el login inicial
 * y la reconexión de Drive pidan exactamente los mismos permisos. Si divergen,
 * el usuario reconecta y Drive sigue sin funcionar.
 */

import { supabase } from '@/app/services/supabase';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

export const isGoogleConfigured = Boolean(
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  !import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith('REEMPLAZA')
);

/**
 * Inicia el flujo OAuth con Google. La página se redirige a Google, así que
 * esta promesa solo resuelve cuando algo falla antes del redirect.
 */
export const signInWithGoogle = async (): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: GOOGLE_SCOPES,
      redirectTo: window.location.origin,
      // access_type=offline + prompt=consent hacen que Google devuelva el
      // consentimiento completo en cada reconexión, en vez de un token mudo.
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });

  return { error: error ? 'Error al conectar con Google. Verifica la configuración.' : null };
};
