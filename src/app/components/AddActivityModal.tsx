import { useState } from 'react';
import { Calendar, Clock, FileText, Users, Package, Wrench, Shield, X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: CalendarActivity) => void;
  prefilledData?: {
    type?: ActivityType;
    title?: string;
    date?: string;
    description?: string;
  };
}

export type ActivityType = 
  | 'inspection'
  | 'training'
  | 'induction'
  | 'maintenance'
  | 'delivery'
  | 'meeting'
  | 'audit'
  | 'other';

export interface CalendarActivity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  participants?: string[];
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  reminder?: boolean;
  reminderDays?: number;
}

const activityTypes = [
  { 
    value: 'inspection' as ActivityType, 
    label: 'Inspección de Seguridad',
    icon: Shield,
    color: 'bg-blue-500'
  },
  { 
    value: 'training' as ActivityType, 
    label: 'Capacitación',
    icon: Users,
    color: 'bg-purple-500'
  },
  { 
    value: 'induction' as ActivityType, 
    label: 'Inducción ODI',
    icon: FileText,
    color: 'bg-green-500'
  },
  { 
    value: 'maintenance' as ActivityType, 
    label: 'Mantención de Equipos',
    icon: Wrench,
    color: 'bg-orange-500'
  },
  { 
    value: 'delivery' as ActivityType, 
    label: 'Entrega de EPP',
    icon: Package,
    color: 'bg-cyan-500'
  },
  { 
    value: 'meeting' as ActivityType, 
    label: 'Reunión CPHS',
    icon: Users,
    color: 'bg-indigo-500'
  },
  { 
    value: 'audit' as ActivityType, 
    label: 'Auditoría',
    icon: FileText,
    color: 'bg-red-500'
  },
  { 
    value: 'other' as ActivityType, 
    label: 'Otra Actividad',
    icon: Clock,
    color: 'bg-gray-500'
  }
];

const priorityLevels = [
  { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
];

export function AddActivityModal({ isOpen, onClose, onSave, prefilledData }: AddActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType>(prefilledData?.type || 'inspection');
  const [title, setTitle] = useState(prefilledData?.title || '');
  const [date, setDate] = useState(prefilledData?.date || '');
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState(prefilledData?.description || '');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Título requerido', {
        description: 'Debes ingresar un título para la actividad'
      });
      return;
    }

    if (!date) {
      toast.error('Fecha requerida', {
        description: 'Debes seleccionar una fecha para la actividad'
      });
      return;
    }

    const activity: CalendarActivity = {
      id: `activity-${Date.now()}`,
      type: activityType,
      title: title.trim(),
      date,
      time,
      description: description.trim(),
      location: location.trim(),
      participants: [],
      status: 'pending',
      priority,
      reminder,
      reminderDays: reminder ? reminderDays : undefined
    };

    onSave(activity);

    // Calcular días hasta la actividad
    const activityDate = new Date(date);
    const today = new Date();
    const daysUntil = Math.ceil((activityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    toast.success('✅ Actividad Agendada Exitosamente', {
      description: `${title} - ${new Date(date).toLocaleDateString('es-CL')} (en ${daysUntil} días)`
    });

    if (reminder) {
      toast.info('🔔 Recordatorio Configurado', {
        description: `Recibirás una notificación ${reminderDays} días antes`
      });
    }

    // Reset form
    setTitle('');
    setDate('');
    setTime('09:00');
    setDescription('');
    setLocation('');
    setPriority('medium');
    setReminder(true);
    setReminderDays(7);

    onClose();
  };

  const selectedActivityType = activityTypes.find(t => t.value === activityType);
  const Icon = selectedActivityType?.icon || Clock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b border-orange-200 dark:border-orange-900 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                  📅 Agregar Actividad al Calendario
                </h2>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Programa inspecciones, capacitaciones, mantenciones y más
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-orange-600 dark:text-orange-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo de Actividad */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Tipo de Actividad *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activityTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setActivityType(type.value)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                      activityType === type.value
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md scale-105'
                        : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white hover:border-orange-400'
                    }`}
                  >
                    <TypeIcon className={`w-5 h-5 mx-auto mb-1 ${
                      activityType === type.value ? 'text-white' : ''
                    }`} />
                    <div className="text-xs">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Título de la Actividad *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Inspección mensual de extintores - Bodega A"
              className="text-base"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Fecha *
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="text-base"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Hora
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Descripción
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales sobre la actividad..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
            />
          </div>

          {/* Ubicación */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Ubicación / Lugar
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Planta Principal, Piso 2, Sector B"
              className="text-base"
            />
          </div>

          {/* Prioridad */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Prioridad
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {priorityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setPriority(level.value as any)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    priority === level.value
                      ? 'ring-2 ring-orange-500 border-orange-500 scale-105'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-orange-400'
                  }`}
                >
                  <Badge className={`${level.color} border-0 w-full justify-center`}>
                    {level.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Recordatorio */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="reminder"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <Label htmlFor="reminder" className="text-base font-semibold">
                Activar Recordatorio
              </Label>
            </div>
            {reminder && (
              <div className="ml-6">
                <Label className="text-sm mb-2 block text-slate-600 dark:text-zinc-400">
                  Días de anticipación
                </Label>
                <div className="flex gap-2">
                  {[1, 3, 7, 15, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setReminderDays(days)}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                        reminderDays === days
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white hover:border-orange-400'
                      }`}
                    >
                      {days} {days === 1 ? 'día' : 'días'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información Normativa */}
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  📋 Frecuencias Normativas Recomendadas (Chile):
                </h3>
                <ul className="text-xs text-orange-800 dark:text-orange-300 space-y-1">
                  <li>• <strong>Inspecciones de Seguridad:</strong> Mensual (D.S. 594)</li>
                  <li>• <strong>Capacitaciones:</strong> Mínimo anual según riesgo</li>
                  <li>• <strong>Inducción ODI:</strong> Al ingreso + Re-inducción anual</li>
                  <li>• <strong>Mantención Extintores:</strong> Mensual + Anual certificada</li>
                  <li>• <strong>Reunión CPHS:</strong> Mensual obligatoria</li>
                  <li>• <strong>Auditorías Internas:</strong> Semestral recomendado</li>
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
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!title.trim() || !date}
            >
              <Save className="w-4 h-4 mr-2" />
              Agendar Actividad
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
