import { GoogleOAuthProvider, GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Logo } from '@/app/components/Logo';
import { useState } from 'react';

interface GoogleLoginProps {
  onLoginSuccess: (userData: GoogleUserData) => void;
}

export interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

// ID de cliente de Google OAuth (en producción debe estar en variables de entorno)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

export function GoogleLogin({ onLoginSuccess }: GoogleLoginProps) {
  const [showDevMode, setShowDevMode] = useState(false);

  const handleSuccess = (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const decoded: any = jwtDecode(credentialResponse.credential);
        
        const userData: GoogleUserData = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          accessToken: credentialResponse.credential
        };

        // Guardar token en localStorage para persistencia
        localStorage.setItem('google_access_token', credentialResponse.credential);
        localStorage.setItem('user_data', JSON.stringify(userData));

        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Error al procesar credenciales de Google:', error);
    }
  };

  const handleError = () => {
    console.error('Error al iniciar sesión con Google');
    setShowDevMode(true);
  };

  // Modo desarrollo: Login sin Google OAuth (solo para testing)
  const handleDevLogin = () => {
    const devUserData: GoogleUserData = {
      email: 'demo@safetrack.cl',
      name: 'Usuario Demo',
      picture: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=0055A4&color=fff',
      accessToken: 'dev_token_' + Date.now()
    };

    localStorage.setItem('google_access_token', devUserData.accessToken);
    localStorage.setItem('user_data', JSON.stringify(devUserData));

    onLoginSuccess(devUserData);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 p-4">
        <Card className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">
          {/* Logo y Header */}
          <div className="text-center mb-8">
            <Logo className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              SafeTrack Chile
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Sistema de Gestión de Prevención de Riesgos
            </p>
          </div>

          {/* Alerta de configuración */}
          {GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900 dark:text-yellow-100">
                  <p className="font-semibold mb-1">Modo Desarrollo</p>
                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                    Google OAuth no está configurado. Para configurarlo:
                  </p>
                  <ol className="list-decimal list-inside text-xs space-y-1 text-yellow-800 dark:text-yellow-200">
                    <li>Crea un proyecto en Google Cloud Console</li>
                    <li>Habilita Google+ API</li>
                    <li>Crea credenciales OAuth 2.0</li>
                    <li>Agrega tu Client ID en GoogleLogin.tsx</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Inicia sesión</p>
                <p className="text-blue-800 dark:text-blue-200">
                  Accede a todas las funcionalidades de la plataforma incluyendo Google Maps, Calendar y Drive.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Google - Solo si está configurado */}
          {GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
            <div className="mb-6 flex justify-center">
              <GoogleLoginButton
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          ) : (
            <div className="mb-6">
              <Button
                onClick={handleDevLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Continuar en Modo Desarrollo
              </Button>
            </div>
          )}

          {/* Modo desarrollo alternativo si hay error */}
          {showDevMode && (
            <div className="mb-6">
              <Button
                onClick={handleDevLogin}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                Continuar sin Google (Desarrollo)
              </Button>
            </div>
          )}

          {/* Beneficios */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Al iniciar sesión podrás:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                Usar Google Maps para geolocalización y rutas
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                Sincronizar eventos con Google Calendar
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                Almacenar documentos en Google Drive
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                Acceder desde cualquier dispositivo
              </li>
            </ul>
          </div>

          {/* Nota de seguridad */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
            <p className="text-xs text-slate-600 dark:text-zinc-400 text-center">
              🔒 Tus datos están protegidos y encriptados. SafeTrack Chile cumple con la normativa chilena de protección de datos.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              SafeTrack Chile © 2026 • Ley 16.744
            </p>
          </div>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}