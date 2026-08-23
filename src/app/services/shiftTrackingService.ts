/**
 * Faenas automáticas por GPS — SafeTrack Chile
 *
 * Cronometra el tiempo del prevencionista en planta sin que tenga que acordarse
 * de apretar nada: la faena se abre al entrar al radio de la empresa y se cierra
 * al salir. Las horas resultantes se valorizan con el valor HH de esa empresa y
 * alimentan el resumen que va a la boleta de honorarios.
 *
 * Por qué importa la histéresis: el GPS de un teléfono oscila decenas de metros
 * incluso quieto. Sin un margen de salida y una confirmación sostenida, una
 * visita de tres horas se partiría en veinte faenas de minutos.
 */

import { supabase, isSupabaseConfigured } from '@/app/services/supabase';

export interface ActiveShift {
  id: string;
  companyId: string;
  companyName: string;
  branchId?: string;
  /** ISO del momento de entrada. */
  startedAt: string;
  hourlyRate: number;
  /** true si la abrió el GPS y no el usuario. */
  autoStarted: boolean;
}

export interface ClosedShift extends ActiveShift {
  endedAt: string;
  /** Horas redondeadas a dos decimales. */
  durationHours: number;
  /** Horas efectivamente cobradas tras aplicar el mínimo facturable. */
  billableHours: number;
  amount: number;
}

/**
 * Metros que hay que alejarse MÁS ALLÁ del radio para dar por terminada la
 * faena. Evita que el ruido del GPS cierre la faena mientras el prevencionista
 * sigue en planta.
 */
export const EXIT_MARGIN_M = 75;

/** Lecturas consecutivas fuera del radio antes de cerrar. */
export const EXIT_CONFIRMATIONS = 3;

const toHours = (fromISO: string, toISO: string): number => {
  const ms = new Date(toISO).getTime() - new Date(fromISO).getTime();
  return Math.max(0, Math.round((ms / 3_600_000) * 100) / 100);
};

/** "14:35" en hora local, que es como se registra la entrada y la salida. */
const toLocalTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

const toLocalDate = (iso: string): string => {
  const d = new Date(iso);
  // Fecha local, no UTC: una faena a las 21:00 en Chile no debe quedar al día siguiente.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Busca una faena abierta del usuario. Se llama al arrancar la app: si el
 * teléfono se quedó sin batería en planta, la faena sigue viva en la base y hay
 * que retomarla en vez de abrir otra.
 */
export const findOpenShift = async (
  companies: { id: string; name: string; hourlyRate?: number }[]
): Promise<ActiveShift | null> => {
  if (!isSupabaseConfigured || companies.length === 0) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('professional_time_entries')
      .select('*')
      .eq('created_by', user.id)
      .eq('status', 'in-progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const company = companies.find(c => c.id === data.company_id);

    return {
      id: data.id,
      companyId: data.company_id,
      companyName: company?.name || 'Empresa',
      branchId: data.branch_id || undefined,
      startedAt: data.created_at,
      hourlyRate: Number(data.hourly_rate) || company?.hourlyRate || 0,
      autoStarted: Boolean(data.auto_started),
    };
  } catch {
    return null;
  }
};

export interface StartShiftInput {
  companyId: string;
  companyName: string;
  branchId?: string;
  hourlyRate: number;
  location: string;
  coords?: { latitude: number; longitude: number };
  autoStarted?: boolean;
}

/** Abre una faena. El monto queda en cero hasta que se cierre. */
export const startShift = async (input: StartShiftInput): Promise<ActiveShift | null> => {
  if (!isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const nowISO = new Date().toISOString();

  const { data, error } = await supabase
    .from('professional_time_entries')
    .insert({
      company_id: input.companyId,
      branch_id: input.branchId || null,
      created_by: user.id,
      entry_date: toLocalDate(nowISO),
      start_time: toLocalTime(nowISO),
      duration_hours: 0,
      amount: 0,
      hourly_rate: input.hourlyRate,
      location: input.location || null,
      activity: 'Visita en terreno',
      status: 'in-progress',
      gps_verified: Boolean(input.coords),
      auto_started: input.autoStarted ?? true,
      start_lat: input.coords?.latitude ?? null,
      start_lng: input.coords?.longitude ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    companyId: input.companyId,
    companyName: input.companyName,
    branchId: input.branchId,
    startedAt: data.created_at,
    hourlyRate: input.hourlyRate,
    autoStarted: input.autoStarted ?? true,
  };
};

export interface EndShiftInput {
  shift: ActiveShift;
  coords?: { latitude: number; longitude: number };
  /** Visitas más cortas que esto no se cobran. */
  minBillableMinutes?: number;
  autoEnded?: boolean;
}

/**
 * Cierra la faena y la valoriza.
 *
 * El mínimo facturable evita que pasar frente a la planta genere un cobro de
 * dos minutos: por debajo del umbral la faena queda registrada como visita,
 * con monto cero.
 */
export const endShift = async ({
  shift,
  coords,
  minBillableMinutes = 15,
  autoEnded = true,
}: EndShiftInput): Promise<ClosedShift | null> => {
  if (!isSupabaseConfigured) return null;

  const endedAt = new Date().toISOString();
  const durationHours = toHours(shift.startedAt, endedAt);
  const isBillable = durationHours * 60 >= minBillableMinutes;
  const billableHours = isBillable ? durationHours : 0;
  const amount = Math.round(billableHours * shift.hourlyRate);

  const { error } = await supabase
    .from('professional_time_entries')
    .update({
      end_time: toLocalTime(endedAt),
      duration_hours: durationHours,
      amount,
      status: 'completed',
      auto_ended: autoEnded,
      end_lat: coords?.latitude ?? null,
      end_lng: coords?.longitude ?? null,
    })
    .eq('id', shift.id);

  if (error) throw error;

  return { ...shift, endedAt, durationHours, billableHours, amount };
};

/** Deja constancia de que ya se avisó, para no repetir el aviso al recargar. */
export const markNotified = async (
  shiftId: string,
  kind: 'arrival' | 'departure'
): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const column = kind === 'arrival' ? 'arrival_notified_at' : 'departure_notified_at';

  try {
    await supabase
      .from('professional_time_entries')
      .update({ [column]: new Date().toISOString() })
      .eq('id', shiftId);
  } catch {
    // El aviso ya se mostró; no vale la pena molestar al usuario por esto.
  }
};

/** Texto del aviso que recibe la empresa al iniciarse la faena. */
export const buildArrivalMessage = (shift: ActiveShift, professionalName: string): string =>
  `SafeTrack Chile\n\n${professionalName || 'El prevencionista'} llegó a ${shift.companyName} ` +
  `a las ${toLocalTime(shift.startedAt)} e inició la visita en terreno.`;

/** Texto del aviso de cierre, con el detalle de horas que se cobrarán. */
export const buildDepartureMessage = (shift: ClosedShift, professionalName: string): string => {
  const horas = shift.durationHours.toLocaleString('es-CL', { maximumFractionDigits: 2 });
  const detalle = shift.billableHours > 0
    ? `Horas registradas: ${horas} h.`
    : `Visita de ${horas} h, bajo el mínimo facturable: no genera cobro.`;

  return (
    `SafeTrack Chile\n\n${professionalName || 'El prevencionista'} terminó la visita en ` +
    `${shift.companyName}.\nEntrada ${toLocalTime(shift.startedAt)} · Salida ${toLocalTime(shift.endedAt)}\n${detalle}`
  );
};
