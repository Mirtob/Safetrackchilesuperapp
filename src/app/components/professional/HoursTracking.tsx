import { useState } from 'react';
import { Clock, MapPin, Calendar, TrendingUp, Play, Square, DollarSign, Plus, Edit2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { AddHoursModal } from '@/app/components/professional/AddHoursModal';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientCompany {
  id: string;
  name: string;
  hourlyRate: number;
  monthlyFee?: number;
  brandColor: string;
}

interface TimeEntry {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // En horas
  location: string;
  activity: string;
  amount: number; // Monto calculado
  hourlyRate?: number; // Tarifa aplicada
  status: 'in-progress' | 'completed';
  gpsVerified: boolean;
}

interface HoursTrackingProps {
  clients: ClientCompany[];
}

export function HoursTracking({ clients }: HoursTrackingProps) {
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: 'TIME-001',
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      date: '2026-01-27',
      startTime: '08:30',
      endTime: '13:30',
      duration: 5,
      location: 'Obra Nueva Las Condes',
      activity: 'Inspección de seguridad en obra',
      amount: 175000,
      status: 'completed',
      gpsVerified: true
    },
    {
      id: 'TIME-002',
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      date: '2026-01-26',
      startTime: '09:00',
      endTime: '12:00',
      duration: 3,
      location: 'Obra Nueva Las Condes',
      activity: 'Capacitación EPP',
      amount: 105000,
      status: 'completed',
      gpsVerified: true
    },
    {
      id: 'TIME-003',
      clientId: 'food-1',
      clientName: 'Alimentos del Sur SpA',
      date: '2026-01-25',
      startTime: '14:00',
      endTime: '18:00',
      duration: 4,
      location: 'Planta Puerto Montt',
      activity: 'Auditoría de procesos',
      amount: 120000,
      status: 'completed',
      gpsVerified: true
    },
    {
      id: 'TIME-004',
      clientId: 'minera-1',
      clientName: 'Minera Los Andes S.A.',
      date: '2026-01-27',
      startTime: '09:00',
      endTime: undefined,
      duration: 0,
      location: 'Faena Calama',
      activity: 'Visita en progreso',
      amount: 0,
      status: 'in-progress',
      gpsVerified: true
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calcular métricas
  const completedEntries = timeEntries.filter(e => e.status === 'completed');
  const totalHoursThisMonth = completedEntries.reduce((sum, e) => sum + e.duration, 0);
  const totalAmountThisMonth = completedEntries.reduce((sum, e) => sum + e.amount, 0);
  const avgHourlyRate = totalAmountThisMonth / totalHoursThisMonth || 0;

  // Agrupar por cliente
  const hoursByClient = clients.map(client => {
    const clientEntries = completedEntries.filter(e => e.clientId === client.id);
    const hours = clientEntries.reduce((sum, e) => sum + e.duration, 0);
    const amount = clientEntries.reduce((sum, e) => sum + e.amount, 0);
    return {
      ...client,
      hours,
      amount
    };
  }).filter(c => c.hours > 0);

  const handleStopTimer = (entryId: string) => {
    toast.success('Registro de tiempo finalizado');
    setActiveEntry(null);
  };

  const handleSaveHours = (data: any) => {
    if (editingEntry) {
      // Editar entrada existente
      setTimeEntries(timeEntries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...data, id: editingEntry.id } 
          : entry
      ));
      toast.success('✅ Registro actualizado exitosamente');
    } else {
      // Crear nueva entrada
      const newEntry: TimeEntry = {
        id: `TIME-${Date.now()}`,
        ...data
      };
      setTimeEntries([newEntry, ...timeEntries]);
      toast.success('✅ Registro creado exitosamente');
    }
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 border-[#FF8C00] p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-100">Horas este Mes</h3>
            <Clock className="w-5 h-5 text-orange-100" />
          </div>
          <p className="text-3xl font-bold text-white">{totalHoursThisMonth}h</p>
          <p className="text-xs text-orange-100 mt-1">
            {completedEntries.length} registros completados
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Monto Generado</h3>
            <DollarSign className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalAmountThisMonth)}</p>
          <p className="text-xs text-green-100 mt-1">
            Basado en horas trabajadas
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Tarifa Promedio</h3>
            <TrendingUp className="w-5 h-5 text-blue-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(avgHourlyRate)}/h</p>
          <p className="text-xs text-blue-100 mt-1">
            Promedio ponderado
          </p>
        </Card>
      </div>

      {/* Hours by Client */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Horas por Cliente
        </h3>
        <div className="space-y-3">
          {hoursByClient.map(client => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: client.brandColor }}
                >
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{client.name}</p>
                  <p className="text-xs text-zinc-500">
                    {client.hourlyRate ? `${formatCurrency(client.hourlyRate)}/hora` : 'Honorarios fijos'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{client.hours}h</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(client.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Time Entries */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Registros de Tiempo ({timeEntries.length})
        </h3>

        {timeEntries.map(entry => (
          <Card
            key={entry.id}
            className={`border-zinc-200 dark:border-zinc-700 p-4 ${
              entry.status === 'in-progress'
                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-300 dark:border-green-800'
                : 'bg-white dark:bg-zinc-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Left: Time Entry Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">
                      {entry.clientName}
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {entry.activity}
                    </p>
                  </div>
                  {entry.status === 'in-progress' ? (
                    <Badge className="bg-green-500 text-white animate-pulse">
                      <Play className="w-3 h-3 mr-1" />
                      En Progreso
                    </Badge>
                  ) : (
                    <Badge className="bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                      Completado
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                  <div>
                    <p className="text-zinc-500">Fecha</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {format(parseISO(entry.date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Horario</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {entry.startTime} - {entry.endTime || 'Actual'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Duración</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {entry.duration > 0 ? `${entry.duration}h` : 'En curso'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Monto</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {entry.amount > 0 ? formatCurrency(entry.amount) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{entry.location}</span>
                  </div>
                  {entry.gpsVerified && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      ✓ GPS Verificado
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              {entry.status === 'in-progress' && (
                <Button
                  size="sm"
                  onClick={() => handleStopTimer(entry.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="w-3 h-3 mr-1 fill-current" />
                  Detener
                </Button>
              )}
              {entry.status === 'completed' && (
                <Button
                  size="sm"
                  onClick={() => handleEditEntry(entry)}
                  className="bg-[#0055A4] hover:bg-[#004080] text-white"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Registro Automático con GPS
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              El sistema detecta automáticamente cuando llegas a la ubicación de un cliente y
              te pregunta si deseas iniciar el registro de tiempo. Al salir, registra automáticamente
              la hora de término. Todas las entradas están verificadas con GPS para máxima precisión.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Hours Button */}
      <Button
        size="sm"
        onClick={() => setIsAddModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="w-3 h-3 mr-1 fill-current" />
        Agregar Horas
      </Button>

      {/* Add Hours Modal */}
      <AddHoursModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        clients={clients}
        onSave={handleSaveHours}
        editingEntry={editingEntry}
      />
    </div>
  );
}