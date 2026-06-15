import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, AlertCircle, Edit2, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';

interface QuickScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertData: {
    type: 'maintenance' | 'training' | 'inspection';
    itemName: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  };
  onScheduleConfirm: (scheduledDate: string, scheduledTime: string, notes: string) => void;
}

export function QuickScheduleModal({ isOpen, onClose, alertData, onScheduleConfirm }: QuickScheduleModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');

  // Calcular el día más próximo (siguiente día hábil)
  useEffect(() => {
    if (isOpen) {
      const nextWorkingDay = getNextWorkingDay();
      setSuggestedDate(nextWorkingDay);
      setSelectedDate(nextWorkingDay);
      
      // Establecer hora sugerida según tipo de actividad
      const suggestedTime = alertData.type === 'training' ? '10:00' : '09:00';
      setSelectedTime(suggestedTime);
      
      // Generar nota automática
      const autoNote = `${getActivityLabel(alertData.type)} programada automáticamente desde alerta de vencimiento`;
      setNotes(autoNote);
    }
  }, [isOpen, alertData]);

  const getNextWorkingDay = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Si mañana es sábado (6) o domingo (0), mover al lunes
    const dayOfWeek = tomorrow.getDay();
    if (dayOfWeek === 6) { // Sábado
      tomorrow.setDate(tomorrow.getDate() + 2);
    } else if (dayOfWeek === 0) { // Domingo
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    return tomorrow.toISOString().split('T')[0];
  };

  const getActivityLabel = (type: string): string => {
    switch (type) {
      case 'maintenance': return 'Mantención';
      case 'training': return 'Capacitación';
      case 'inspection': return 'Inspección';
      default: return 'Actividad';
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'maintenance': return '🔧';
      case 'training': return '📚';
      case 'inspection': return '🔍';
      default: return '📋';
    }
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      toast.error('Fecha Requerida', {
        description: 'Debes seleccionar una fecha para agendar'
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    
    if (selected < today) {
      toast.error('Fecha Inválida', {
        description: 'No puedes agendar en una fecha pasada'
      });
      return;
    }

    onScheduleConfirm(selectedDate, selectedTime, notes);
    
    const formattedDate = new Date(selectedDate).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    toast.success('✅ Actividad Agendada Exitosamente', {
      description: `${getActivityLabel(alertData.type)} programada para ${formattedDate} a las ${selectedTime}`,
      duration: 5000
    });

    // Resetear y cerrar
    setIsEditMode(false);
    onClose();
  };

  const getDaysUntilScheduled = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(selectedDate);
    const diffTime = scheduled.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isOpen) return null;

  const daysUntil = getDaysUntilScheduled();
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-b border-orange-200 dark:border-orange-900 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                  📅 Agendar Actividad Vencida
                </h2>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Sistema de agendamiento inteligente
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
          {/* Información de la actividad vencida */}
          <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ Actividad Vencida
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-red-800 dark:text-red-300">
                      <strong>Tipo:</strong> {getActivityIcon(alertData.type)} {getActivityLabel(alertData.type)}
                    </span>
                    <Badge className={`${getPriorityColor(alertData.priority)} text-white border-0 text-xs`}>
                      Prioridad {alertData.priority === 'high' ? 'Alta' : alertData.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <p className="text-red-800 dark:text-red-300">
                    <strong>Actividad:</strong> {alertData.itemName}
                  </p>
                  <p className="text-red-800 dark:text-red-300">
                    <strong>Fecha de vencimiento:</strong> {new Date(alertData.dueDate).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Fecha y hora sugerida automáticamente */}
          {!isEditMode ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  🤖 Fecha Sugerida Automáticamente
                </h3>
                <Button
                  onClick={() => setIsEditMode(true)}
                  variant="outline"
                  size="sm"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modificar
                </Button>
              </div>

              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-600 text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      {isTomorrow ? '📅 Mañana' : isToday ? '🚨 Hoy' : `📅 ${new Date(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Hora sugerida: {selectedTime} hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        <span>Próximo día hábil disponible</span>
                      </div>
                      {daysUntil > 1 && (
                        <div className="text-xs mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                          En {daysUntil} días • Sistema seleccionó automáticamente el siguiente día hábil
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                El sistema eligió automáticamente el próximo día hábil. Puedes modificarlo si lo necesitas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  ✏️ Modificar Fecha y Hora
                </h3>
                <Button
                  onClick={() => {
                    setSelectedDate(suggestedDate);
                    setSelectedTime(alertData.type === 'training' ? '10:00' : '09:00');
                    setIsEditMode(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-zinc-400"
                >
                  Restaurar Sugerida
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Fecha *
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Hora *
                </Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                  <Calendar className="w-4 h-4" />
                  <span>
                    <strong>Nueva fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-CL')} a las {selectedTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notas adicionales */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Notas / Observaciones (Opcional)
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Coordinar con supervisor, verificar disponibilidad de materiales..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
            />
          </div>

          {/* Resumen de agendamiento */}
          <Card className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
              📋 Resumen del Agendamiento:
            </h4>
            <div className="space-y-1 text-sm text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Se creará un evento en el Calendario</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Recibirás notificación el día del evento</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>La alerta se marcará como "En Proceso"</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Podrás reprogramar si es necesario desde el Calendario</span>
              </div>
            </div>
          </Card>

          {/* Alerta de normativa */}
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-800 dark:text-orange-300">
                <strong>⚠️ Normativa Chilena:</strong> Las mantenciones y capacitaciones tienen plazos legales (D.S. 594, D.S. 40). 
                Asegúrate de cumplir con las fechas comprometidas para evitar multas de fiscalización.
              </div>
            </div>
          </div>
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
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!selectedDate}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar y Agendar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
