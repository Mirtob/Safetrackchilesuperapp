import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppContent } from '@/app/AppContent';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { CompanyProvider } from '@/app/context/CompanyContext';
import { GoogleLogin } from '@/app/components/GoogleLogin';
import { LoadingScreen } from '@/app/components/LoadingScreen';
import { supabase, isSupabaseConfigured } from '@/app/services/supabase';
import { GoogleDriveService, DriveAuthError } from '@/app/services/googleDrive';
import { storeRefreshToken, clearRefreshToken } from '@/app/services/googleTokenRefresh';

export interface UserData {
  email: string;
  name: string;
  picture: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = (session: Session | null) => {
    if (session) {
      const meta = session.user.user_metadata;
      setUserData({
        email: session.user.email || '',
        name: meta?.full_name || meta?.name || '',
        picture: meta?.avatar_url || meta?.picture || '',
      });
      setIsAuthenticated(true);

      // El refresh_token también llega solo en el redirect del OAuth. Guardarlo
      // es lo que permite renovar el acceso a Drive sin volver a iniciar sesión
      // cada hora; se almacena del lado del servidor, nunca vuelve al navegador.
      if (session.provider_refresh_token) {
        storeRefreshToken(session.provider_refresh_token);
      }

      // provider_token solo llega en el redirect del OAuth. En sesiones
      // restauradas viene vacío, así que recuperamos el que persistimos.
      if (session.provider_token) {
        GoogleDriveService.setAccessToken(session.provider_token);
      } else {
        GoogleDriveService.restoreAccessToken();
      }
    } else {
      setUserData(null);
      setIsAuthenticated(false);
      GoogleDriveService.setAccessToken('');
    }
  };

  // Bootstrap de estructura Drive al autenticar (solo con Supabase real, no demo).
  // Si el token guardado caducó, ensureAccess lo renueva contra la Edge Function
  // antes de intentarlo. Si tampoco se puede, no se fuerza nada: el banner de
  // DriveConnectionAlert le ofrece al usuario reconectar.
  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured) return;

    let cancelled = false;

    (async () => {
      const ready = await GoogleDriveService.ensureAccess();
      if (!ready || cancelled) return;

      try {
        await GoogleDriveService.bootstrapDriveStructure();
      } catch (err) {
        if (err instanceof DriveAuthError) return; // el banner ya lo comunica
        console.error('[Drive] bootstrap falló:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Sin Supabase: modo demo con sesión simulada
      const stored = localStorage.getItem('user_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserData(parsed);
          setIsAuthenticated(true);
          const token = localStorage.getItem('google_access_token');
          if (token) GoogleDriveService.setAccessToken(token);
        } catch { /* ignorar */ }
      }
      setIsLoading(false);
      return;
    }

    // Con Supabase: onAuthStateChange maneja TODO incluyendo el redirect de OAuth.
    // NO llamamos getSession() porque retorna null antes de que se procese
    // el hash de la URL, generando un flash del login antes de llegar al dashboard.
    if (import.meta.env.DEV) {
      console.log('[Auth] hash al cargar:', window.location.hash.slice(0, 80));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log('[Auth]', event, session ? `user=${session.user.email}` : 'no session');
      }
      applySession(session);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      // Se olvida el refresh token antes de cerrar sesión: después ya no habría
      // permiso para borrarlo y quedaría vivo en el servidor sin dueño activo.
      await clearRefreshToken();
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('user_data');
      setUserData(null);
      setIsAuthenticated(false);
    }
    GoogleDriveService.setAccessToken('');
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen
          message="Cargando SafeTrack Chile..."
          submessage="Inicializando sistema de prevención de riesgos"
        />
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <GoogleLogin />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CompanyProvider>
        <AppContent userData={userData} onLogout={handleLogout} />
      </CompanyProvider>
    </ThemeProvider>
  );
}
