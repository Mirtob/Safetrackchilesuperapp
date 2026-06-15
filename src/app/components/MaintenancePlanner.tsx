import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface MaintenancePlannerProps {
  onBack: () => void;
}

interface MaintenanceEvent {
  id: string;
  assetCode: string;
  assetName: string;
  date: string;
  type: 'preventive' | 'corrective' | 'inspection';
  status: 'scheduled' | 'completed' | 'overdue';
  supplier: string;
  priority: 'high' | 'medium' | 'low';
}

export function MaintenancePlanner({ onBack }: MaintenancePlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Eventos de mantención
  const maintenanceEvents: MaintenanceEvent[] = [
    {
      id: 'MANT-001',
      assetCode: 'EXT-OBR-002',
      assetName: 'Extintor CO2 10kg - Bodega',
      date: '2026-02-10',
      type: 'preventive',
      status: 'scheduled',
      supplier: 'Extintores Chile S.A.',
      priority: 'high'
    },
    {
      id: 'MANT-002',
      assetCode: 'ALT-ARN-001',
      assetName: 'Arnés de Seguridad Full Body',
      date: '2026-02-05',
      type: 'inspection',
      status: 'scheduled',
      supplier: 'MSA Safety',
      priority: 'high'
    },
    {
      id: 'MANT-003',
      assetCode: 'VEH-CAM-001',
      assetName: 'Camión Tolva Mercedes Actros',
      date: '2026-02-08',
      type: 'preventive',
      status: 'scheduled',
      supplier: 'Mercedes-Benz Trucks',
      priority: 'high'
    },
    {
      id: 'MANT-004',
      assetCode: 'MAQ-COM-001',
      assetName: 'Compresor de Aire Atlas Copco',
      date: '2026-02-15',
      type: 'preventive',
      status: 'scheduled',
      supplier: 'Atlas Copco Chile',
      priority: 'medium'
    },
    {
      id: 'MANT-005',
      assetCode: 'EXT-OBR-003',
      assetName: 'Extintor PQS 6kg - Comedor',
      date: '2026-01-10',
      type: 'corrective',
      status: 'overdue',
      supplier: 'Seguridad Industrial Ltda.',
      priority: 'high'
    },
    {
      id: 'MANT-006',
      assetCode: 'ELE-GEN-001',
      assetName: 'Generador Eléctrico 150kVA',
      date: '2026-01-15',
      type: 'corrective',
      status: 'overdue',
      supplier: 'Caterpillar Power Systems',
      priority: 'high'
    },
    {
      id: 'MANT-007',
      assetCode: 'MAQ-GRU-001',
      assetName: 'Grúa Horquilla Toyota 2.5T',
      date: '2026-02-20',
      type: 'inspection',
      status: 'scheduled',
      supplier: 'Toyota Industrial',
      priority: 'medium'
    }
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return maintenanceEvents.filter(event => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return maintenanceEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getOverdueEvents = () => {
    const today = new Date();
    return maintenanceEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today && event.status !== 'completed';
    });
  };

  const upcomingEvents = getUpcomingEvents();
  const overdueEvents = getOverdueEvents();

  const getStatusBadge = (status: MaintenanceEvent['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-600 border-0 text-xs">Programado</Badge>;
      case 'completed':
        return <Badge className="bg-[#27AE60]/20 text-[#27AE60] border-0 text-xs">Completado</Badge>;
      case 'overdue':
        return <Badge className="bg-[#EB5757]/20 text-[#EB5757] border-0 text-xs">Vencido</Badge>;
    }
  };

  const getTypeBadge = (type: MaintenanceEvent['type']) => {
    switch (type) {
      case 'preventive':
        return <Badge className="bg-green-500/20 text-green-600 border-0 text-xs">Preventivo</Badge>;
      case 'corrective':
        return <Badge className="bg-red-500/20 text-red-600 border-0 text-xs">Correctivo</Badge>;
      case 'inspection':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-0 text-xs">Inspección</Badge>;
    }
  };

  const syncWithCalendar = (provider: 'google' | 'outlook') => {
    toast.success(`Sincronizando con ${provider === 'google' ? 'Google Calendar' : 'Outlook'}`, {
      description: 'Los eventos de mantención se están exportando...'
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">Planificador de Mantenciones</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Calendario y tareas programadas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => syncWithCalendar('google')}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 hidden lg:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Google Calendar
              </Button>
              <Button
                onClick={() => syncWithCalendar('outlook')}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 hidden lg:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Outlook
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario Principal */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-6">
                {/* Header del Calendario */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-zinc-900 dark:text-white font-bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={previousMonth}
                      size="sm"
                      variant="outline"
                      className="border-zinc-300 dark:border-zinc-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentDate(new Date())}
                      size="sm"
                      variant="outline"
                      className="border-zinc-300 dark:border-zinc-700"
                    >
                      Hoy
                    </Button>
                    <Button
                      onClick={nextMonth}
                      size="sm"
                      variant="outline"
                      className="border-zinc-300 dark:border-zinc-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Grid del Calendario */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Días de la semana */}
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 py-2">
                      {day}
                    </div>
                  ))}

                  {/* Días vacíos antes del primer día */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Días del mes */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const events = getEventsForDate(day);
                    const hasOverdue = events.some(e => e.status === 'overdue');
                    const hasScheduled = events.some(e => e.status === 'scheduled');
                    const today = new Date();
                    const isToday = 
                      day === today.getDate() && 
                      currentDate.getMonth() === today.getMonth() && 
                      currentDate.getFullYear() === today.getFullYear();

                    return (
                      <div
                        key={day}
                        className={`aspect-square border rounded-lg p-2 transition-all hover:shadow-md cursor-pointer ${
                          isToday 
                            ? 'bg-[#0055A4] text-white border-[#0055A4]' 
                            : hasOverdue 
                            ? 'bg-[#EB5757]/10 border-[#EB5757]/30' 
                            : hasScheduled 
                            ? 'bg-[#F2C94C]/10 border-[#F2C94C]/30'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                          {day}
                        </div>
                        {events.length > 0 && (
                          <div className="space-y-1">
                            {events.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded ${
                                  isToday
                                    ? 'bg-white/20 text-white'
                                    : event.status === 'overdue'
                                    ? 'bg-[#EB5757] text-white'
                                    : 'bg-[#0055A4] text-white'
                                }`}
                              >
                                {event.assetCode}
                              </div>
                            ))}
                            {events.length > 2 && (
                              <div className={`text-xs ${isToday ? 'text-white/80' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                +{events.length - 2} más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#27AE60]" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Completado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#F2C94C]" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Programado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#EB5757]" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Vencido</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Timeline Lateral */}
          <div className="space-y-6">
            {/* Tareas Vencidas */}
            {overdueEvents.length > 0 && (
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-[#EB5757]/30">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[#EB5757]" />
                    <h3 className="text-zinc-900 dark:text-white font-semibold">
                      ⚠️ Tareas Críticas ({overdueEvents.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {overdueEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-[#EB5757]/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{event.assetName}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">{event.assetCode}</p>
                          </div>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>Vencido: {event.date}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-[#EB5757] hover:bg-red-700 text-white"
                        >
                          <Wrench className="w-3 h-3 mr-2" />
                          Agendar Urgente
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Próximas Tareas (7 días) */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#0055A4]" />
                  <h3 className="text-zinc-900 dark:text-white font-semibold">
                    Próximos 7 Días ({upcomingEvents.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-[#27AE60] mx-auto mb-2" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        No hay mantenciones programadas para los próximos 7 días
                      </p>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{event.assetName}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">{event.assetCode}</p>
                          </div>
                          {getTypeBadge(event.type)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{event.date}</span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                          🏢 {event.supplier}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-zinc-300 dark:border-zinc-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-5">
                <h3 className="text-zinc-900 dark:text-white font-semibold mb-4">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-[#0055A4] hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Calendario
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-300 dark:border-zinc-700"
                    onClick={() => syncWithCalendar('google')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Sync Google Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-300 dark:border-zinc-700"
                    onClick={() => syncWithCalendar('outlook')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Sync Outlook
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
