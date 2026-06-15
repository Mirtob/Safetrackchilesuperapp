import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  X,
  Shield,
  Users,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';

interface ComplianceDashboardEnhancedProps {
  onBack: () => void;
}

// Datos de Tasa de Frecuencia (SUSESO)
const frequencyData = [
  { month: 'Ene', tasa: 2.3 },
  { month: 'Feb', tasa: 1.8 },
  { month: 'Mar', tasa: 2.1 },
  { month: 'Abr', tasa: 1.5 },
  { month: 'May', tasa: 1.2 },
  { month: 'Jun', tasa: 1.0 },
];

// Datos de Tasa de Gravedad
const gravityData = [
  { month: 'Ene', tasa: 45 },
  { month: 'Feb', tasa: 38 },
  { month: 'Mar', tasa: 42 },
  { month: 'Abr', tasa: 35 },
  { month: 'May', tasa: 30 },
  { month: 'Jun', tasa: 28 },
];

// Estado Carpeta de Arranque
const carpetaData = [
  { name: 'Completo', value: 85, color: '#22c55e' },
  { name: 'Pendiente', value: 15, color: '#ef4444' },
];

// Actividades del mes
const activityData = [
  { tipo: 'Charlas', realizadas: 24, programadas: 30 },
  { tipo: 'Inspecciones', realizadas: 12, programadas: 15 },
  { tipo: 'Entrega EPP', realizadas: 45, programadas: 50 },
  { tipo: 'ODI', realizadas: 8, programadas: 10 },
];

// Documentos de la carpeta de arranque
const carpetaDocuments = [
  { id: 1, name: 'Reglamento Interno', status: 'complete', date: '2025-01-15' },
  { id: 2, name: 'Registro de Inducción', status: 'complete', date: '2025-01-20' },
  { id: 3, name: 'Procedimientos de Trabajo Seguro', status: 'complete', date: '2025-01-22' },
  { id: 4, name: 'Plan de Emergencia', status: 'complete', date: '2025-02-01' },
  { id: 5, name: 'Matriz de Riesgos', status: 'complete', date: '2025-02-05' },
  { id: 6, name: 'Actas Comité Paritario', status: 'complete', date: '2025-02-10' },
  { id: 7, name: 'Programa de Prevención', status: 'complete', date: '2025-02-15' },
  { id: 8, name: 'Certificados de Capacitación', status: 'complete', date: '2025-03-01' },
  { id: 9, name: 'Licencias y Permisos', status: 'pending', date: null },
  { id: 10, name: 'Evaluación de Riesgos Psicosociales', status: 'pending', date: null },
];

export function ComplianceDashboardEnhanced({ onBack }: ComplianceDashboardEnhancedProps) {
  const [showCarpetaDetails, setShowCarpetaDetails] = useState(false);

  const handleExport = () => {
    toast.success('📥 Exportando Dashboard', {
      description: 'Se descargará un PDF con todos los indicadores',
      duration: 3000
    });
  };

  const handleViewCarpetaDetails = () => {
    setShowCarpetaDetails(true);
  };

  // Custom Tooltip con modo claro/oscuro
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {entry.name}: <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Modal de detalles de carpeta
  if (showCarpetaDetails) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowCarpetaDetails(false)}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Dashboard</span>
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                  Carpeta de Arranque
                </h1>
                <p className="text-white/80 text-sm">
                  Documentación legal y obligatoria según normativa chilena
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Total Documentos</span>
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {carpetaDocuments.length}
              </div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-800 dark:text-green-300">Completos</span>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                {carpetaDocuments.filter(d => d.status === 'complete').length}
              </div>
            </Card>

            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-800 dark:text-red-300">Pendientes</span>
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-300">
                {carpetaDocuments.filter(d => d.status === 'pending').length}
              </div>
            </Card>
          </div>

          {/* Lista de documentos */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Documentos de la Carpeta
            </h3>
            <div className="space-y-3">
              {carpetaDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      doc.status === 'complete'
                        ? 'bg-green-100 dark:bg-green-950/20'
                        : 'bg-red-100 dark:bg-red-950/20'
                    }`}>
                      {doc.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {doc.name}
                      </h4>
                      {doc.date && (
                        <p className="text-sm text-slate-600 dark:text-zinc-400">
                          Actualizado: {new Date(doc.date).toLocaleDateString('es-CL')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      doc.status === 'complete'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0'
                    }
                  >
                    {doc.status === 'complete' ? 'Completo' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20"
              >
                <Calendar className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Jun 2026</span>
              </Button>
              <Button 
                onClick={handleExport}
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                Dashboard de Cumplimiento
              </h1>
              <p className="text-white/80 text-sm">
                Constructora Los Andes S.A.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tasa de Frecuencia */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-zinc-400 text-sm">Tasa de Frecuencia</span>
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl text-slate-900 dark:text-white mb-1 font-bold">1.0</div>
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0 text-xs">
                -16.7%
              </Badge>
              <span className="text-xs text-slate-500 dark:text-zinc-500">vs mes anterior</span>
            </div>
          </Card>

          {/* Tasa de Gravedad */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-zinc-400 text-sm">Tasa de Gravedad</span>
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl text-slate-900 dark:text-white mb-1 font-bold">28</div>
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0 text-xs">
                -6.7%
              </Badge>
              <span className="text-xs text-slate-500 dark:text-zinc-500">vs mes anterior</span>
            </div>
          </Card>

          {/* Cumplimiento General */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-zinc-400 text-sm">Cumplimiento</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl text-slate-900 dark:text-white mb-1 font-bold">92%</div>
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0 text-xs">
                +5%
              </Badge>
              <span className="text-xs text-slate-500 dark:text-zinc-500">vs mes anterior</span>
            </div>
          </Card>

          {/* Incidentes */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-zinc-400 text-sm">Incidentes</span>
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl text-slate-900 dark:text-white mb-1 font-bold">3</div>
            <div className="flex items-center gap-1">
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-0 text-xs">
                0 graves
              </Badge>
              <span className="text-xs text-slate-500 dark:text-zinc-500">este mes</span>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasa de Frecuencia Chart */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h3 className="text-slate-900 dark:text-white mb-1 font-semibold">Tasa de Frecuencia (SUSESO)</h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" />
                <XAxis dataKey="month" stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <YAxis stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tasa" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', r: 5 }}
                  name="Tasa"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Tasa de Gravedad Chart */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h3 className="text-slate-900 dark:text-white mb-1 font-semibold">Tasa de Gravedad</h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gravityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" />
                <XAxis dataKey="month" stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <YAxis stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tasa" 
                  stroke="#0055A4" 
                  strokeWidth={3}
                  dot={{ fill: '#0055A4', r: 5 }}
                  name="Tasa"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Activity and Carpeta Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividades del Mes */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 lg:col-span-2">
            <h3 className="text-slate-900 dark:text-white mb-1 font-semibold">Actividades del Mes</h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Comparación realizado vs programado</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" />
                <XAxis dataKey="tipo" stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <YAxis stroke="currentColor" className="text-slate-600 dark:text-zinc-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: 'currentColor'
                  }}
                  iconType="circle"
                />
                <Bar dataKey="realizadas" fill="#FF8C00" name="Realizadas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="programadas" fill="#60a5fa" name="Programadas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Carpeta de Arranque */}
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-slate-900 dark:text-white font-semibold">Carpeta de Arranque</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Estado de documentación legal</p>
            
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={carpetaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {carpetaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-600 dark:text-zinc-400">Completo</span>
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-600 dark:text-zinc-400">Pendiente</span>
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">15%</span>
              </div>
            </div>

            <Button 
              onClick={handleViewCarpetaDetails}
              variant="outline"
              className="w-full mt-4 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Ver Detalles
            </Button>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h3 className="text-slate-900 dark:text-white mb-4 font-semibold">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="bg-green-100 dark:bg-green-950/20 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white text-sm font-medium">Charla de 5 minutos completada</p>
                <p className="text-xs text-slate-600 dark:text-zinc-500">Sucursal Maipú • Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="bg-blue-100 dark:bg-blue-950/20 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white text-sm font-medium">Inspección de extintores realizada</p>
                <p className="text-xs text-slate-600 dark:text-zinc-500">Sucursal Centro • Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-950/20 p-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white text-sm font-medium">Incidente menor reportado</p>
                <p className="text-xs text-slate-600 dark:text-zinc-500">Sucursal Puente Alto • Ayer</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
