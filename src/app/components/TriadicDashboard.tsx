import { useState } from 'react';
import { 
  ArrowLeft,
  Megaphone,
  Shield,
  ClipboardList,
  QrCode,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Archive,
  Building2,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  HardHat,
  Briefcase,
  Image,
  ListChecks,
  BookOpen
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { IncidentDashboardWidget } from '@/app/components/IncidentDashboardWidget';

interface TriadicDashboardProps {
  onBack: () => void;
  onNavigate: (view: string, actionId?: string) => void;
  isOnline: boolean;
  pendingItems?: number;
}

type DashboardMode = 'field' | 'office' | 'strategic';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgency?: {
    count: number;
    type: 'overdue' | 'today' | 'upcoming';
  };
}

export function TriadicDashboard({ onBack, onNavigate, isOnline, pendingItems = 0 }: TriadicDashboardProps) {
  const [activeMode, setActiveMode] = useState<DashboardMode>('field');

  // Acciones del Modo Operativo (Terreno)
  const fieldActions: QuickAction[] = [
    {
      id: 'talk',
      title: 'Charla de Seguridad',
      subtitle: 'Registro con firma masiva',
      icon: Megaphone,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/20',
      action: 'talk-and-delivery',
      priority: 'high',
      urgency: { count: 3, type: 'today' }
    },
    {
      id: 'epp',
      title: 'Entrega de EPP',
      subtitle: 'Registro con firma de recepción',
      icon: Shield,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950/20',
      action: 'talk-and-delivery',
      priority: 'high',
      urgency: { count: 2, type: 'today' }
    },
    {
      id: 'inspection',
      title: 'Inspección de Terreno',
      subtitle: 'Con geolocalización y fotos',
      icon: ClipboardList,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950/20',
      action: 'inspection-form',
      priority: 'medium',
      urgency: { count: 5, type: 'upcoming' }
    },
    {
      id: 'incident',
      title: 'Reporte de Incidente',
      subtitle: 'Registro inmediato de eventos',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950/20',
      action: 'form',
      priority: 'critical'
    }
  ];

  // Acciones del Modo Administrativo (Gabinete)
  const officeActions: QuickAction[] = [
    {
      id: 'vault',
      title: 'Bóveda Documental',
      subtitle: 'Documentos firmados y certificados',
      icon: Archive,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950/20',
      action: 'enhanced-vault',
      priority: 'medium'
    },
    {
      id: 'monthly-plan',
      title: 'Plan de Trabajo Mensual',
      subtitle: 'Planificación y seguimiento',
      icon: Calendar,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-950/20',
      action: 'monthly-plan',
      priority: 'high',
      urgency: { count: 1, type: 'overdue' }
    },
    {
      id: 'training-history',
      title: 'Historial de Capacitaciones',
      subtitle: 'Charlas, EPP e Inducciones',
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950/20',
      action: 'training-history',
      priority: 'medium'
    },
    {
      id: 'contractors',
      title: 'Gestión de Contratistas',
      subtitle: 'Validación y documentos',
      icon: Building2,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/20',
      action: 'contractor-portal',
      priority: 'medium'
    },
    {
      id: 'workers',
      title: 'Registro de Trabajadores',
      subtitle: 'CRUD completo con vencimientos',
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-950/20',
      action: 'worker-management',
      priority: 'low'
    },
    {
      id: 'calendar',
      title: 'Calendario Inteligente',
      subtitle: 'Agendamiento y optimización de rutas',
      icon: MapPin,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-950/20',
      action: 'calendar',
      priority: 'medium'
    },
    {
      id: 'delivery-system',
      title: 'Envío de Documentos',
      subtitle: 'Previsualización y validación',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/20',
      action: 'document-delivery',
      priority: 'medium'
    }
  ];

  // Acciones del Modo Estratégico (Gerencial)
  const strategicActions: QuickAction[] = [
    {
      id: 'strategic-panel',
      title: 'Panel Estratégico',
      subtitle: 'Dashboard Gerencial y API para TI',
      icon: Briefcase,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950/20',
      action: 'strategic-panel',
      priority: 'critical'
    },
    {
      id: 'action-tracker',
      title: 'Gestión de Hallazgos',
      subtitle: 'Plan de Acción Correctiva',
      icon: ListChecks,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950/20',
      action: 'action-plan-tracker',
      priority: 'high',
      urgency: { count: 8, type: 'overdue' }
    }
  ];

  const getCurrentActions = () => {
    switch (activeMode) {
      case 'field': return fieldActions;
      case 'office': return officeActions;
      case 'strategic': return strategicActions;
    }
  };

  const getModeConfig = (mode: DashboardMode) => {
    switch (mode) {
      case 'field':
        return {
          title: 'Modo Operativo',
          subtitle: 'Trabajo en Terreno',
          icon: HardHat,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-600',
          description: 'Acceso rápido a funciones críticas en campo'
        };
      case 'office':
        return {
          title: 'Modo Administrativo',
          subtitle: 'Gestión de Gabinete',
          icon: FileText,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-600',
          description: 'Organización documental y planificación'
        };
      case 'strategic':
        return {
          title: 'Modo Estratégico',
          subtitle: 'Vista Gerencial',
          icon: TrendingUp,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-600',
          description: 'Análisis, reportes y toma de decisiones'
        };
    }
  };

  const currentConfig = getModeConfig(activeMode);
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 lg:pb-6">
      {/* Header */}
      <div className={`${currentConfig.bgColor} border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Cambiar Empresa</span>
            </button>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              {pendingItems > 0 && (
                <Badge className="bg-red-600 text-white border-0">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {pendingItems} pendientes
                </Badge>
              )}
              <Badge className={isOnline ? 'bg-green-600 text-white border-0' : 'bg-yellow-600 text-white border-0'}>
                {isOnline ? '🟢 Online' : '⚠️ Offline'}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm">
              <CurrentIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-2xl lg:text-3xl mb-1 font-bold">
                {currentConfig.title}
              </h1>
              <p className="text-white/80 text-sm lg:text-base">
                {currentConfig.subtitle} • {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveMode('field')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeMode === 'field'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HardHat className="w-4 h-4 inline mr-2" />
              Terreno
            </button>
            <button
              onClick={() => setActiveMode('office')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeMode === 'office'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Gabinete
            </button>
            <button
              onClick={() => setActiveMode('strategic')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeMode === 'strategic'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Estratégico
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Urgency Alert */}
        {getCurrentActions().some(a => a.urgency?.type === 'overdue') && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  ⚠️ Tareas Vencidas
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Hay {getCurrentActions().filter(a => a.urgency?.type === 'overdue').reduce((sum, a) => sum + (a.urgency?.count || 0), 0)} tareas críticas vencidas que requieren atención inmediata
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {getCurrentActions().map((action) => {
            const ActionIcon = action.icon;
            const hasUrgency = action.urgency;
            const isOverdue = action.urgency?.type === 'overdue';
            const isToday = action.urgency?.type === 'today';

            return (
              <Card
                key={action.id}
                onClick={() => onNavigate(action.action, action.id)}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white dark:bg-zinc-900 ${
                  isOverdue ? 'border-2 border-red-500 dark:border-red-600 shadow-red-100 dark:shadow-red-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${action.bgColor}`}>
                    <ActionIcon className={`w-6 h-6 ${action.color}`} />
                  </div>

                  {hasUrgency && (
                    <Badge className={
                      isOverdue ? 'bg-red-600 text-white border-0' :
                      isToday ? 'bg-amber-600 text-white border-0' :
                      'bg-blue-600 text-white border-0'
                    }>
                      {isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {isToday && <Clock className="w-3 h-3 mr-1" />}
                      {hasUrgency.count}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {action.subtitle}
                </p>

                {hasUrgency && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700">
                    <p className={`text-xs font-medium ${
                      isOverdue ? 'text-red-600 dark:text-red-400' :
                      isToday ? 'text-amber-600 dark:text-amber-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {isOverdue && '🔴 Vencido'}
                      {isToday && '⏰ Hoy'}
                      {!isOverdue && !isToday && '📅 Próximo'}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Widget de Seguimiento de Incidentes/Accidentes - Visible en todos los modos */}
        <div className="mt-6">
          <IncidentDashboardWidget
            compact={activeMode === 'field'}
            onViewDetails={(id) => {
              onNavigate('incident-followup', id);
            }}
            onViewAll={() => {
              onNavigate('incident-followup');
            }}
          />
        </div>

        {/* Mode Context Help */}
        <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💡 Consejo de Navegación
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {activeMode === 'field' && 'En Modo Terreno tienes acceso rápido a las funciones más críticas para el trabajo en campo. Las acciones con urgencia se destacan automáticamente.'}
                {activeMode === 'office' && 'En Modo Gabinete puedes gestionar toda la documentación, planificación y coordinación desde la oficina. Recuerda revisar las tareas vencidas.'}
                {activeMode === 'strategic' && 'En Modo Estratégico accedes a análisis avanzados, reportes gerenciales y configuraciones del sistema. Ideal para toma de decisiones basada en datos.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}