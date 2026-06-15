import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface ScheduleNextInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string, notes: string) => void;
  inspectionType: string;
  lastInspectionDate: string;
}

export function ScheduleNextInspectionModal({
  isOpen,
  onClose,
  onSchedule,
  inspectionType,
  lastInspectionDate
}: ScheduleNextInspectionModalProps) {
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState<'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'personalizado'>('mensual');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Calcular próxima fecha según frecuencia
  const calculateNextDate = (freq: string) => {
    const last = new Date(lastInspectionDate);
    let next = new Date(last);

    switch (freq) {
      case 'semanal':
        next.setDate(next.getDate() + 7);
        break;
      case 'quincenal':
        next.setDate(next.getDate() + 15);
        break;
      case 'mensual':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'trimestral':
        next.setMonth(next.getMonth() + 3);
        break;
    }

    return next.toISOString().split('T')[0];
  };

  const handleFrequencyChange = (freq: typeof frequency) => {
    setFrequency(freq);
    if (autoCalculate && freq !== 'personalizado') {
      setNextDate(calculateNextDate(freq));
    }
  };

  const handleSchedule = () => {
    if (!nextDate) {
      toast.error('Fecha requerida', {
        description: 'Debes seleccionar la fecha de la próxima inspección'
      });
      return;
    }

    const next = new Date(nextDate);
    const today = new Date();
    
    if (next <= today) {
      toast.error('Fecha inválida', {
        description: 'La fecha de la próxima inspección debe ser futura'
      });
      return;
    }

    onSchedule(nextDate, nextTime, notes);
    
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    toast.success('✅ Próxima Inspección Agendada', {
      description: `${inspectionType} programada para el ${new Date(nextDate).toLocaleDateString('es-CL')} (en ${daysUntil} días)`
    });

    toast.info('🔔 Recordatorio Configurado', {
      description: 'Recibirás una notificación 7 días antes de la fecha'
    });

    onClose();
  };

  if (!isOpen) return null;

  const daysUntilNext = nextDate 
    ? Math.ceil((new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-200 dark:border-green-900 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                  📅 Programar Próxima Inspección
                </h2>
                <p className="text-sm text-green-800 dark:text-green-300">
                  {inspectionType}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-green-600 dark:text-green-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Inspección completada */}
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Inspección Completada Exitosamente
                </h3>
                <div className="space-y-1 text-sm text-green-800 dark:text-green-300">
                  <p><strong>Tipo:</strong> {inspectionType}</p>
                  <p><strong>Fecha realizada:</strong> {new Date(lastInspectionDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Frecuencia de inspección */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Frecuencia de Inspección *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'semanal', label: 'Semanal', days: 7 },
                { value: 'quincenal', label: 'Quincenal', days: 15 },
                { value: 'mensual', label: 'Mensual', days: 30 },
                { value: 'trimestral', label: 'Trimestral', days: 90 },
                { value: 'personalizado', label: 'Personalizado', days: null }
              ].map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => handleFrequencyChange(freq.value as any)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    frequency === freq.value
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white hover:border-green-400'
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

          {/* Fecha y hora de la próxima inspección */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Fecha de la Próxima Inspección *
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="auto-calculate-inspection"
                checked={autoCalculate}
                onChange={(e) => {
                  setAutoCalculate(e.target.checked);
                  if (e.target.checked && frequency !== 'personalizado') {
                    setNextDate(calculateNextDate(frequency));
                  }
                }}
                className="w-4 h-4 text-green-600 rounded"
              />
              <label htmlFor="auto-calculate-inspection" className="text-sm text-slate-600 dark:text-zinc-400">
                Calcular automáticamente según frecuencia
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block text-slate-600 dark:text-zinc-400">
                  Fecha
                </Label>
                <Input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base font-semibold"
                  disabled={autoCalculate && frequency !== 'personalizado'}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block text-slate-600 dark:text-zinc-400">
                  Hora
                </Label>
                <Input
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                  className="text-base"
                />
              </div>
            </div>
            {nextDate && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-900 dark:text-blue-100">
                    <strong>Faltan {daysUntilNext} días</strong> para la próxima inspección
                  </span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Recibirás una alerta automática el {new Date(new Date(nextDate).setDate(new Date(nextDate).getDate() - 7)).toLocaleDateString('es-CL')}
                </div>
              </div>
            )}
          </div>

          {/* Notas adicionales */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Notas / Observaciones (Opcional)
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Revisar especialmente extintores del sector B, verificar fecha de vencimiento de arneses..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
            />
          </div>

          {/* Información normativa */}
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  📋 Frecuencias Normativas en Chile:
                </h3>
                <ul className="text-xs text-orange-800 dark:text-orange-300 space-y-1">
                  <li>• <strong>Inspecciones Generales:</strong> Mensual (D.S. 594)</li>
                  <li>• <strong>Extintores:</strong> Inspección mensual + Mantención anual</li>
                  <li>• <strong>Equipos de Altura:</strong> Antes de cada uso + Trimestral</li>
                  <li>• <strong>Instalaciones Eléctricas:</strong> Anual por personal autorizado</li>
                  <li>• <strong>Maquinaria:</strong> Según fabricante + Revisión semestral</li>
                </ul>
              </div>
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
              Saltar por ahora
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!nextDate}
            >
              <Save className="w-4 h-4 mr-2" />
              Agendar en Calendario
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
