import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, X, Save, Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface NextDueDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: 'maintenance' | 'training';
  activityName: string;
  assetName?: string;
  workerName?: string;
  lastDate: string;
  onSave: (nextDueDate: string, frequency: string, notes: string) => void;
}

export function NextDueDateModal({
  isOpen,
  onClose,
  activityType,
  activityName,
  assetName,
  workerName,
  lastDate,
  onSave
}: NextDueDateModalProps) {
  const [nextDueDate, setNextDueDate] = useState('');
  const [frequency, setFrequency] = useState<'mensual' | 'trimestral' | 'semestral' | 'anual' | 'personalizado'>('mensual');
  const [notes, setNotes] = useState('');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Calcular próxima fecha automáticamente según frecuencia
  const calculateNextDate = (freq: string) => {
    const last = new Date(lastDate);
    let next = new Date(last);

    switch (freq) {
      case 'mensual':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'trimestral':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'semestral':
        next.setMonth(next.getMonth() + 6);
        break;
      case 'anual':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next.toISOString().split('T')[0];
  };

  const handleFrequencyChange = (freq: typeof frequency) => {
    setFrequency(freq);
    if (autoCalculate && freq !== 'personalizado') {
      setNextDueDate(calculateNextDate(freq));
    }
  };

  const handleSave = () => {
    if (!nextDueDate) {
      toast.error('Fecha requerida', {
        description: 'Debes ingresar la fecha del próximo vencimiento'
      });
      return;
    }

    const next = new Date(nextDueDate);
    const today = new Date();
    
    if (next <= today) {
      toast.error('Fecha inválida', {
        description: 'La fecha del próximo vencimiento debe ser futura'
      });
      return;
    }

    onSave(nextDueDate, frequency, notes);
    
    toast.success('✅ Próximo Vencimiento Registrado', {
      description: `Se creó una alerta automática para el ${new Date(nextDueDate).toLocaleDateString('es-CL')}`
    });

    onClose();
  };

  if (!isOpen) return null;

  const title = activityType === 'maintenance' 
    ? `Próxima Mantención: ${assetName}`
    : `Próxima Capacitación: ${workerName}`;

  const daysUntilNext = nextDueDate 
    ? Math.ceil((new Date(nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b border-purple-200 dark:border-purple-900 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  📅 Programar Próximo Vencimiento
                </h2>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  {title}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-purple-600 dark:text-purple-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info de la actividad completada */}
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Actividad Completada Exitosamente
                </h3>
                <div className="space-y-1 text-sm text-green-800 dark:text-green-300">
                  <p><strong>Actividad:</strong> {activityName}</p>
                  <p><strong>Fecha realizada:</strong> {new Date(lastDate).toLocaleDateString('es-CL')}</p>
                  {assetName && <p><strong>Activo:</strong> {assetName}</p>}
                  {workerName && <p><strong>Trabajador:</strong> {workerName}</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Alerta de importancia */}
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  🔔 Sistema de Alertas Automáticas
                </h3>
                <p className="text-orange-800 dark:text-orange-300">
                  El sistema generará una <strong>alerta automática</strong> cuando se acerque la fecha de vencimiento. 
                  Recibirás notificaciones con 7 días de anticipación.
                </p>
              </div>
            </div>
          </Card>

          {/* Frecuencia */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Frecuencia de la Actividad *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'mensual', label: 'Mensual', days: 30 },
                { value: 'trimestral', label: 'Trimestral', days: 90 },
                { value: 'semestral', label: 'Semestral', days: 180 },
                { value: 'anual', label: 'Anual', days: 365 },
                { value: 'personalizado', label: 'Personalizado', days: null }
              ].map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => handleFrequencyChange(freq.value as any)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    frequency === freq.value
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white hover:border-purple-400'
                  }`}
                >
                  <div className="font-semibold">{freq.label}</div>
                  {freq.days && (
                    <div className="text-xs opacity-75">cada {freq.days} días</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha del próximo vencimiento */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Fecha del Próximo Vencimiento *
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="auto-calculate"
                checked={autoCalculate}
                onChange={(e) => {
                  setAutoCalculate(e.target.checked);
                  if (e.target.checked && frequency !== 'personalizado') {
                    setNextDueDate(calculateNextDate(frequency));
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="auto-calculate" className="text-sm text-slate-600 dark:text-zinc-400">
                Calcular automáticamente según frecuencia
              </label>
            </div>
            <Input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="text-lg font-semibold"
              disabled={autoCalculate && frequency !== 'personalizado'}
            />
            {nextDueDate && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-900 dark:text-blue-100">
                    <strong>Faltan {daysUntilNext} días</strong> para el próximo vencimiento
                  </span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Recibirás una alerta automática el {new Date(new Date(nextDueDate).setDate(new Date(nextDueDate).getDate() - 7)).toLocaleDateString('es-CL')}
                </div>
              </div>
            )}
          </div>

          {/* Notas adicionales */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Notas Adicionales (Opcional)
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Verificar proveedor certificado, coordinar con supervisor, etc."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            />
          </div>

          {/* Resumen normativo */}
          <Card className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
              📋 Frecuencias Normativas de Referencia (Chile):
            </h4>
            <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
              {activityType === 'maintenance' ? (
                <>
                  <p>• Extintores: Inspección mensual + Mantención anual</p>
                  <p>• Andamios: Inspección antes de cada uso + Revisión trimestral</p>
                  <p>• Arneses/EPP: Inspección pre-uso + Certificación semestral</p>
                  <p>• Escaleras: Inspección mensual</p>
                  <p>• Botiquín: Revisión de stock mensual</p>
                </>
              ) : (
                <>
                  <p>• Trabajo en Altura: Capacitación anual</p>
                  <p>• Inducción ODI: Al ingreso + Re-inducción anual</p>
                  <p>• Espacios Confinados: Capacitación anual</p>
                  <p>• Uso de EPP: Capacitación al ingreso + Refuerzo anual</p>
                  <p>• Primeros Auxilios: Certificación cada 2 años</p>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Footer con acciones */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-6">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!nextDueDate}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar y Crear Alerta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
