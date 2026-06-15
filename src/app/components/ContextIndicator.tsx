import { Building2, MapPin, AlertCircle } from 'lucide-react';
import { useCompany } from '@/app/context/CompanyContext';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';

interface ContextIndicatorProps {
  variant?: 'default' | 'compact' | 'banner';
  showWarning?: boolean;
}

export function ContextIndicator({ variant = 'default', showWarning = false }: ContextIndicatorProps) {
  const { selectedCompany, selectedBranch, isBranchSelected, getContextString } = useCompany();

  if (!selectedCompany) {
    return null;
  }

  // Variant: Banner (para mostrar en la parte superior de las vistas)
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-[#0055A4] to-[#0055A4]/80 text-white px-4 py-2 border-b border-[#0055A4]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="font-semibold text-sm">{selectedCompany.name}</span>
            </div>
            {isBranchSelected && selectedBranch && (
              <>
                <span className="text-white/60">›</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedBranch.name}</span>
                </div>
              </>
            )}
          </div>
          {showWarning && (
            <Badge className="bg-[#FF8C00] text-white border-[#FF8C00]">
              <AlertCircle className="w-3 h-3 mr-1" />
              Solo datos de este contexto
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Variant: Compact (para mostrar en headers de tarjetas)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <Building2 className="w-3 h-3 text-[#0055A4]" />
        <span>{selectedCompany.name}</span>
        {isBranchSelected && selectedBranch && (
          <>
            <span className="text-zinc-400">›</span>
            <MapPin className="w-3 h-3 text-[#FF8C00]" />
            <span>{selectedBranch.name}</span>
          </>
        )}
      </div>
    );
  }

  // Variant: Default (tarjeta completa)
  return (
    <Card className="bg-white dark:bg-zinc-800 border-[#0055A4]/20 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#0055A4]/10 flex items-center justify-center flex-shrink-0">
          {isBranchSelected ? (
            <MapPin className="w-5 h-5 text-[#0055A4]" />
          ) : (
            <Building2 className="w-5 h-5 text-[#0055A4]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            {isBranchSelected ? 'Sucursal Activa' : 'Empresa Activa'}
          </p>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {getContextString()}
          </p>
          {showWarning && (
            <div className="mt-2 flex items-start gap-2 text-xs text-[#FF8C00]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Todos los datos mostrados y creados pertenecen exclusivamente a este contexto
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Componente para advertir cuando no hay empresa seleccionada
 */
export function NoCompanyWarning() {
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
            No hay empresa seleccionada
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Debes seleccionar una empresa desde el selector principal para acceder a esta funcionalidad.
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            Los datos en SafeTrack están aislados por empresa para evitar mezcla de información.
          </p>
        </div>
      </div>
    </Card>
  );
}
