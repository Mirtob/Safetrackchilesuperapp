import { useState, useEffect } from 'react';
import { CloudOff, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { GoogleDriveService } from '@/app/services/googleDrive';
import { isSupabaseConfigured } from '@/app/services/supabase';
import { signInWithGoogle, isGoogleConfigured } from '@/app/services/googleAuth';

/**
 * Avisa cuando la autorización de Google Drive se perdió y ofrece reconectar.
 *
 * El access token de Google dura ~1h y no se puede refrescar desde el browser.
 * Antes, al expirar, cada subida a Drive fallaba dentro de un catch silencioso
 * y el usuario no se enteraba de que sus documentos no se estaban guardando.
 */
export function DriveConnectionAlert() {
  const [isAuthorized, setIsAuthorized] = useState(() => GoogleDriveService.isAuthorized());
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Mientras se intenta renovar en silencio no se muestra nada: en el caso
  // normal el usuario nunca llega a ver el aviso.
  const [isCheckingSilently, setIsCheckingSilently] = useState(true);

  useEffect(() => GoogleDriveService.onAuthChange(setIsAuthorized), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isSupabaseConfigured || !isGoogleConfigured) {
        if (!cancelled) setIsCheckingSilently(false);
        return;
      }

      await GoogleDriveService.ensureAccess();
      if (!cancelled) setIsCheckingSilently(false);
    })();

    return () => { cancelled = true; };
  }, []);

  // Solo aplica al modo real: en demo no hay Drive que reconectar.
  if (!isSupabaseConfigured || !isGoogleConfigured) return null;
  if (isAuthorized || dismissed || isCheckingSilently) return null;

  const handleReconnect = async () => {
    setIsReconnecting(true);
    const { error } = await signInWithGoogle();
    if (error) setIsReconnecting(false);
    // Sin error la página se redirige a Google.
  };

  return (
    <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CloudOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Google Drive desconectado
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Los documentos que generes no se guardarán en Drive hasta que vuelvas a conectar tu cuenta.
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            Ahora no
          </Button>
          <Button
            size="sm"
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {isReconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              'Reconectar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
