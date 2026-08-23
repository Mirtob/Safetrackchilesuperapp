import { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, Loader2, FileText, Copy, CheckCircle2, Satellite } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { useFinanceSettings } from '@/app/hooks/useFinanceSettings';
import { formatMoney } from '@/app/services/financeSettings';
import type { ClientCompany, BillingCycle } from '@/app/services/clientPortfolioService';
import {
  type PeriodSummary,
  buildPeriodSummary,
  buildInvoiceDescription,
  getCurrentPeriod,
} from '@/app/services/billingSummaryService';

interface ShiftSummaryPanelProps {
  clients: ClientCompany[];
  /** Se llama al emitir la boleta desde el resumen. */
  onCreateInvoice?: (companyId: string, amount: number, description: string) => void;
}

const CYCLE_LABEL: Record<BillingCycle, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

/**
 * Resumen de horas por período, listo para emitir la boleta.
 *
 * Toma las faenas que el GPS registró, las agrupa según la política de pago de
 * cada empresa y muestra el total valorizado con el valor HH de esa empresa.
 * Es el puente entre "estuve en planta" y "esto es lo que cobro".
 */
export function ShiftSummaryPanel({ clients, onCreateInvoice }: ShiftSummaryPanelProps) {
  const { settings } = useFinanceSettings();

  const [selectedId, setSelectedId] = useState<string>(clients[0]?.id || '');
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedId);

  useEffect(() => {
    if (!selectedId && clients.length > 0) setSelectedId(clients[0].id);
  }, [clients, selectedId]);

  const load = useCallback(async () => {
    if (!selectedClient) {
      setSummary(null);
      return;
    }

    setIsLoading(true);
    try {
      const result = await buildPeriodSummary({
        companyId: selectedClient.id,
        companyName: selectedClient.name,
        cycle: selectedClient.billingCycle,
        settings,
      });
      setSummary(result);
    } catch (err) {
      toast.error('No se pudo cargar el resumen', { description: (err as Error).message });
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient, settings]);

  useEffect(() => { void load(); }, [load]);

  const copyDetail = async () => {
    if (!summary) return;

    const lines = summary.shifts.map(s =>
      `${s.date}  ${s.startTime}–${s.endTime}  ${s.hours.toLocaleString('es-CL', { maximumFractionDigits: 2 })} h  ` +
      `${formatMoney(s.amount, settings)}  ${s.location}`
    );

    const text = [
      buildInvoiceDescription(summary),
      '',
      ...lines,
      '',
      `Total horas: ${summary.totalHours.toLocaleString('es-CL', { maximumFractionDigits: 2 })}`,
      `Monto bruto: ${formatMoney(summary.gross, settings)}`,
      `Retención (${settings.retentionRate}%): −${formatMoney(summary.breakdown.retention, settings)}`,
      `Líquido a recibir: ${formatMoney(summary.breakdown.net, settings)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Detalle copiado', { description: 'Pégalo en la boleta o envíalo a la empresa.' });
    } catch {
      toast.error('No se pudo copiar el detalle');
    }
  };

  if (clients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Aún no tienes empresas con facturación activada.
        </p>
      </Card>
    );
  }

  const period = selectedClient ? getCurrentPeriod(selectedClient.billingCycle) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label htmlFor="summary-company" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Empresa
          </label>
          <select
            id="summary-company"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Cobro {CYCLE_LABEL[selectedClient.billingCycle].toLowerCase()}</Badge>
            <Badge variant="outline">
              {selectedClient.hourlyRate > 0
                ? `${formatMoney(selectedClient.hourlyRate, settings)}/h`
                : 'Sin valor HH'}
            </Badge>
          </div>
        )}
      </div>

      {period && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Período vigente: <span className="font-medium text-zinc-900 dark:text-white">{period.label}</span>
        </p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando faenas...
        </div>
      )}

      {!isLoading && summary && summary.shifts.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
          <p className="font-medium text-zinc-900 dark:text-white">Sin horas en este período</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Las visitas se registran solas cuando llegas a la empresa con el GPS activado.
          </p>
        </Card>
      )}

      {!isLoading && summary && summary.shifts.length > 0 && (
        <>
          {/* Totales primero: es lo que el ingeniero necesita para la boleta. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Visitas</p>
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">{summary.visitCount}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Horas</p>
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                {summary.totalHours.toLocaleString('es-CL', { maximumFractionDigits: 2 })}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Bruto</p>
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                {formatMoney(summary.gross, settings)}
              </p>
            </Card>
            <Card className="border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-300">Líquido</p>
              <p className="text-2xl font-bold tabular-nums text-green-900 dark:text-green-100">
                {formatMoney(summary.breakdown.net, settings)}
              </p>
              <p className="text-xs text-green-800 dark:text-green-200">
                retención {settings.retentionRate}%
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Detalle de visitas</h3>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {summary.shifts.map(shift => (
                <div key={shift.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {new Date(`${shift.date}T12:00:00`).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short',
                        })}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {shift.startTime}–{shift.endTime}
                      </span>
                      {shift.fullyAutomatic && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Satellite className="h-3 w-3" />
                          GPS
                        </Badge>
                      )}
                    </div>
                    {shift.location && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {shift.location}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="font-semibold tabular-nums text-zinc-900 dark:text-white">
                      {shift.hours.toLocaleString('es-CL', { maximumFractionDigits: 2 })} h
                    </p>
                    <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {shift.amount > 0 ? formatMoney(shift.amount, settings) : 'No facturable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyDetail}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar detalle
            </Button>

            {onCreateInvoice && summary.gross > 0 && (
              <Button
                onClick={() => onCreateInvoice(summary.companyId, summary.gross, buildInvoiceDescription(summary))}
                className="bg-[#FF8C00] text-white hover:bg-[#e67e00]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Emitir boleta por {formatMoney(summary.gross, settings)}
              </Button>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Solo aparecen faenas que aún no has facturado. Al emitir la boleta se marcan como
              cobradas y dejan de sumar en el próximo período.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
