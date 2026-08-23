import { useState, useEffect } from 'react';
import {
  Settings, Save, RotateCcw, Plus, Trash2, AlertCircle, Info, Loader2, Calculator,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { useFinanceSettings } from '@/app/hooks/useFinanceSettings';
import {
  type FinanceSettings,
  type ExpenseCategory,
  DEFAULT_FINANCE_SETTINGS,
  formatMoney,
  calculateHonorarium,
} from '@/app/services/financeSettings';

const CATEGORY_COLORS: ExpenseCategory['color'][] = [
  'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'zinc',
];

const COLOR_SWATCH: Record<ExpenseCategory['color'], string> = {
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  zinc: 'bg-zinc-500',
};

/** Convierte "Peajes y estacionamiento" en "peajes-y-estacionamiento". */
const slugify = (label: string): string =>
  label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/**
 * Configuración del módulo de finanzas.
 *
 * Cada parámetro que antes vivía hardcodeado en el código se edita acá, de modo
 * que cambios como la subida anual de la tasa de retención no necesiten tocar
 * el código ni volver a desplegar.
 */
export function FinanceSettingsPanel() {
  const { settings, isLoading, save } = useFinanceSettings();

  const [draft, setDraft] = useState<FinanceSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Sincroniza cuando termina la carga inicial o cambia desde otra pantalla.
  useEffect(() => setDraft(settings), [settings]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const update = <K extends keyof FinanceSettings>(key: K, value: FinanceSettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const updateIssuer = (key: keyof FinanceSettings['issuer'], value: string) =>
    setDraft(prev => ({ ...prev, issuer: { ...prev.issuer, [key]: value } }));

  /** Los inputs numéricos guardan '' como 0 para no dejar NaN en el borrador. */
  const numeric = (value: string): number => (value === '' ? 0 : Number(value));

  const handleSave = async () => {
    setIsSaving(true);
    const result = await save(draft);
    setIsSaving(false);

    if (result.persistedRemotely) {
      toast.success('Configuración guardada');
    } else {
      toast.warning('Guardado solo en este dispositivo', {
        description:
          result.error === 'Supabase no está configurado'
            ? 'Sin conexión a la base, la configuración no se sincroniza entre dispositivos.'
            : `No se pudo guardar en el servidor: ${result.error}. Si la tabla finance_settings no existe, corre la migración 001_finance_settings.sql.`,
      });
    }
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_FINANCE_SETTINGS, issuer: draft.issuer });
    toast.info('Valores restaurados', { description: 'Revisa y guarda para confirmar.' });
  };

  const handleAddCategory = () => {
    const label = newCategory.trim();
    if (!label) return;

    const id = slugify(label);
    if (!id) {
      toast.error('Nombre de categoría no válido');
      return;
    }
    if (draft.expenseCategories.some(c => c.id === id)) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }

    update('expenseCategories', [
      ...draft.expenseCategories,
      { id, label, color: CATEGORY_COLORS[draft.expenseCategories.length % CATEGORY_COLORS.length] },
    ]);
    setNewCategory('');
  };

  const handleRemoveCategory = (id: string) =>
    update('expenseCategories', draft.expenseCategories.filter(c => c.id !== id));

  const handleCategoryChange = (id: string, patch: Partial<ExpenseCategory>) =>
    update('expenseCategories', draft.expenseCategories.map(c => (c.id === id ? { ...c, ...patch } : c)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Cargando configuración...
      </div>
    );
  }

  // Vista previa en vivo con un monto de referencia, para que el usuario vea el
  // efecto de la tasa antes de guardar.
  const previewGross = draft.defaultMonthlyFee > 0 ? draft.defaultMonthlyFee : 1_000_000;
  const preview = calculateHonorarium(previewGross, draft);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#FF8C00]/10 p-2">
          <Settings className="h-5 w-5 text-[#FF8C00]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Configuración de finanzas
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Estos valores se aplican a boletas, horas y rendiciones. Cámbialos cuando quieras: no
            requiere soporte técnico.
          </p>
        </div>
      </div>

      {/* ── Emisor ─────────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">Datos del emisor</h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Aparecen en las boletas y reportes que genera la app.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nombre o razón social</Label>
            <Input
              value={draft.issuer.name}
              onChange={e => updateIssuer('name', e.target.value)}
              placeholder="Ej: María González Fuentes"
            />
          </div>
          <div>
            <Label>RUT</Label>
            <Input
              value={draft.issuer.rut}
              onChange={e => updateIssuer('rut', e.target.value)}
              placeholder="12.345.678-9"
            />
          </div>
          <div>
            <Label>Giro / actividad</Label>
            <Input
              value={draft.issuer.activity}
              onChange={e => updateIssuer('activity', e.target.value)}
            />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input
              value={draft.issuer.address}
              onChange={e => updateIssuer('address', e.target.value)}
              placeholder="Calle 123, Comuna, Ciudad"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={draft.issuer.email}
              onChange={e => updateIssuer('email', e.target.value)}
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={draft.issuer.phone}
              onChange={e => updateIssuer('phone', e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>
      </Card>

      {/* ── Impuestos ──────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">Impuestos y retención</h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          La retención de boletas de honorarios sube por ley cada año. Actualízala aquí en enero.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Tasa de retención (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={draft.retentionRate}
              onChange={e => update('retentionRate', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Año de vigencia</Label>
            <Input
              type="number"
              min="2000"
              max="2100"
              value={draft.retentionYear}
              onChange={e => update('retentionYear', numeric(e.target.value))}
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Emito documentos afectos a IVA</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Actívalo solo si facturas como empresa. Las boletas de honorarios no llevan IVA.
              </p>
            </div>
            <Switch
              checked={draft.vatEnabled}
              onCheckedChange={checked => update('vatEnabled', checked)}
            />
          </div>

          {draft.vatEnabled && (
            <div>
              <Label>Tasa de IVA (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={draft.vatRate}
                onChange={e => update('vatRate', numeric(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Vista previa del cálculo */}
        <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Calculator className="h-3.5 w-3.5" />
            Ejemplo sobre {formatMoney(preview.gross, draft)}
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Retención</p>
              <p className="font-semibold text-red-600 dark:text-red-400">
                −{formatMoney(preview.retention, draft)}
              </p>
            </div>
            {draft.vatEnabled && (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">IVA</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  +{formatMoney(preview.vat, draft)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Líquido a recibir</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {formatMoney(preview.net, draft)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Tarifas por defecto ────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">Tarifas por defecto</h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Se proponen al activar la facturación de un cliente nuevo. Cada cliente puede tener las suyas.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Tarifa por hora</Label>
            <Input
              type="number"
              min="0"
              value={draft.defaultHourlyRate}
              onChange={e => update('defaultHourlyRate', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Honorario mensual</Label>
            <Input
              type="number"
              min="0"
              value={draft.defaultMonthlyFee}
              onChange={e => update('defaultMonthlyFee', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Día de pago del mes</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={draft.defaultPaymentDay}
              onChange={e => update('defaultPaymentDay', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Plazo de vencimiento (días)</Label>
            <Input
              type="number"
              min="0"
              max="365"
              value={draft.defaultDueDays}
              onChange={e => update('defaultDueDays', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Reembolso por kilómetro</Label>
            <Input
              type="number"
              min="0"
              value={draft.mileageRate}
              onChange={e => update('mileageRate', numeric(e.target.value))}
            />
          </div>
          <div>
            <Label>Avisar cobros por vencer (días antes)</Label>
            <Input
              type="number"
              min="0"
              max="90"
              value={draft.paymentReminderDays}
              onChange={e => update('paymentReminderDays', numeric(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* ── Moneda y numeración ────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Moneda y numeración</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Moneda (ISO)</Label>
            <Input
              value={draft.currency}
              onChange={e => update('currency', e.target.value.toUpperCase().slice(0, 3))}
              placeholder="CLP"
            />
          </div>
          <div>
            <Label>Formato regional</Label>
            <Input
              value={draft.locale}
              onChange={e => update('locale', e.target.value)}
              placeholder="es-CL"
            />
          </div>
          <div>
            <Label>Prefijo de boleta</Label>
            <Input
              value={draft.invoicePrefix}
              onChange={e => update('invoicePrefix', e.target.value.toUpperCase().slice(0, 8))}
              placeholder="HN"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Ejemplo de monto: <span className="font-medium">{formatMoney(1234567, draft)}</span> · Número
          de boleta: <span className="font-medium">{draft.invoicePrefix}-{new Date().getFullYear()}-000123</span>
        </p>
      </Card>

      {/* ── Categorías de gasto ────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">Categorías de gasto</h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Crea las que uses en tus rendiciones. Las de fábrica no se pueden eliminar porque hay
          gastos anteriores asociados a ellas.
        </p>

        <div className="space-y-2">
          {draft.expenseCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700"
            >
              <div className={`h-4 w-4 flex-shrink-0 rounded-full ${COLOR_SWATCH[category.color]}`} />

              <Input
                value={category.label}
                onChange={e => handleCategoryChange(category.id, { label: e.target.value })}
                className="h-8 flex-1"
              />

              <select
                value={category.color}
                onChange={e =>
                  handleCategoryChange(category.id, { color: e.target.value as ExpenseCategory['color'] })
                }
                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                aria-label={`Color de ${category.label}`}
              >
                {CATEGORY_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>

              {category.builtIn ? (
                <Badge variant="outline" className="flex-shrink-0 text-xs">Fija</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCategory(category.id)}
                  className="h-8 w-8 flex-shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                  aria-label={`Eliminar ${category.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="Nueva categoría (ej: Peajes)"
            className="flex-1"
          />
          <Button onClick={handleAddCategory} variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          La configuración se guarda en tu cuenta y se aplica en todos tus dispositivos. Si la tabla
          <code className="mx-1 rounded bg-blue-100 px-1 dark:bg-blue-900/40">finance_settings</code>
          aún no existe en la base, se guarda solo en este equipo hasta que corras la migración.
        </p>
      </div>

      {/* Barra de acciones fija: el formulario es largo y el botón de guardar
          no debe quedar fuera de vista. */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 lg:pl-72">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300">Cambios sin guardar</span>
              </>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">Todo guardado</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Restaurar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="bg-[#FF8C00] text-white hover:bg-[#e67e00]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
