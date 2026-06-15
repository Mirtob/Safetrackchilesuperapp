import { useState } from 'react';
import { 
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  Calendar,
  Filter,
  Search,
  Bell,
  TrendingUp,
  MapPin,
  FileText,
  Send,
  ChevronRight,
  AlertCircle,
  XCircle,
  User
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';

interface UnifiedAlertCenterProps {
  onBack: () => void;
  onScheduleTraining?: (workerId: string, trainingType: string) => void;
  onScheduleMaintenance?: (assetId: string) => void;
  onViewWorker?: (workerId: string) => void;
  onViewAsset?: (assetId: string) => void;
}

interface TrainingAlert {
  id: string;
  type: 'training';
  workerId: string;
  workerName: string;
  workerRut: string;
  company: string;
  trainingType: string;
  status: 'vencido' | 'por-vencer' | 'sin-realizar';
  expiryDate?: string;
  daysRemaining?: number;
  priority: 'critical' | 'high' | 'medium';
  lastTraining?: string;
  requiredBy: string; // Normativa que lo requiere
}

interface MaintenanceAlert {
  id: string;
  type: 'maintenance';
  assetId: string;
  assetName: string;
  assetType: string;
  company: string;
  maintenanceType: string;
  status: 'vencido' | 'por-vencer';
  dueDate: string;
  daysOverdue?: number;
  daysRemaining?: number;
  priority: 'critical' | 'high' | 'medium';
  lastMaintenance?: string;
  location: string;
}

type Alert = TrainingAlert | MaintenanceAlert;

export function UnifiedAlertCenter({ onBack }: UnifiedAlertCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'training' | 'maintenance' | 'overdue'>('overdue');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  // Alertas de mantenciones vencidas (CRÍTICO)
  const overdueMaintenanceAlerts: MaintenanceAlert[] = [
    {
      id: 'AM001',
      type: 'maintenance',
      priority: 'critical',
      assetId: 'EXT-001',
      assetName: 'Extintor PQS 10kg - Área Producción',
      assetType: 'Extintor',
      company: 'Constructora Los Andes S.A.',
      maintenanceType: 'Inspección Mensual',
      dueDate: '2026-01-20',
      status: 'vencido',
      daysOverdue: 5,
      location: 'Área Producción - Piso 2'
    },
    {
      id: 'AM002',
      type: 'maintenance',
      priority: 'critical',
      assetId: 'AND-003',
      assetName: 'Andamio Tubular 6m - Obra Civil',
      assetType: 'Andamio',
      company: 'Constructora Los Andes S.A.',
      maintenanceType: 'Revisión Estructural Trimestral',
      dueDate: '2026-01-23',
      status: 'vencido',
      daysOverdue: 2,
      location: 'Obra Civil - Edificio A'
    },
    {
      id: 'AM003',
      type: 'maintenance',
      priority: 'high',
      assetId: 'ARN-012',
      assetName: 'Arnés de Seguridad - Cuadrilla A',
      assetType: 'EPP',
      company: 'Constructora Los Andes S.A.',
      maintenanceType: 'Revisión Semestral',
      dueDate: '2026-01-24',
      status: 'vencido',
      daysOverdue: 1,
      location: 'Bodega EPP - Planta Baja'
    }
  ];

  // Alertas próximas a vencer (URGENTE)
  const upcomingMaintenanceAlerts: MaintenanceAlert[] = [
    {
      id: 'AM004',
      type: 'maintenance',
      priority: 'high',
      assetId: 'ESC-001',
      assetName: 'Escalera Extensible 8m',
      assetType: 'Herramienta',
      company: 'Constructora Los Andes S.A.',
      maintenanceType: 'Inspección Mensual',
      dueDate: '2026-01-27',
      status: 'por-vencer',
      daysRemaining: 2,
      location: 'Bodega Herramientas'
    },
    {
      id: 'AM005',
      type: 'maintenance',
      priority: 'medium',
      assetId: 'BOT-001',
      assetName: 'Botiquín Primeros Auxilios - Oficina',
      assetType: 'Equipamiento',
      company: 'Constructora Los Andes S.A.',
      maintenanceType: 'Revisión de Stock Mensual',
      dueDate: '2026-01-30',
      status: 'por-vencer',
      daysRemaining: 5,
      location: 'Oficina Principal - Piso 1'
    }
  ];

  // Alertas de capacitación
  const trainingAlerts: TrainingAlert[] = [
    {
      id: 'AT001',
      type: 'training',
      priority: 'critical',
      workerId: 'W001',
      workerName: 'Carlos Muñoz',
      workerRut: '18.234.567-8',
      company: 'Constructora Los Andes S.A.',
      trainingType: 'Trabajo en Altura',
      status: 'vencido',
      expiryDate: '2026-01-18',
      daysRemaining: -7,
      lastTraining: '2025-01-18',
      requiredBy: 'D.S. 594 Art. 42'
    },
    {
      id: 'AT002',
      type: 'training',
      priority: 'high',
      workerId: 'W002',
      workerName: 'María González',
      workerRut: '17.123.456-9',
      company: 'Constructora Los Andes S.A.',
      trainingType: 'Inducción ODI',
      status: 'por-vencer',
      expiryDate: '2026-01-28',
      daysRemaining: 3,
      lastTraining: '2025-10-28',
      requiredBy: 'Protocolo Interno'
    }
  ];

  const allAlerts: Alert[] = [...overdueMaintenanceAlerts, ...upcomingMaintenanceAlerts, ...trainingAlerts];
  
  const filteredAlerts = activeTab === 'all' 
    ? allAlerts
    : activeTab === 'training'
    ? trainingAlerts
    : activeTab === 'maintenance'
    ? [...overdueMaintenanceAlerts, ...upcomingMaintenanceAlerts]
    : [...overdueMaintenanceAlerts, ...trainingAlerts.filter(a => a.status === 'vencido')];

  const criticalCount = allAlerts.filter(a => a.status === 'vencido').length;
  const upcomingCount = allAlerts.filter(a => a.status === 'por-vencer').length;

  const handleScheduleMaintenance = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = () => {
    toast.success('✅ Mantención Agendada', {
      description: `La mantención de ${selectedAlert?.assetName || selectedAlert?.workerName} ha sido programada exitosamente`
    });
    setShowScheduleModal(false);
    setSelectedAlert(null);
  };

  const handleMarkAsCompleted = (alertId: string) => {
    toast.success('✅ Alerta Completada', {
      description: 'La actividad ha sido marcada como completada y se registró en el sistema'
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medio</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vencido':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencido</Badge>;
      case 'por-vencer':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Por Vencer</Badge>;
      case 'sin-realizar':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Sin Realizar</Badge>;
      default:
        return null;
    }
  };

  const handleSchedule = (alert: Alert) => {
    if (alert.type === 'training') {
      toast.success('Agendando capacitación', {
        description: `Se abrirá el calendario para agendar "${alert.trainingType}" para ${alert.workerName}`
      });
      onScheduleTraining?.(alert.workerId, alert.trainingType);
    } else {
      toast.success('Agendando mantenimiento', {
        description: `Se abrirá el calendario para agendar "${alert.maintenanceType}" de ${alert.assetName}`
      });
      onScheduleMaintenance?.(alert.assetId);
    }
  };

  const handleQuickSchedule = (alert: Alert) => {
    toast.success('Agendado para próxima visita', {
      description: 'Se agregó a la lista de tareas pendientes para la próxima visita a la empresa'
    });
  };

  const handleView = (alert: Alert) => {
    if (alert.type === 'training') {
      onViewWorker?.(alert.workerId);
    } else {
      onViewAsset?.(alert.assetId);
    }
  };

  const sortedAlerts = filteredAlerts
    .filter(alert => {
      const searchText = alert.type === 'training' 
        ? `${alert.workerName} ${alert.trainingType}`
        : `${alert.assetName} ${alert.maintenanceType}`;
      return searchText.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterPriority === 'all' || alert.priority === filterPriority);
    })
    .sort((a, b) => {
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (a.priority !== 'critical' && b.priority === 'critical') return 1;
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 dark:from-zinc-950 dark:via-orange-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Centro de Alertas
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Capacitaciones y Mantenimientos
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Críticas</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{criticalCount}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-900 dark:text-orange-300">Alta Prioridad</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{upcomingCount}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Capacitaciones</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{trainingAlerts.length}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Mantenimientos</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{upcomingMaintenanceAlerts.length + overdueMaintenanceAlerts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Todas ({allAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Capacitaciones ({trainingAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Wrench className="w-4 h-4 mr-2" />
              Mantenimientos ({upcomingMaintenanceAlerts.length + overdueMaintenanceAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              Vencidas ({criticalCount})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar alertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
            </select>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {sortedAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${
                        alert.priority === 'critical'
                          ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10'
                          : alert.priority === 'high'
                          ? 'border-orange-300 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/10'
                          : 'border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {alert.type === 'training' ? (
                        // Training Alert
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {alert.workerName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {alert.workerRut}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                                <strong>Capacitación:</strong> {alert.trainingType}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-500">
                                {alert.company}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getPriorityBadge(alert.priority)}
                              {getStatusBadge(alert.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                            {alert.lastTraining && (
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-zinc-500">Última capacitación:</span>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {new Date(alert.lastTraining).toLocaleDateString('es-CL')}
                                </div>
                              </div>
                            )}
                            {alert.expiryDate && (
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-zinc-500">
                                  {alert.status === 'vencido' ? 'Venció el:' : 'Vence el:'}
                                </span>
                                <div className={`font-medium ${
                                  alert.status === 'vencido' 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                  {new Date(alert.expiryDate).toLocaleDateString('es-CL')}
                                  {alert.daysRemaining !== undefined && (
                                    <span className="ml-2">
                                      ({alert.daysRemaining < 0 
                                        ? `${Math.abs(alert.daysRemaining)} días vencido` 
                                        : `${alert.daysRemaining} días restantes`})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-800 dark:text-blue-300">
                            <strong>📋 Normativa:</strong> {alert.requiredBy}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleSchedule(alert)}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Agendar en Calendario
                            </Button>
                            <Button
                              onClick={() => handleQuickSchedule(alert)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Próxima Visita
                            </Button>
                            <Button
                              onClick={() => handleView(alert)}
                              size="sm"
                              variant="outline"
                            >
                              <ChevronRight className="w-3 h-3 mr-1" />
                              Ver Trabajador
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Maintenance Alert
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {alert.assetName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {alert.assetType}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                                <strong>Mantenimiento:</strong> {alert.maintenanceType}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                                <MapPin className="w-3 h-3" />
                                {alert.location} • {alert.company}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getPriorityBadge(alert.priority)}
                              {getStatusBadge(alert.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                            {alert.lastMaintenance && (
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-zinc-500">Último mantenimiento:</span>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {new Date(alert.lastMaintenance).toLocaleDateString('es-CL')}
                                </div>
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="text-slate-500 dark:text-zinc-500">
                                {alert.status === 'vencido' ? 'Venció el:' : 'Vence el:'}
                              </span>
                              <div className={`font-medium ${
                                alert.status === 'vencido' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                {new Date(alert.dueDate).toLocaleDateString('es-CL')}
                                {alert.daysOverdue && (
                                  <span className="ml-2">
                                    ({alert.daysOverdue} días atrasado)
                                  </span>
                                )}
                                {alert.daysRemaining !== undefined && (
                                  <span className="ml-2">
                                    ({alert.daysRemaining} días restantes)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleSchedule(alert)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Agendar Mantenimiento
                            </Button>
                            <Button
                              onClick={() => handleQuickSchedule(alert)}
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Próxima Visita
                            </Button>
                            <Button
                              onClick={() => handleView(alert)}
                              size="sm"
                              variant="outline"
                            >
                              <ChevronRight className="w-3 h-3 mr-1" />
                              Ver Activo
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {sortedAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 dark:text-green-400 mb-3" />
                      <p className="text-slate-600 dark:text-zinc-400">
                        No hay alertas que coincidan con los filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Important Notice */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                ⚠️ Sistema de Alertas Automáticas
              </div>
              <div className="text-orange-800 dark:text-orange-300 space-y-1">
                <p>
                  • Las capacitaciones vencen automáticamente según la normativa chilena (generalmente cada 12 meses)
                </p>
                <p>
                  • Los mantenimientos se monitorean según especificaciones del fabricante y normativa aplicable
                </p>
                <p>
                  • Las alertas críticas requieren acción inmediata para mantener el cumplimiento normativo
                </p>
                <p>
                  • Puedes agendar en calendario o marcarlo para la próxima visita a la empresa
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}