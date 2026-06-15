import { useState } from 'react';
import { 
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Zap,
  Clock,
  MessageSquare,
  ClipboardList,
  Package,
  History,
  LayoutDashboard,
  Building2,
  UserCheck,
  Files,
  Wrench,
  BarChart3,
  Send,
  Lock,
  Bell,
  Target,
  AlertOctagon,
  ShieldAlert,
  Wifi,
  WifiOff,
  MapPin,
  Folders,
  FileSignature,
  FolderOpen,
  QrCode
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AutomaticAlertBanner } from '@/app/components/AutomaticAlertBanner';
import { toast } from 'sonner';

interface FieldActionCenterProps {
  onBack: () => void;
  onStartTalk: () => void;
  onNewInspection: () => void;
  onReportIncident: () => void;
  onInspectionMode: () => void;
  onViewTimeline: () => void;
  onViewCalendar?: () => void;
  onViewDocumentVault?: () => void;
  onViewDashboard?: () => void;
  onViewStatistics?: () => void;
  onViewRemoteSignature?: () => void;
  onViewEnhancedVault?: () => void;
  onViewWorkerManagement?: () => void;
  onViewTalkAndDelivery?: () => void;
  onViewAssetInventory?: () => void;
  onViewExecutiveDashboard?: () => void;
  onViewSecurityCenter?: () => void;
  onViewDocumentDelivery?: () => void;
  onViewUnifiedAlerts?: () => void;
  onViewMonthlyPlan?: () => void;
  onViewAccidentMode?: () => void;
  onViewContractorPortal?: () => void;
  onViewQRManager?: () => void;
  isOnline?: boolean;
}

export function FieldActionCenter({ 
  onBack,
  onStartTalk,
  onNewInspection,
  onReportIncident,
  onInspectionMode,
  onViewTimeline,
  onViewCalendar,
  onViewDocumentVault,
  onViewDashboard,
  onViewStatistics,
  onViewRemoteSignature,
  onViewEnhancedVault,
  onViewWorkerManagement,
  onViewTalkAndDelivery,
  onViewAssetInventory,
  onViewExecutiveDashboard,
  onViewSecurityCenter,
  onViewDocumentDelivery,
  onViewUnifiedAlerts,
  onViewMonthlyPlan,
  onViewAccidentMode,
  onViewContractorPortal,
  onViewQRManager,
  isOnline = true 
}: FieldActionCenterProps) {
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(true);
  
  const currentDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleScheduleMaintenance = () => {
    setShowMaintenanceAlert(false);
    if (onViewCalendar) {
      onViewCalendar();
    }
  };

  const handleDismissAlert = () => {
    setShowMaintenanceAlert(false);
    toast.info('Alerta recordada para más tarde', {
      description: 'Te volveremos a notificar en 1 hora'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors">
      {/* Automatic Alert Banner */}
      {showMaintenanceAlert && (
        <AutomaticAlertBanner
          onSchedule={handleScheduleMaintenance}
          onDismiss={handleDismissAlert}
        />
      )}
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Cambiar Empresa</span>
            </button>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">Sincronizado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">Offline</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl mb-1">Constructora Los Andes S.A.</h1>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4" />
            <span>Sucursal Maipú - Av. Pajaritos 1234</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">{currentDate}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
        {/* Acciones Principales - Grid 2x2 en mobile, 4 columnas en desktop */}
        <div>
          <h2 className="text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#FF8C00] rounded-full" />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Charla 5 minutos */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onStartTalk}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <MessageSquare className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Iniciar Charla</h3>
                <p className="text-xs text-white/80">5 minutos</p>
              </div>
            </Card>

            {/* Nueva Inspección */}
            <Card 
              className="bg-gradient-to-br from-[#0055A4] to-blue-700 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onNewInspection}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <ClipboardList className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Inspección</h3>
                <p className="text-xs text-white/80">Nueva</p>
              </div>
            </Card>

            {/* Reportar Incidente */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onReportIncident}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-3">
                  <AlertTriangle className="w-6 h-6 lg:w-7 lg:h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium mb-1 text-sm lg:text-base">Incidente</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">Reportar</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Resumen del Día + Modo Fiscalización */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Actividades de Hoy */}
          <Card className="lg:col-span-2 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <div className="p-5">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF8C00]" />
                Actividades de Hoy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700 dark:text-zinc-300">Charlas realizadas</span>
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl text-green-900 dark:text-green-300 font-semibold">2/3</div>
                  <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs mt-2">
                    66% completado
                  </Badge>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700 dark:text-zinc-300">Inspecciones</span>
                    <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl text-amber-900 dark:text-amber-300 font-semibold">1</div>
                  <Badge className="bg-amber-600/20 text-amber-700 dark:text-amber-400 border-0 text-xs mt-2">
                    Pendiente
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={onViewTimeline}
                variant="outline" 
                className="w-full border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Ver Línea de Tiempo Completa
              </Button>
            </div>
          </Card>

          {/* Modo Fiscalización */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <QrCode className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Modo Fiscalización</h3>
                  <p className="text-sm text-slate-700 dark:text-zinc-300">
                    Botón de pánico documental para inspecciones
                  </p>
                </div>
              </div>
              <Button 
                onClick={onInspectionMode}
                className="w-full bg-red-600 hover:bg-red-700 text-white border-0 mt-auto"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Activar Ahora
              </Button>
            </div>
          </Card>
        </div>

        {/* Navegación y Herramientas */}
        <div>
          <h2 className="text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            Navegación y Herramientas
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {/* Ver Calendario */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#FF8C00] dark:hover:border-orange-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewCalendar}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl mb-3">
                  <Calendar className="w-6 h-6 text-[#FF8C00]" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Calendario</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Itinerario</p>
              </div>
            </Card>

            {/* Bóveda Documental */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#0055A4] dark:hover:border-blue-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewEnhancedVault}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mb-3">
                  <Folders className="w-6 h-6 text-[#0055A4] dark:text-blue-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Bóveda</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Documentos</p>
              </div>
            </Card>

            {/* Firma Remota */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-green-600 dark:hover:border-green-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewRemoteSignature}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mb-3">
                  <FileSignature className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Firmas</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Remotas</p>
              </div>
            </Card>

            {/* Gestión de Trabajadores - NUEVO */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-indigo-600 dark:hover:border-indigo-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewWorkerManagement}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl mb-3">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Trabajadores</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Nómina</p>
              </div>
            </Card>

            {/* Dashboard */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-purple-600 dark:hover:border-purple-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewDashboard}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Dashboard</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Cumplimiento</p>
              </div>
            </Card>

            {/* Estadísticas */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-cyan-600 dark:hover:border-cyan-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewStatistics}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-xl mb-3">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Estadísticas</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Análisis</p>
              </div>
            </Card>

            {/* Inventario de Activos */}
            <Card 
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-gray-600 dark:hover:border-gray-600 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewAssetInventory}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-xl mb-3">
                  <Wrench className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm">Activos</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Inventario</p>
              </div>
            </Card>

            {/* Dashboard Ejecutivo */}
            <Card 
              className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-blue-500 dark:border-blue-600 cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={onViewExecutiveDashboard}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm">Business Intelligence</h3>
                <p className="text-xs text-white/80 mt-1">Dashboard Ejecutivo</p>
              </div>
            </Card>

            {/* Centro de Seguridad */}
            <Card 
              className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={onViewSecurityCenter}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-red-500/20 p-3 rounded-xl mb-3">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-red-600 dark:text-red-400 font-bold text-sm">Centro de Seguridad</h3>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Configuración y Monitoreo</p>
              </div>
            </Card>

            {/* Entrega de Documentos */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewDocumentDelivery}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <FolderOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Entrega Documentos</h3>
                <p className="text-xs text-white/80">Firmar</p>
              </div>
            </Card>

            {/* Alertas Unificadas */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewUnifiedAlerts}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Alertas Unificadas</h3>
                <p className="text-xs text-white/80">Monitoreo</p>
              </div>
            </Card>

            {/* Plan Mensual */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewMonthlyPlan}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Plan Mensual</h3>
                <p className="text-xs text-white/80">Ver</p>
              </div>
            </Card>

            {/* Modo Accidente */}
            <Card 
              className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={onViewAccidentMode}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-red-500/20 p-3 rounded-xl mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-red-600 dark:text-red-400 font-bold text-sm">Modo Accidente</h3>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Activar</p>
              </div>
            </Card>

            {/* Portal de Contratistas */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewContractorPortal}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <FolderOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Portal de Contratistas</h3>
                <p className="text-xs text-white/80">Acceder</p>
              </div>
            </Card>

            {/* Gestión de QR */}
            <Card 
              className="bg-gradient-to-br from-[#FF8C00] to-orange-600 border-0 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
              onClick={onViewQRManager}
            >
              <div className="p-4 lg:p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-xl mb-3">
                  <QrCode className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 text-sm lg:text-base">Gestión de QR</h3>
                <p className="text-xs text-white/80">Administrar</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}