import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Logo } from '@/app/components/Logo';
import { supabase, isSupabaseConfigured } from '@/app/services/supabase';

// Mantenemos GoogleUserData para compatibilidad con otros componentes que lo importen
export interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

const isGoogleConfigured = Boolean(
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  !import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith('REEMPLAZA')
);

export function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Detecta errores que Supabase devuelve en la URL tras el redirect de Google
  // (ej: provider mal configurado, redirect URL no autorizada, código expirado).
  // Sin esto, un fallo en el callback OAuth solo se veía como "vuelve al login" sin explicación.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const description =
      query.get('error_description') || hash.get('error_description') ||
      query.get('error') || hash.get('error');

    if (description) {
      setError(decodeURIComponent(description.replace(/\+/g, ' ')));
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // ── Login real con Supabase + Google OAuth ────────────────────────────────
  const handleSupabaseLogin = async () => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: DRIVE_SCOPES,
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (authError) {
      setError('Error al conectar con Google. Verifica la configuración.');
      setIsLoading(false);
    }
    // Si no hay error, la página se redirige automáticamente a Google
  };

  // ── Modo demo: login sin credenciales reales ──────────────────────────────
  const handleDemoLogin = () => {
    const demo: GoogleUserData = {
      email: 'demo@safetrack.cl',
      name: 'Usuario Demo',
      picture: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=0055A4&color=fff',
      accessToken: 'demo_token_' + Date.now(),
    };
    localStorage.setItem('google_access_token', demo.accessToken);
    localStorage.setItem('user_data', JSON.stringify(demo));
    // App.tsx detecta el localStorage y activa la sesión
    window.location.reload();
  };

  const showRealButton = isSupabaseConfigured && isGoogleConfigured;
  const showSetupWarning = !isSupabaseConfigured || !isGoogleConfigured;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Logo className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            SafeTrack Chile
          </h1>
          <p className="text-slate-600 dark:text-zinc-400">
            Sistema de Gestión de Prevención de Riesgos
          </p>
        </div>

        {/* Alerta de configuración incompleta */}
        {showSetupWarning && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                <p className="font-semibold mb-1">Modo Demostración</p>
                <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                  {!isSupabaseConfigured && 'Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. '}
                  {!isGoogleConfigured && 'Falta configurar VITE_GOOGLE_CLIENT_ID.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Descripción */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Inicia sesión con tu cuenta Google para acceder a Maps, Calendar y Drive.
            </p>
          </div>
        </div>

        {/* Botón principal */}
        {showRealButton && (
          <Button
            onClick={handleSupabaseLogin}
            disabled={isLoading}
            className="w-full mb-3 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isLoading ? 'Redirigiendo a Google...' : 'Continuar con Google'}
          </Button>
        )}

        {/* Modo demo: solo disponible si Google/Supabase no están configurados.
            En producción, con credenciales reales, este botón no debe existir
            para evitar que cualquiera acceda al dashboard sin autenticarse. */}
        {!showRealButton && (
          <Button
            onClick={handleDemoLogin}
            variant="default"
            className="w-full mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            Continuar en Modo Demostración
          </Button>
        )}

        {/* Permisos */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
            Permisos solicitados
          </p>
          {[
            'Nombre, email y foto de perfil',
            'Google Drive: guardar documentos generados',
            'Google Calendar: crear eventos de inspecciones',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Nota legal */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
          <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">
            Tus datos están protegidos. SafeTrack Chile cumple con la Ley 19.628 de protección de datos personales.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-zinc-500">
          SafeTrack Chile © 2026 • Ley 16.744
        </p>
      </Card>
    </div>
  );
}
