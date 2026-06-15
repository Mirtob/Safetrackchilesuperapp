import { ArrowLeft, Clock, MessageSquare, ClipboardCheck, Package, AlertTriangle, FileText } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface TimelineViewProps {
  onBack: () => void;
}

interface TimelineEvent {
  id: string;
  type: 'talk' | 'inspection' | 'epp' | 'incident' | 'document';
  title: string;
  time: string;
  user: string;
  location: string;
  status: 'completed' | 'pending' | 'alert';
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'talk',
    title: 'Charla de 5 minutos - Uso correcto de EPP',
    time: '14:30',
    user: 'Juan Pérez (Prevencionista)',
    location: 'Sucursal Maipú - Sector A',
    status: 'completed'
  },
  {
    id: '2',
    type: 'inspection',
    title: 'Inspección de extintores - Planta 2',
    time: '12:15',
    user: 'Juan Pérez (Prevencionista)',
    location: 'Sucursal Maipú - Piso 2',
    status: 'completed'
  },
  {
    id: '3',
    type: 'epp',
    title: 'Entrega de EPP - 5 trabajadores',
    time: '10:00',
    user: 'Juan Pérez (Prevencionista)',
    location: 'Sucursal Maipú - Bodega',
    status: 'completed'
  },
  {
    id: '4',
    type: 'talk',
    title: 'Charla de 5 minutos - Trabajo en altura',
    time: '09:00',
    user: 'Juan Pérez (Prevencionista)',
    location: 'Sucursal Maipú - Sector B',
    status: 'completed'
  },
  {
    id: '5',
    type: 'document',
    title: 'Actualización Carpeta de Arranque',
    time: '08:30',
    user: 'Sistema Automático',
    location: 'Digital',
    status: 'completed'
  },
  {
    id: '6',
    type: 'incident',
    title: 'Incidente menor - Corte superficial',
    time: 'Ayer 16:45',
    user: 'María González (Supervisora)',
    location: 'Sucursal Centro - Línea 3',
    status: 'alert'
  }
];

export function TimelineView({ onBack }: TimelineViewProps) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'talk':
        return <MessageSquare className="w-5 h-5" />;
      case 'inspection':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'epp':
        return <Package className="w-5 h-5" />;
      case 'incident':
        return <AlertTriangle className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type'], status: TimelineEvent['status']) => {
    if (status === 'alert') return 'bg-red-500/20 text-red-400';
    
    switch (type) {
      case 'talk':
        return 'bg-[#FF8C00]/20 text-[#FF8C00]';
      case 'inspection':
        return 'bg-[#0055A4]/20 text-[#0055A4]';
      case 'epp':
        return 'bg-green-500/20 text-green-400';
      case 'incident':
        return 'bg-red-500/20 text-red-400';
      case 'document':
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const getStatusBadge = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">Pendiente</Badge>;
      case 'alert':
        return <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">Requiere atención</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-white text-xl">Línea de Tiempo</h1>
          <p className="text-sm text-zinc-400 mt-1">Actividades de hoy</p>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Summary Card */}
        <Card className="bg-zinc-800 border-zinc-700 mb-6">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#FF8C00]" />
              <h2 className="text-white">Resumen del Día</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl text-white mb-1">6</p>
                <p className="text-xs text-zinc-400">Eventos registrados</p>
              </div>
              <div>
                <p className="text-2xl text-white mb-1">5</p>
                <p className="text-xs text-zinc-400">Completados</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[21px] top-0 bottom-0 w-0.5 bg-zinc-700" />

          {/* Events */}
          <div className="space-y-6">
            {mockEvents.map((event, index) => (
              <div key={event.id} className="relative pl-12">
                {/* Icon circle */}
                <div 
                  className={`absolute left-0 w-11 h-11 rounded-full flex items-center justify-center ${getEventColor(event.type, event.status)}`}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Event Card */}
                <Card className="bg-zinc-800 border-zinc-700">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white mb-1">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="space-y-1 pt-2 border-t border-zinc-700">
                      <p className="text-sm text-zinc-400">
                        <span className="text-zinc-500">Responsable:</span> {event.user}
                      </p>
                      <p className="text-sm text-zinc-400">
                        <span className="text-zinc-500">Ubicación:</span> {event.location}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* End of timeline marker */}
        <div className="relative pl-12 mt-6">
          <div className="absolute left-[7px] w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
          </div>
          <p className="text-zinc-500 text-sm">Inicio del registro</p>
        </div>
      </div>
    </div>
  );
}
