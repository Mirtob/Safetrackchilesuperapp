/**
 * Resúmenes de horas para la boleta de honorarios — SafeTrack Chile
 *
 * Agrupa las faenas registradas por GPS según la política de pago de cada
 * empresa (diaria, semanal, quincenal o mensual) y arma el detalle que el
 * prevencionista necesita para emitir la boleta: horas por visita, valor HH
 * aplicado, total bruto y retención.
 *
 * Todo el cálculo parte del valor HH de la empresa, no de un valor global: cada
 * cliente puede tener su propia tarifa negociada.
 */

import { supabase, isSupabaseConfigured } from '@/app/services/supabase';
import type { BillingCycle } from '@/app/services/clientPortfolioService';
import {
  type FinanceSettings,
  calculateHonorarium,
  type HonorariumBreakdown,
} from '@/app/services/financeSettings';

export interface ShiftLine {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  location: string;
  activity: string;
  gpsVerified: boolean;
  /** Registrada por GPS de punta a punta, sin edición manual. */
  fullyAutomatic: boolean;
}

export interface PeriodSummary {
  companyId: string;
  companyName: string;
  cycle: BillingCycle;
  /** Inicio y fin del período, en fecha local YYYY-MM-DD. */
  periodStart: string;
  periodEnd: string;
  label: string;
  shifts: ShiftLine[];
  totalHours: number;
  /** Suma de los montos de cada faena. */
  gross: number;
  /** Desglose con retención e IVA según la configuración del profesional. */
  breakdown: HonorariumBreakdown;
  visitCount: number;
}

const pad = (n: number): string => String(n).padStart(2, '0');
const toISODate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Ventana de facturación vigente para un ciclo dado.
 *
 * La semana arranca en lunes, que es como se entiende una semana de trabajo en
 * Chile; la quincena parte el 1 y el 16.
 */
export const getCurrentPeriod = (
  cycle: BillingCycle,
  reference = new Date()
): { start: string; end: string; label: string } => {
  const y = reference.getFullYear();
  const m = reference.getMonth();
  const d = reference.getDate();

  if (cycle === 'daily') {
    const day = toISODate(reference);
    return { start: day, end: day, label: `${d} de ${MONTHS[m]} ${y}` };
  }

  if (cycle === 'weekly') {
    const weekday = reference.getDay(); // 0 = domingo
    const backToMonday = weekday === 0 ? 6 : weekday - 1;
    const start = new Date(y, m, d - backToMonday);
    const end = new Date(y, m, d - backToMonday + 6);
    return {
      start: toISODate(start),
      end: toISODate(end),
      label: `Semana del ${start.getDate()} al ${end.getDate()} de ${MONTHS[end.getMonth()]}`,
    };
  }

  if (cycle === 'biweekly') {
    const firstHalf = d <= 15;
    const start = new Date(y, m, firstHalf ? 1 : 16);
    const end = firstHalf ? new Date(y, m, 15) : new Date(y, m + 1, 0);
    return {
      start: toISODate(start),
      end: toISODate(end),
      label: `${firstHalf ? 'Primera' : 'Segunda'} quincena de ${MONTHS[m]} ${y}`,
    };
  }

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { start: toISODate(start), end: toISODate(end), label: `${MONTHS[m]} ${y}` };
};

const mapShift = (row: any): ShiftLine => ({
  id: row.id,
  date: row.entry_date,
  startTime: row.start_time || '',
  endTime: row.end_time || '',
  hours: Number(row.duration_hours || 0),
  hourlyRate: Number(row.hourly_rate || 0),
  amount: Number(row.amount || 0),
  location: row.location || '',
  activity: row.activity || '',
  gpsVerified: Boolean(row.gps_verified),
  fullyAutomatic: Boolean(row.auto_started && row.auto_ended),
});

export interface SummaryRequest {
  companyId: string;
  companyName: string;
  cycle: BillingCycle;
  settings: FinanceSettings;
  /** Si se omite, se usa el período vigente del ciclo. */
  period?: { start: string; end: string; label: string };
  /** Excluye las faenas ya incluidas en una boleta anterior. */
  onlyUninvoiced?: boolean;
}

/**
 * Arma el resumen de un período. Devuelve un resumen vacío (no null) cuando no
 * hay faenas, para que la UI pueda mostrar "sin horas en este período" en vez
 * de una pantalla en blanco.
 */
export const buildPeriodSummary = async ({
  companyId,
  companyName,
  cycle,
  settings,
  period,
  onlyUninvoiced = true,
}: SummaryRequest): Promise<PeriodSummary> => {
  const window = period || getCurrentPeriod(cycle);

  const empty: PeriodSummary = {
    companyId,
    companyName,
    cycle,
    periodStart: window.start,
    periodEnd: window.end,
    label: window.label,
    shifts: [],
    totalHours: 0,
    gross: 0,
    breakdown: calculateHonorarium(0, settings),
    visitCount: 0,
  };

  if (!isSupabaseConfigured) return empty;

  let query = supabase
    .from('professional_time_entries')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .gte('entry_date', window.start)
    .lte('entry_date', window.end)
    .order('entry_date', { ascending: true });

  if (onlyUninvoiced) query = query.is('invoiced_at', null);

  const { data, error } = await query;
  if (error) throw error;

  const shifts = (data || []).map(mapShift);
  const totalHours = Math.round(shifts.reduce((sum, s) => sum + s.hours, 0) * 100) / 100;
  const gross = shifts.reduce((sum, s) => sum + s.amount, 0);

  return {
    ...empty,
    shifts,
    totalHours,
    gross,
    breakdown: calculateHonorarium(gross, settings),
    visitCount: shifts.length,
  };
};

/**
 * Texto listo para pegar en la descripción de la boleta de honorarios.
 *
 * El SII no recibe el detalle línea a línea, pero la empresa sí lo pide para
 * validar el cobro, así que se entrega en un formato que se puede adjuntar.
 */
export const buildInvoiceDescription = (summary: PeriodSummary): string => {
  if (summary.shifts.length === 0) {
    return `Servicios de prevención de riesgos — ${summary.label}`;
  }

  const horas = summary.totalHours.toLocaleString('es-CL', { maximumFractionDigits: 2 });
  const visitas = summary.visitCount === 1 ? '1 visita' : `${summary.visitCount} visitas`;

  return (
    `Servicios de prevención de riesgos — ${summary.label}\n` +
    `${visitas} en terreno, ${horas} horas registradas.`
  );
};

/**
 * Marca las faenas del resumen como facturadas, para que no vuelvan a aparecer
 * en el próximo período. Se llama después de emitir la boleta.
 */
export const markShiftsInvoiced = async (
  shiftIds: string[],
  invoiceId?: string
): Promise<void> => {
  if (!isSupabaseConfigured || shiftIds.length === 0) return;

  const { error } = await supabase
    .from('professional_time_entries')
    .update({ invoiced_at: new Date().toISOString(), invoice_id: invoiceId || null })
    .in('id', shiftIds);

  if (error) throw error;
};
