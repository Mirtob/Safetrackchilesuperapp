import { MapPin, CheckCircle2, X, Navigation, Building2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Company, Branch } from '@/app/context/CompanyContext';

interface LocationArrivalNotificationProps {
  company: Company;
  branch?: Branch;
  distance: number;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function LocationArrivalNotification({
  company,
  branch,
  distance,
  onConfirm,
  onDismiss
}: LocationArrivalNotificationProps) {
  const locationName = branch ? branch.name : company.name;
  const address = branch ? branch.address : company.address;
  const workerCount = branch ? branch.workerCount : company.workerCount;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="bg-white dark:bg-zinc-800 border-2 border-[#FF8C00] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="p-6">
          {/* Header con animación de pulso */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF8C00] rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-[#FF8C00] text-white p-4 rounded-full">
                <MapPin className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-center text-xl font-bold text-slate-900 dark:text-white mb-2">
            📍 Has llegado a tu destino
          </h3>

          {/* Información de la ubicación */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <Building2 className="w-5 h-5 text-[#0055A4] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-semibold mb-1">
                  {locationName}
                </h4>
                {branch && (
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                    Empresa: {company.name}
                  </p>
                )}
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-700 dark:text-zinc-300">
                  Distancia: <strong>{distance}m</strong>
                </span>
              </div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0">
                {workerCount} trabajadores
              </Badge>
            </div>
          </div>

          {/* Pregunta de confirmación */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-amber-900 dark:text-amber-300 text-center font-medium">
              ¿Confirmas que has llegado a esta ubicación?
            </p>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Sí, llegué
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              className="h-12 border-2 border-slate-300 dark:border-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              <X className="w-5 h-5 mr-2" />
              No
            </Button>
          </div>

          {/* Nota informativa */}
          <p className="text-xs text-slate-500 dark:text-zinc-500 text-center mt-4">
            Al confirmar, se abrirá el dashboard de esta ubicación con tus tareas pendientes.
          </p>
        </div>
      </Card>
    </div>
  );
}
