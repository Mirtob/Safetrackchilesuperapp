import { MapPin, Square, Send, X, Radio } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import type { ActiveShift } from '@/app/services/shiftTrackingService';
import { formatMoney } from '@/app/services/financeSettings';
import { useFinanceSettings } from '@/app/hooks/useFinanceSettings';
import { whatsappLink } from '@/app/services/notificationService';

interface ActiveShiftBarProps {
  shift: ActiveShift | null;
  elapsedMinutes: number;
  isTracking: boolean;
  pendingNotice: { companyName: string; message: string; phone?: string } | null;
  onDismissNotice: () => void;
  onCloseShift: () => void;
  onStartTracking: () => void;
}

const formatElapsed = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
};

/**
 * Barra de faena en curso.
 *
 * Le muestra al prevencionista que su tiempo se está contando y cuánto lleva
 * acumulado, para que no tenga que confiar a ciegas en que el GPS lo registró.
 * También ofrece cerrar la faena a mano, porque a veces se termina el trabajo
 * antes de salir del recinto.
 */
export function ActiveShiftBar({
  shift,
  elapsedMinutes,
  isTracking,
  pendingNotice,
  onDismissNotice,
  onCloseShift,
  onStartTracking,
}: ActiveShiftBarProps) {
  const { settings } = useFinanceSettings();

  // Aviso a la empresa que no se pudo enviar solo: se ofrece hacerlo a mano.
  if (!shift && pendingNotice) {
    return (
      <NoticeCard notice={pendingNotice} onDismiss={onDismissNotice} />
    );
  }

  if (!shift) {
    // Sin faena y sin GPS activo, se invita a encenderlo: sin seguimiento no
    // hay registro automático de horas.
    if (isTracking) return null;

    return (
      <div className="mx-4 mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Radio className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Registro automático de horas desactivado. Actívalo para que tus visitas se cronometren solas.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onStartTracking} className="flex-shrink-0">
          Activar
        </Button>
      </div>
    );
  }

  const accrued = (elapsedMinutes / 60) * shift.hourlyRate;

  return (
    <div className="space-y-2">
      <div className="mx-4 mt-4 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="relative mt-1 flex h-3 w-3 flex-shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600" />
            </span>

            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                En faena · {formatElapsed(elapsedMinutes)}
              </p>
              <p className="flex items-center gap-1 text-xs text-green-800 dark:text-green-200">
                <MapPin className="h-3 w-3" />
                {shift.companyName}
                {shift.hourlyRate > 0 && (
                  <>
                    {' · '}
                    {formatMoney(shift.hourlyRate, settings)}/h
                    {elapsedMinutes > 0 && ` · ${formatMoney(accrued, settings)} acumulado`}
                  </>
                )}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onCloseShift}
            className="flex-shrink-0 border-green-600 text-green-800 hover:bg-green-100 dark:text-green-200 dark:hover:bg-green-900/40"
          >
            <Square className="mr-1 h-3.5 w-3.5" />
            Terminar faena
          </Button>
        </div>

        {shift.hourlyRate === 0 && (
          <p className="mt-2 border-t border-green-200 pt-2 text-xs text-amber-800 dark:border-green-800 dark:text-amber-300">
            Esta empresa no tiene valor HH configurado: las horas se registran pero no se valorizan.
          </p>
        )}
      </div>

      {pendingNotice && <NoticeCard notice={pendingNotice} onDismiss={onDismissNotice} />}
    </div>
  );
}

/**
 * Aviso listo para la empresa.
 *
 * El envío automático por WhatsApp o correo necesita un proveedor contratado
 * que hoy no está conectado, así que en lugar de fingir que se envió, se deja
 * el mensaje armado y a un toque de mandarlo.
 */
function NoticeCard({
  notice,
  onDismiss,
}: {
  notice: { companyName: string; message: string; phone?: string };
  onDismiss: () => void;
}) {
  const openWhatsApp = () => {
    // Con el número de la empresa el chat se abre ya dirigido; sin él, el
    // usuario elige el contacto.
    window.open(whatsappLink(notice.phone || '', notice.message), '_blank', 'noopener,noreferrer');
    onDismiss();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(notice.message);
      toast.success('Mensaje copiado');
      onDismiss();
    } catch {
      toast.error('No se pudo copiar el mensaje');
    }
  };

  return (
    <div className="mx-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Aviso listo para {notice.companyName}
          </p>
          <p className="mt-1 whitespace-pre-line text-xs text-blue-800 dark:text-blue-200">
            {notice.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar aviso"
          className="flex-shrink-0 rounded p-1 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={openWhatsApp} className="bg-green-600 text-white hover:bg-green-700">
          <Send className="mr-1 h-3.5 w-3.5" />
          Enviar por WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={copy}>
          Copiar
        </Button>
      </div>
    </div>
  );
}
