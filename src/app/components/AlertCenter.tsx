import { useState } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  Settings,
  Mail,
  MessageSquare,
  Calendar,
  Filter,
  Download,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

interface AlertCenterProps {
  onBack: () => void;
}

type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
type AlertType = 'maintenance' | 'expiration' | 'inspection' | 'certification';

interface Alert {
  id: string;
  assetCode: string;
  assetName: string;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  daysRemaining: number;
  date: string;
  supplier: string;
  dismissed: boolean;
}

export function AlertCenter({ onBack }: AlertCenterProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all');

  // Configuración de alertas
  const [alertSettings, setAlertSettings] = useState({
    enabled: true,
    emailNotifications: true,
    whatsappNotifications: true,
    days30: true,
    days15: true,
    days5: true,
    dailyDigest: true,
    weeklyReport: true
  });

  // Alertas activas
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'ALT-001',
      assetCode: 'EXT-OBR-003',
      assetName: 'Extintor PQS 6kg - Comedor',
      type: 'expiration',
      priority: 'critical',
      message: 'Mantención VENCIDA hace 16 días. Equipo fuera de servicio.',
      daysRemaining: -16,
      date: '2026-01-10',
      supplier: 'Seguridad Industrial Ltda.',
      dismissed: false
    },
    {
      id: 'ALT-002',
      assetCode: 'ELE-GEN-001',
      assetName: 'Generador Eléctrico 150kVA',
      type: 'expiration',
      priority: 'critical',
      message: 'Mantención VENCIDA hace 11 días. Riesgo operacional alto.',
      daysRemaining: -11,
      date: '2026-01-15',
      supplier: 'Caterpillar Power Systems',
      dismissed: false
    },
    {
      id: 'ALT-003',
      assetCode: 'ALT-ARN-001',
      assetName: 'Arnés de Seguridad Full Body',
      type: 'maintenance',
      priority: 'high',
      message: 'Mantención preventiva en 10 días. Coordinar con proveedor.',
      daysRemaining: 10,
      date: '2026-02-05',
      supplier: 'MSA Safety',
      dismissed: false
    },
    {
      id: 'ALT-004',
      assetCode: 'VEH-CAM-001',
      assetName: 'Camión Tolva Mercedes Actros',
      type: 'maintenance',
      priority: 'high',
      message: 'Revisión técnica en 13 días. Agendar en planta de revisión.',
      daysRemaining: 13,
      date: '2026-02-08',
      supplier: 'Mercedes-Benz Trucks',
      dismissed: false
    },
    {
      id: 'ALT-005',
      assetCode: 'EXT-OBR-002',
      assetName: 'Extintor CO2 10kg - Bodega',
      type: 'maintenance',
      priority: 'high',
      message: 'Recarga de CO2 en 15 días. Notificar a área de mantención.',
      daysRemaining: 15,
      date: '2026-02-10',
      supplier: 'Extintores Chile S.A.',
      dismissed: false
    },
    {
      id: 'ALT-006',
      assetCode: 'MAQ-GRU-001',
      assetName: 'Grúa Horquilla Toyota 2.5T',
      type: 'inspection',
      priority: 'medium',
      message: 'Inspección semestral en 25 días.',
      daysRemaining: 25,
      date: '2026-02-20',
      supplier: 'Toyota Industrial',
      dismissed: false
    },
    {
      id: 'ALT-007',
      assetCode: 'MAQ-COM-001',
      assetName: 'Compresor de Aire Atlas Copco',
      type: 'maintenance',
      priority: 'medium',
      message: 'Cambio de filtros en 30 días.',
      daysRemaining: 30,
      date: '2026-02-25',
      supplier: 'Atlas Copco Chile',
      dismissed: false
    }
  ]);

  const filteredAlerts = alerts.filter(alert => {
    if (filterPriority === 'all') return !alert.dismissed;
    return alert.priority === filterPriority && !alert.dismissed;
  });

  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.dismissed).length;
  const highCount = alerts.filter(a => a.priority === 'high' && !a.dismissed).length;
  const mediumCount = alerts.filter(a => a.priority === 'medium' && !a.dismissed).length;
  const overdueCount = alerts.filter(a => a.daysRemaining < 0 && !a.dismissed).length;

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <Badge className="bg-[#EB5757]/20 text-[#EB5757] border-0 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Crítico
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-[#F2C94C]/20 text-[#F2C94C] border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Alta
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Media
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-zinc-500/20 text-zinc-600 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Baja
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: AlertType) => {
    switch (type) {
      case 'maintenance':
        return <Badge className="bg-green-500/20 text-green-600 border-0 text-xs">Mantención</Badge>;
      case 'expiration':
        return <Badge className="bg-red-500/20 text-red-600 border-0 text-xs">Vencimiento</Badge>;
      case 'inspection':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-0 text-xs">Inspección</Badge>;
      case 'certification':
        return <Badge className="bg-blue-500/20 text-blue-600 border-0 text-xs">Certificación</Badge>;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    toast.success('Alerta archivada');
  };

  const markAsHandled = (alert: Alert) => {
    toast.success('Tarea marcada como gestionada', {
      description: `${alert.assetName} - Evento programado en calendario`
    });
    dismissAlert(alert.id);
  };

  const exportAlerts = () => {
    toast.success('Exportando alertas', {
      description: 'Descargando reporte en formato Excel...'
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
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">Centro de Alertas</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Notificaciones y tareas críticas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Configurar</span>
              </Button>
              <Button
                onClick={exportAlerts}
                className="bg-[#0055A4] hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Principal de Alertas */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPIs de Alertas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-[#EB5757]/30">
                <div className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-[#EB5757] mx-auto mb-2" />
                  <div className="text-3xl text-[#EB5757] font-bold">{criticalCount}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Críticas</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-[#F2C94C]/30">
                <div className="p-4 text-center">
                  <Clock className="w-8 h-8 text-[#F2C94C] mx-auto mb-2" />
                  <div className="text-3xl text-[#F2C94C] font-bold">{highCount}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Alta Prioridad</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-500/30">
                <div className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl text-blue-600 font-bold">{mediumCount}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Media</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 border-2 border-zinc-300 dark:border-zinc-700">
                <div className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-zinc-600 dark:text-zinc-400 mx-auto mb-2" />
                  <div className="text-3xl text-zinc-900 dark:text-white font-bold">{overdueCount}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Vencidas</p>
                </div>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Filtrar por prioridad:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setFilterPriority('all')}
                    variant={filterPriority === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filterPriority === 'all'
                        ? 'bg-[#0055A4] hover:bg-blue-700 text-white'
                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }
                  >
                    Todas
                  </Button>
                  <Button
                    onClick={() => setFilterPriority('critical')}
                    variant={filterPriority === 'critical' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filterPriority === 'critical'
                        ? 'bg-[#EB5757] hover:bg-red-700 text-white'
                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }
                  >
                    Críticas
                  </Button>
                  <Button
                    onClick={() => setFilterPriority('high')}
                    variant={filterPriority === 'high' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filterPriority === 'high'
                        ? 'bg-[#F2C94C] hover:bg-yellow-600 text-white'
                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }
                  >
                    Alta
                  </Button>
                  <Button
                    onClick={() => setFilterPriority('medium')}
                    variant={filterPriority === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filterPriority === 'medium'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }
                  >
                    Media
                  </Button>
                </div>
              </div>
            </Card>

            {/* Lista de Alertas */}
            <div className="space-y-3">
              <h2 className="text-zinc-900 dark:text-white text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-[#EB5757] rounded-full" />
                Alertas Activas ({filteredAlerts.length})
              </h2>

              {filteredAlerts.length === 0 ? (
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <div className="p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[#27AE60] mx-auto mb-3" />
                    <p className="text-zinc-600 dark:text-zinc-400">No hay alertas activas en esta categoría</p>
                  </div>
                </Card>
              ) : (
                filteredAlerts.map((alert) => (
                  <Card 
                    key={alert.id}
                    className={`bg-white dark:bg-zinc-900 border-l-4 ${
                      alert.priority === 'critical'
                        ? 'border-l-[#EB5757]'
                        : alert.priority === 'high'
                        ? 'border-l-[#F2C94C]'
                        : 'border-l-blue-500'
                    } border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-zinc-900 dark:text-white font-semibold">{alert.assetName}</h3>
                            {getPriorityBadge(alert.priority)}
                            {getTypeBadge(alert.type)}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mb-2">{alert.assetCode}</p>
                          <p className={`text-sm font-medium ${
                            alert.daysRemaining < 0 ? 'text-[#EB5757]' : 'text-zinc-900 dark:text-white'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 mb-3">
                        <div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">📅 Fecha</p>
                          <p className="text-sm text-zinc-900 dark:text-white font-medium">{alert.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">🏢 Proveedor</p>
                          <p className="text-sm text-zinc-900 dark:text-white font-medium">{alert.supplier}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => markAsHandled(alert)}
                          className="flex-1 bg-[#27AE60] hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Gestionar
                        </Button>
                        <Button
                          onClick={() => dismissAlert(alert.id)}
                          variant="outline"
                          size="sm"
                          className="border-zinc-300 dark:border-zinc-700"
                        >
                          Archivar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Panel de Configuración */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-[#0055A4]" />
                  <h3 className="text-zinc-900 dark:text-white font-semibold">Configuración de Alertas</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled" className="text-sm text-zinc-700 dark:text-zinc-300">
                      Sistema de alertas
                    </Label>
                    <Switch
                      id="enabled"
                      checked={alertSettings.enabled}
                      onCheckedChange={(checked) => {
                        setAlertSettings({ ...alertSettings, enabled: checked });
                        toast.success(checked ? 'Alertas activadas' : 'Alertas desactivadas');
                      }}
                      className="data-[state=checked]:bg-[#27AE60]"
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                      ⏰ ¿Cuándo avisar?
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="days30" className="text-sm text-zinc-700 dark:text-zinc-300">
                          30 días antes
                        </Label>
                        <Switch
                          id="days30"
                          checked={alertSettings.days30}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, days30: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="days15" className="text-sm text-zinc-700 dark:text-zinc-300">
                          15 días antes
                        </Label>
                        <Switch
                          id="days15"
                          checked={alertSettings.days15}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, days15: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="days5" className="text-sm text-zinc-700 dark:text-zinc-300">
                          5 días antes
                        </Label>
                        <Switch
                          id="days5"
                          checked={alertSettings.days5}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, days5: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                      📬 Canales de Notificación
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          <Label htmlFor="email" className="text-sm text-zinc-700 dark:text-zinc-300">
                            Email
                          </Label>
                        </div>
                        <Switch
                          id="email"
                          checked={alertSettings.emailNotifications}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, emailNotifications: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          <Label htmlFor="whatsapp" className="text-sm text-zinc-700 dark:text-zinc-300">
                            WhatsApp
                          </Label>
                        </div>
                        <Switch
                          id="whatsapp"
                          checked={alertSettings.whatsappNotifications}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, whatsappNotifications: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                      📊 Reportes Automáticos
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily" className="text-sm text-zinc-700 dark:text-zinc-300">
                          Resumen diario
                        </Label>
                        <Switch
                          id="daily"
                          checked={alertSettings.dailyDigest}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, dailyDigest: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly" className="text-sm text-zinc-700 dark:text-zinc-300">
                          Reporte semanal
                        </Label>
                        <Switch
                          id="weekly"
                          checked={alertSettings.weeklyReport}
                          onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, weeklyReport: checked })}
                          className="data-[state=checked]:bg-[#27AE60]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-[#0055A4] hover:bg-blue-700 text-white"
                  onClick={() => toast.success('Configuración guardada')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </Card>

            {/* Valor Agregado */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-[#27AE60]/30">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-[#27AE60]/20 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#27AE60]" />
                  </div>
                  <div>
                    <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">
                      Protección Legal Garantizada
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      💼 Evita multas y responsabilidad civil<br/>
                      📉 Reduce primas de seguros hasta 30%<br/>
                      📋 Auditoría ISO lista en segundos
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
