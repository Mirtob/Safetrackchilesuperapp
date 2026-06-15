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
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Download,
  ArrowLeft,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  Target,
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';

interface ComplianceDashboardProps {
  onBack: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToInspections?: () => void;
  onNavigateToTraining?: () => void;
}

// Datos simplificados
const monthlyTrend = [
  { mes: 'Ene', valor: 88 },
  { mes: 'Feb', valor: 86 },
  { mes: 'Mar', valor: 89 },
  { mes: 'Abr', valor: 90 },
  { mes: 'May', valor: 91 },
  { mes: 'Jun', valor: 92 },
];

export function ComplianceDashboard({ onBack, onNavigateToDocuments, onNavigateToCalendar, onNavigateToInspections, onNavigateToTraining }: ComplianceDashboardProps) {
  
  const handleExportReport = () => {
    toast.loading('Generando reporte de cumplimiento...');
    
    setTimeout(() => {
      // Simular descarga de reporte
      const reportData = {
        empresa: 'Constructora Los Andes S.A.',
        fecha: new Date().toLocaleDateString('es-CL'),
        cumplimiento: '92%',
        documentosVencidos: 3,
        inspeccionesPendientes: 6
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-cumplimiento-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Reporte exportado exitosamente', {
        description: 'El archivo se ha descargado correctamente'
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header Simplificado */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-zinc-900 dark:text-white font-semibold text-2xl">
                  Estado de Cumplimiento
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Constructora Los Andes S.A. • Junio 2026
                </p>
              </div>
            </div>
            <Button className="bg-[#FF8C00] hover:bg-orange-600 text-white shadow-md hidden sm:flex" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        
        {/* 🚨 SECCIÓN CRÍTICA - LO QUE REQUIERE ATENCIÓN HOY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FF8C00]" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Requiere Atención Inmediata
            </h2>
          </div>

          {/* Alertas Críticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alerta 1 - Documentos Vencidos */}
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100">
                        3 Documentos Vencidos
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Requiere renovación legal
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-white border-0">URGENTE</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-800 dark:text-red-200">• Certificado ISO 45001</span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido hace 5 días</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-800 dark:text-red-200">• Plan de Emergencia Obra 3</span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido hace 2 días</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-800 dark:text-red-200">• Acreditación RIOHS</span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Vence hoy</span>
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={onNavigateToDocuments}>
                  Renovar Ahora
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Alerta 2 - Inspecciones Atrasadas */}
            <Card className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-600 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                        6 Inspecciones Pendientes
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Programadas para esta semana
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white border-0">ALTA</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800 dark:text-yellow-200">• Extintores Sector A</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Hoy 15:00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800 dark:text-yellow-200">• Escaleras Obra Centro</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Mañana</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-800 dark:text-yellow-200">• Equipos de Altura</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Miércoles</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-yellow-600 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/30" onClick={onNavigateToCalendar}>
                  Ver Calendario
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 📊 ESTADO ACTUAL - VISTA GENERAL SIMPLE */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0055A4]" />
            Estado Actual
          </h2>

          {/* Indicador Principal - Grande y Claro */}
          <Card className="border-[#0055A4] dark:border-[#0055A4] bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-800">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Score Principal */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0055A4] to-blue-600 flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">92%</div>
                        <div className="text-xs text-blue-100 uppercase tracking-wide">Cumplimiento</div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      Cumplimiento Legal Normativo
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">+5% vs mes anterior</span>
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      47 de 51 requisitos legales cumplidos
                    </p>
                  </div>
                </div>

                {/* Botón de Acción */}
                <Button size="lg" className="bg-[#0055A4] hover:bg-blue-700 text-white shadow-md">
                  Ver Detalle Completo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Métricas Clave - Formato Semáforo Simple */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Métrica 1 - Tasa de Frecuencia */}
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Tasa de Frecuencia
                  </span>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Estado: Óptimo" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">1.0</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">-16.7%</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Meta SUSESO: &lt;2.0
                </p>
              </div>
            </Card>

            {/* Métrica 2 - Tasa de Gravedad */}
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Tasa de Gravedad
                  </span>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Estado: Óptimo" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">28</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">-6.7%</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Bajo el promedio nacional
                </p>
              </div>
            </Card>

            {/* Métrica 3 - Capacitaciones */}
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Capacitaciones
                  </span>
                  <div className="w-3 h-3 rounded-full bg-yellow-500" title="Estado: Alerta" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">24/30</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-600 font-medium">80%</span>
                  </div>
                </div>
                <Progress value={80} className="h-1.5" />
              </div>
            </Card>

            {/* Métrica 4 - Incidentes */}
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Incidentes del Mes
                  </span>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Estado: Controlado" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">3</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-green-600 font-medium">0 graves</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Todos catalogados leves
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* 📈 TENDENCIA SIMPLIFICADA */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            Evolución Últimos 6 Meses
          </h2>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tendencia positiva sostenida • Proyección para julio: <span className="font-semibold text-green-600">93%</span>
                </p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-700" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#71717a" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#71717a"
                    domain={[80, 100]}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Cumplimiento']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#0055A4" 
                    strokeWidth={3}
                    dot={{ fill: '#0055A4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 📋 RESUMEN DE ACTIVIDADES - SIMPLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completadas Esta Semana */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Completado Esta Semana
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Charlas de Seguridad</span>
                  </div>
                  <span className="font-bold text-green-600">8</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Inspecciones</span>
                  </div>
                  <span className="font-bold text-green-600">5</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Entrega EPP</span>
                  </div>
                  <span className="font-bold text-green-600">18</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Documentación Legal */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Carpeta Legal
                </h3>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Documentos al día</span>
                  <span className="font-bold text-zinc-900 dark:text-white">47/51</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">✓ Reglamento Interno</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs">
                    Vigente
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">✓ Plan de Emergencias</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs">
                    Vigente
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">⚠ Certificado ISO 45001</span>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-0 text-xs">
                    Vencido
                  </Badge>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 border-zinc-300 dark:border-zinc-600"
                onClick={onNavigateToDocuments}
              >
                Ver Todo
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 py-4">
          <Clock className="w-3 h-3" />
          <span>Última actualización: Hoy 26 Ene, 14:30 • Datos en tiempo real</span>
        </div>
      </div>
    </div>
  );
}