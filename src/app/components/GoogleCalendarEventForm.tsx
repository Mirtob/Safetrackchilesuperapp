import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Bell,
  FileText,
  Building2,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface GoogleCalendarEventFormProps {
  selectedDate: string;
  onClose: () => void;
  onSubmit: (eventData: EventFormData) => void;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  isRemote: boolean;
  addGoogleMeet: boolean;
  attendees: string[];
  reminderMinutes: number;
  eventType: 'inspection' | 'meeting' | 'training' | 'legal' | 'other';
  needsRoom: boolean;
  roomNotes: string;
}

const EVENT_TYPES = [
  { id: 'inspection', label: 'Inspección', icon: '🔍', color: 'blue' },
  { id: 'meeting', label: 'Reunión', icon: '👥', color: 'purple' },
  { id: 'training', label: 'Capacitación', icon: '📚', color: 'green' },
  { id: 'legal', label: 'Cumplimiento Legal', icon: '⚖️', color: 'red' },
  { id: 'other', label: 'Otro', icon: '📋', color: 'gray' }
] as const;

const REMINDER_OPTIONS = [
  { value: 0, label: 'Al momento del evento' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 día antes' },
  { value: 2880, label: '2 días antes' }
];

export function GoogleCalendarEventForm({ selectedDate, onClose, onSubmit }: GoogleCalendarEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: selectedDate,
    startTime: '09:00',
    endDate: selectedDate,
    endTime: '10:00',
    location: '',
    isRemote: false,
    addGoogleMeet: false,
    attendees: [],
    reminderMinutes: 30,
    eventType: 'meeting',
    needsRoom: false,
    roomNotes: ''
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [showAttendeeInput, setShowAttendeeInput] = useState(false);

  const handleAddAttendee = () => {
    const email = newAttendee.trim();
    
    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido', { description: 'Ingresa un email válido' });
      return;
    }

    if (formData.attendees.includes(email)) {
      toast.error('Email duplicado', { description: 'Este participante ya fue agregado' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, email]
    }));
    setNewAttendee('');
    toast.success(`✅ ${email} agregado`);
  };

  const handleRemoveAttendee = (email: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(e => e !== email)
    }));
  };

  const handleToggleRemote = (isRemote: boolean) => {
    setFormData(prev => ({
      ...prev,
      isRemote,
      addGoogleMeet: isRemote ? prev.addGoogleMeet : false,
      location: isRemote ? 'Remoto (Google Meet)' : '',
      needsRoom: isRemote ? false : prev.needsRoom
    }));
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.title.trim()) {
      toast.error('Título requerido', { description: 'Ingresa un título para el evento' });
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Horario requerido', { description: 'Define hora de inicio y término' });
      return;
    }

    // Validar que la hora de término sea posterior al inicio
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast.error('Horario inválido', { description: 'La hora de término debe ser posterior al inicio' });
      return;
    }

    if (!formData.isRemote && !formData.location.trim()) {
      toast.error('Ubicación requerida', { description: 'Ingresa la ubicación del evento presencial' });
      return;
    }

    onSubmit(formData);
  };

  const selectedEventType = EVENT_TYPES.find(t => t.id === formData.eventType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nueva Actividad
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {new Date(selectedDate).toLocaleDateString('es-CL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tipo de Evento */}
          <div>
            <Label className="text-slate-900 dark:text-white mb-3 block">
              Tipo de Actividad *
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, eventType: type.id as any }))}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.eventType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <Label className="text-slate-900 dark:text-white mb-2 block">
              Título del Evento *
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Comité Paritario - Constructora Los Andes"
              className="h-12"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label className="text-slate-900 dark:text-white mb-2 block">
              Descripción (Opcional)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Agenda, temas a tratar, documentos necesarios, etc."
              className="min-h-[100px]"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-900 dark:text-white mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Fecha y Hora de Inicio *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-12"
                />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-900 dark:text-white mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Fecha y Hora de Término *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="h-12"
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Modalidad: Remoto vs Presencial */}
          <div>
            <Label className="text-slate-900 dark:text-white mb-3 block">
              Modalidad *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleToggleRemote(false)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  !formData.isRemote
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-slate-200 dark:border-zinc-700 hover:border-green-300'
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="font-medium text-slate-900 dark:text-white">Presencial</div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  En instalaciones de la empresa
                </div>
              </button>

              <button
                onClick={() => handleToggleRemote(true)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.isRemote
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-zinc-700 hover:border-blue-300'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="font-medium text-slate-900 dark:text-white">Remoto</div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Videoconferencia online
                </div>
              </button>
            </div>
          </div>

          {/* Ubicación / Google Meet */}
          {formData.isRemote ? (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-900 dark:text-white">
                      Agregar Google Meet
                    </Label>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, addGoogleMeet: !prev.addGoogleMeet }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        formData.addGoogleMeet
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {formData.addGoogleMeet ? 'Activado' : 'Desactivado'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-400">
                    {formData.addGoogleMeet
                      ? '✅ Se generará un enlace de Google Meet automáticamente'
                      : 'Puedes agregar un enlace de videoconferencia manualmente después'}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div>
              <Label className="text-slate-900 dark:text-white mb-2 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación *
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ej: Sucursal Maipú - Sala de Reuniones Piso 2"
                className="h-12"
              />

              {/* Recordatorio para solicitar sala */}
              <div className="mt-3">
                <label className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsRoom}
                    onChange={(e) => setFormData(prev => ({ ...prev, needsRoom: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Necesito reservar sala de reuniones
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Te recordaremos coordinar con la empresa la reserva de sala
                    </p>
                  </div>
                </label>

                {formData.needsRoom && (
                  <Textarea
                    value={formData.roomNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomNotes: e.target.value }))}
                    placeholder="Notas: cantidad de personas, equipamiento necesario (proyector, pizarra, etc.)"
                    className="mt-3 min-h-[60px]"
                  />
                )}
              </div>
            </div>
          )}

          {/* Participantes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-slate-900 dark:text-white">
                <Users className="w-4 h-4 inline mr-1" />
                Participantes (Opcional)
              </Label>
              <Button
                onClick={() => setShowAttendeeInput(!showAttendeeInput)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            {showAttendeeInput && (
              <div className="flex gap-2 mb-3">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAttendee();
                    }
                  }}
                  placeholder="email@ejemplo.cl"
                  type="email"
                  className="flex-1"
                />
                <Button onClick={handleAddAttendee}>
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            )}

            {formData.attendees.length > 0 && (
              <div className="space-y-2">
                {formData.attendees.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 dark:text-white">{email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttendee(email)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.attendees.length === 0 && !showAttendeeInput && (
              <p className="text-sm text-slate-500 dark:text-zinc-500 italic">
                No hay participantes agregados
              </p>
            )}
          </div>

          {/* Recordatorio */}
          <div>
            <Label className="text-slate-900 dark:text-white mb-2 block">
              <Bell className="w-4 h-4 inline mr-1" />
              Recordatorio
            </Label>
            <select
              value={formData.reminderMinutes}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderMinutes: Number(e.target.value) }))}
              className="w-full h-12 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
            >
              {REMINDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen de acciones */}
          <Card className="p-4 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Este evento se agregará a:
                </h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Google Calendar personal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    SafeTrack Chile (calendario integrado)
                  </li>
                  {formData.addGoogleMeet && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Enlace Google Meet generado automáticamente
                    </li>
                  )}
                  {formData.attendees.length > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Invitación enviada a {formData.attendees.length} participante(s)
                    </li>
                  )}
                  {formData.needsRoom && (
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Recordatorio: coordinar reserva de sala con la empresa
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-slate-200 dark:border-zinc-800 flex gap-3 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        </div>
      </div>
    </div>
  );
}
