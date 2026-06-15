import { useState } from 'react';
import { Calendar, Clock, Repeat, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

interface RecurrenceSchedulerProps {
  activityType: 'inspection' | 'talk' | 'epp';
  activityTitle: string;
  onConfirm: (recurrenceData: RecurrenceData) => void;
  onCancel: () => void;
  onSkip: () => void;
}

export interface RecurrenceData {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  intervalValue: number;
  intervalUnit: 'days' | 'weeks' | 'months' | 'years';
  endDate?: string;
  totalOccurrences?: number;
  notes?: string;
}

const PRESET_FREQUENCIES = [
  { id: 'weekly', label: 'Semanal', icon: '📅', value: 7, unit: 'days' as const, description: 'Cada 7 días' },
  { id: 'biweekly', label: 'Quincenal', icon: '📆', value: 15, unit: 'days' as const, description: 'Cada 15 días' },
  { id: 'monthly', label: 'Mensual', icon: '📊', value: 1, unit: 'months' as const, description: 'Cada mes' },
  { id: 'quarterly', label: 'Trimestral', icon: '🗓️', value: 3, unit: 'months' as const, description: 'Cada 3 meses' },
  { id: 'semiannual', label: 'Semestral', icon: '📋', value: 6, unit: 'months' as const, description: 'Cada 6 meses' },
  { id: 'annual', label: 'Anual', icon: '🎯', value: 1, unit: 'years' as const, description: 'Cada año' }
];

const ACTIVITY_LABELS = {
  inspection: {
    title: 'Inspección de Terreno',
    icon: '🔍',
    color: 'blue',
    recommendation: 'Se recomienda realizar inspecciones mensuales o trimestrales según criticidad.'
  },
  talk: {
    title: 'Charla de Seguridad',
    icon: '👥',
    color: 'green',
    recommendation: 'Las charlas de seguridad deben repetirse semanalmente o mensualmente.'
  },
  epp: {
    title: 'Entrega de EPP',
    icon: '🦺',
    color: 'orange',
    recommendation: 'La vida útil del EPP varía según el tipo: cascos (5 años), guantes (3 meses), etc.'
  }
};

export function RecurrenceScheduler({ 
  activityType, 
  activityTitle, 
  onConfirm, 
  onCancel,
  onSkip 
}: RecurrenceSchedulerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<number>(30);
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [totalOccurrences, setTotalOccurrences] = useState<number>(12);
  const [notes, setNotes] = useState<string>('');

  const activityConfig = ACTIVITY_LABELS[activityType];

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleConfirm = () => {
    let recurrenceData: RecurrenceData;

    if (selectedPreset) {
      const preset = PRESET_FREQUENCIES.find(p => p.id === selectedPreset);
      if (preset) {
        recurrenceData = {
          enabled: true,
          frequency: 'custom',
          intervalValue: preset.value,
          intervalUnit: preset.unit,
          totalOccurrences,
          notes
        };
      } else {
        return;
      }
    } else {
      recurrenceData = {
        enabled: true,
        frequency: 'custom',
        intervalValue: customValue,
        intervalUnit: customUnit,
        totalOccurrences,
        notes
      };
    }

    onConfirm(recurrenceData);
  };

  const handleSkip = () => {
    onSkip();
  };

  // Calcular próximas fechas
  const calculateNextDates = () => {
    const dates: Date[] = [];
    const now = new Date();
    
    let intervalValue = customValue;
    let intervalUnit = customUnit;
    
    if (selectedPreset) {
      const preset = PRESET_FREQUENCIES.find(p => p.id === selectedPreset);
      if (preset) {
        intervalValue = preset.value;
        intervalUnit = preset.unit;
      }
    }

    for (let i = 1; i <= Math.min(totalOccurrences, 5); i++) {
      const nextDate = new Date(now);
      
      switch (intervalUnit) {
        case 'days':
          nextDate.setDate(now.getDate() + (intervalValue * i));
          break;
        case 'weeks':
          nextDate.setDate(now.getDate() + (intervalValue * 7 * i));
          break;
        case 'months':
          nextDate.setMonth(now.getMonth() + (intervalValue * i));
          break;
        case 'years':
          nextDate.setFullYear(now.getFullYear() + (intervalValue * i));
          break;
      }
      
      dates.push(nextDate);
    }
    
    return dates;
  };

  const nextDates = calculateNextDates();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {activityConfig.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Programar Repetición Automática
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {activityConfig.title}: {activityTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recomendación */}
          <Card className={`p-4 mb-6 bg-${activityConfig.color}-50 dark:bg-${activityConfig.color}-950/20 border-${activityConfig.color}-200 dark:border-${activityConfig.color}-800`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 text-${activityConfig.color}-600 flex-shrink-0 mt-0.5`} />
              <div className="text-sm text-slate-700 dark:text-zinc-300">
                <strong className="block mb-1">💡 Recomendación:</strong>
                {activityConfig.recommendation}
              </div>
            </div>
          </Card>

          {/* Frecuencias Preestablecidas */}
          <div className="mb-6">
            <Label className="text-slate-900 dark:text-white mb-3 block">
              Frecuencias Recomendadas
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_FREQUENCIES.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPreset === preset.id
                      ? `border-${activityConfig.color}-500 bg-${activityConfig.color}-50 dark:bg-${activityConfig.color}-950/20`
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{preset.icon}</div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {preset.label}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-zinc-400">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Personalizado */}
          <div className="mb-6">
            <Label className="text-slate-900 dark:text-white mb-3 block">
              o Personalizar Intervalo
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(parseInt(e.target.value) || 1);
                    setSelectedPreset(null);
                  }}
                  placeholder="Valor"
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <select
                value={customUnit}
                onChange={(e) => {
                  setCustomUnit(e.target.value as any);
                  setSelectedPreset(null);
                }}
                className="flex-1 h-10 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-slate-900 dark:text-white"
              >
                <option value="days">Días</option>
                <option value="weeks">Semanas</option>
                <option value="months">Meses</option>
                <option value="years">Años</option>
              </select>
            </div>
          </div>

          {/* Número de repeticiones */}
          <div className="mb-6">
            <Label className="text-slate-900 dark:text-white mb-3 block">
              Número de Repeticiones
            </Label>
            <Input
              type="number"
              min="1"
              max="52"
              value={totalOccurrences}
              onChange={(e) => setTotalOccurrences(parseInt(e.target.value) || 12)}
              placeholder="Ej: 12 veces"
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
            />
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Se crearán {totalOccurrences} tareas automáticamente en el calendario
            </p>
          </div>

          {/* Notas opcionales */}
          <div className="mb-6">
            <Label className="text-slate-900 dark:text-white mb-3 block">
              Notas (Opcional)
            </Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Revisar antes del invierno, Incluir área de bodega..."
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
            />
          </div>

          {/* Vista previa de fechas */}
          <Card className="p-4 mb-6 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <Label className="text-slate-900 dark:text-white text-sm">
                Próximas {Math.min(totalOccurrences, 5)} fechas programadas:
              </Label>
            </div>
            <div className="space-y-2">
              {nextDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-white dark:bg-zinc-900">
                    {index + 1}
                  </Badge>
                  <span className="text-slate-700 dark:text-zinc-300">
                    {date.toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
              {totalOccurrences > 5 && (
                <div className="text-xs text-slate-500 dark:text-zinc-400 italic">
                  ... y {totalOccurrences - 5} fechas más
                </div>
              )}
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar y Programar {totalOccurrences} Tareas
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full h-12"
            >
              <Clock className="w-5 h-5 mr-2" />
              Por Ahora No, Continuar Sin Programar
            </Button>

            <button
              onClick={onCancel}
              className="text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Info adicional */}
          <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Repeat className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-zinc-300">
                <strong className="block mb-1">🤖 Auto-Alimentación de Agenda</strong>
                Al confirmar, se crearán automáticamente todas las tareas en tu calendario inteligente 
                y aparecerán en tu plan de trabajo mensual. ¡No tendrás que recordar nada!
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
