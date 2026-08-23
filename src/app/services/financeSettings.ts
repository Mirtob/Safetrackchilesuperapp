/**
 * Configuración financiera del profesional — SafeTrack Chile
 *
 * Todo lo que antes estaba hardcodeado en el módulo de finanzas vive aquí y lo
 * edita el usuario: tasa de retención, moneda, categorías de gasto, tarifas por
 * defecto, datos del emisor y numeración de boletas.
 *
 * Por qué importa: la tasa de retención de boletas de honorarios sube cada año
 * por ley (13,75% en 2024, 14,5% en 2025, 15,25% en 2026...). Con el valor
 * hardcodeado, cada enero había que tocar el código y redesplegar. Ahora el
 * usuario lo cambia desde la app.
 *
 * Persistencia: tabla `finance_settings` en Supabase (una fila por usuario,
 * columna JSONB). Si Supabase no está configurado o falla, cae a localStorage,
 * así la app sigue usable. El JSONB permite agregar parámetros nuevos sin
 * migrar la base.
 */

import { supabase, isSupabaseConfigured } from '@/app/services/supabase';

// ============================================================
// TIPOS
// ============================================================

export interface ExpenseCategory {
  /** Identificador estable; es lo que se guarda en la base. */
  id: string;
  label: string;
  /** Clave del set de colores de la UI. */
  color: 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'red' | 'zinc';
  /** Las de fábrica no se pueden borrar: hay gastos históricos apuntando a ellas. */
  builtIn?: boolean;
}

export interface IssuerInfo {
  name: string;
  rut: string;
  /** Giro o actividad económica, como aparece en la boleta. */
  activity: string;
  address: string;
  email: string;
  phone: string;
}

export interface FinanceSettings {
  issuer: IssuerInfo;

  /** Retención de boletas de honorarios, en porcentaje (15.25 = 15,25%). */
  retentionRate: number;
  /** Año al que corresponde la tasa vigente, solo informativo para la UI. */
  retentionYear: number;

  /** IVA en porcentaje. Solo aplica si el usuario emite facturas, no boletas. */
  vatRate: number;
  vatEnabled: boolean;

  /** Código ISO de moneda e identificador de locale para formatear montos. */
  currency: string;
  locale: string;

  /** Valores que se proponen al activar la facturación de un cliente nuevo. */
  defaultHourlyRate: number;
  defaultMonthlyFee: number;
  defaultPaymentDay: number;
  /** Días de plazo para el vencimiento de una boleta nueva. */
  defaultDueDays: number;

  /** Prefijo del número de boleta: <prefijo>-<año>-<correlativo>. */
  invoicePrefix: string;

  /** Reembolso por kilómetro recorrido, para rendiciones de transporte. */
  mileageRate: number;

  /** Días de anticipación para avisar de un cobro por vencer. */
  paymentReminderDays: number;

  expenseCategories: ExpenseCategory[];
}

// ============================================================
// VALORES POR DEFECTO
// ============================================================

/**
 * Las 6 categorías originales del código. Se marcan builtIn porque la tabla
 * `professional_expenses` ya tiene gastos guardados con estos ids.
 */
export const BUILT_IN_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'transport', label: 'Transporte', color: 'blue', builtIn: true },
  { id: 'fuel', label: 'Combustible', color: 'orange', builtIn: true },
  { id: 'food', label: 'Alimentación', color: 'green', builtIn: true },
  { id: 'accommodation', label: 'Alojamiento', color: 'purple', builtIn: true },
  { id: 'materials', label: 'Materiales', color: 'yellow', builtIn: true },
  { id: 'other', label: 'Otros', color: 'zinc', builtIn: true },
];

export const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  issuer: { name: '', rut: '', activity: 'Servicios de prevención de riesgos', address: '', email: '', phone: '' },

  retentionRate: 15.25,
  retentionYear: 2026,

  vatRate: 19,
  vatEnabled: false,

  currency: 'CLP',
  locale: 'es-CL',

  defaultHourlyRate: 0,
  defaultMonthlyFee: 0,
  defaultPaymentDay: 30,
  defaultDueDays: 30,

  invoicePrefix: 'HN',

  mileageRate: 0,

  paymentReminderDays: 5,

  expenseCategories: BUILT_IN_EXPENSE_CATEGORIES,
};

const STORAGE_KEY = 'safetrack_finance_settings';

// ============================================================
// NORMALIZACIÓN
// ============================================================

const clamp = (value: number, min: number, max: number, fallback: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;

/**
 * Completa una configuración parcial con los defaults y acota los valores
 * numéricos. Necesario porque el JSONB puede venir de una versión anterior
 * (con menos campos) o editado a mano.
 */
export const normalizeSettings = (raw: Partial<FinanceSettings> | null | undefined): FinanceSettings => {
  const base = DEFAULT_FINANCE_SETTINGS;
  if (!raw || typeof raw !== 'object') return { ...base };

  const categories = Array.isArray(raw.expenseCategories) && raw.expenseCategories.length > 0
    ? raw.expenseCategories.filter(c => c && typeof c.id === 'string' && typeof c.label === 'string')
    : base.expenseCategories;

  // Las categorías de fábrica siempre deben existir: hay gastos históricos
  // referenciándolas y sin ellas la UI mostraría "categoría desconocida".
  const withBuiltIns = [...categories];
  BUILT_IN_EXPENSE_CATEGORIES.forEach(builtIn => {
    if (!withBuiltIns.some(c => c.id === builtIn.id)) withBuiltIns.push(builtIn);
  });

  return {
    issuer: { ...base.issuer, ...(raw.issuer || {}) },

    retentionRate: clamp(Number(raw.retentionRate), 0, 100, base.retentionRate),
    retentionYear: clamp(Number(raw.retentionYear), 2000, 2100, base.retentionYear),

    vatRate: clamp(Number(raw.vatRate), 0, 100, base.vatRate),
    vatEnabled: Boolean(raw.vatEnabled ?? base.vatEnabled),

    currency: raw.currency || base.currency,
    locale: raw.locale || base.locale,

    defaultHourlyRate: clamp(Number(raw.defaultHourlyRate), 0, 1e9, base.defaultHourlyRate),
    defaultMonthlyFee: clamp(Number(raw.defaultMonthlyFee), 0, 1e9, base.defaultMonthlyFee),
    defaultPaymentDay: Math.round(clamp(Number(raw.defaultPaymentDay), 1, 31, base.defaultPaymentDay)),
    defaultDueDays: Math.round(clamp(Number(raw.defaultDueDays), 0, 365, base.defaultDueDays)),

    invoicePrefix: (raw.invoicePrefix || base.invoicePrefix).toUpperCase().slice(0, 8),

    mileageRate: clamp(Number(raw.mileageRate), 0, 1e6, base.mileageRate),

    paymentReminderDays: Math.round(clamp(Number(raw.paymentReminderDays), 0, 90, base.paymentReminderDays)),

    expenseCategories: withBuiltIns,
  };
};

// ============================================================
// PERSISTENCIA
// ============================================================

const readLocal = (): FinanceSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_FINANCE_SETTINGS };
  }
};

const writeLocal = (settings: FinanceSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Sin localStorage la config vive solo en memoria hasta el próximo guardado.
  }
};

/**
 * Carga la configuración. Siempre devuelve algo usable: ante cualquier fallo
 * cae a la copia local y, si no hay, a los defaults.
 */
export const loadFinanceSettings = async (): Promise<FinanceSettings> => {
  const local = readLocal();
  if (!isSupabaseConfigured) return local;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return local;

    const { data, error } = await supabase
      .from('finance_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle();

    // PGRST205/42P01: la tabla todavía no existe (falta correr la migración).
    // No es motivo para romper el módulo: seguimos con la copia local.
    if (error) return local;
    if (!data) return local;

    const remote = normalizeSettings(data.settings as Partial<FinanceSettings>);
    writeLocal(remote);
    return remote;
  } catch {
    return local;
  }
};

export interface SaveResult {
  settings: FinanceSettings;
  /** false = solo se guardó localmente; la UI debe avisarlo. */
  persistedRemotely: boolean;
  error?: string;
}

/** Guarda la configuración. Escribe siempre en local; en Supabase si se puede. */
export const saveFinanceSettings = async (input: FinanceSettings): Promise<SaveResult> => {
  const settings = normalizeSettings(input);
  writeLocal(settings);

  if (!isSupabaseConfigured) {
    return { settings, persistedRemotely: false, error: 'Supabase no está configurado' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { settings, persistedRemotely: false, error: 'Sesión no encontrada' };

    const { error } = await supabase
      .from('finance_settings')
      .upsert(
        { user_id: user.id, settings, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) return { settings, persistedRemotely: false, error: error.message };
    return { settings, persistedRemotely: true };
  } catch (err) {
    return { settings, persistedRemotely: false, error: (err as Error).message };
  }
};

// ============================================================
// HELPERS DERIVADOS
// ============================================================

/** Formatea un monto con la moneda y el locale configurados. */
export const formatMoney = (amount: number, settings: FinanceSettings): string => {
  try {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    // Locale o moneda inválidos: no vale la pena romper la pantalla por esto.
    return `${settings.currency} ${Math.round(amount || 0).toLocaleString('es-CL')}`;
  }
};

export interface HonorariumBreakdown {
  gross: number;
  retention: number;
  vat: number;
  net: number;
}

/**
 * Desglose de una boleta de honorarios: el líquido a recibir es el bruto menos
 * la retención, más IVA si el usuario emite facturas afectas.
 */
export const calculateHonorarium = (gross: number, settings: FinanceSettings): HonorariumBreakdown => {
  const safeGross = Number.isFinite(gross) ? gross : 0;
  const retention = Math.round(safeGross * (settings.retentionRate / 100));
  const vat = settings.vatEnabled ? Math.round(safeGross * (settings.vatRate / 100)) : 0;

  return { gross: safeGross, retention, vat, net: safeGross - retention + vat };
};

/** Busca una categoría por id, con un descriptor de respaldo si ya no existe. */
export const getExpenseCategory = (id: string, settings: FinanceSettings): ExpenseCategory =>
  settings.expenseCategories.find(c => c.id === id) || { id, label: id, color: 'zinc' };
