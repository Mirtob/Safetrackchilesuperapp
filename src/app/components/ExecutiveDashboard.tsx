import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  DollarSign,
  Shield,
  Users,
  Building2,
  Calendar,
  Settings,
  Zap
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { IncidentDashboardWidget } from '@/app/components/IncidentDashboardWidget';
import { toast } from 'sonner';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface ExecutiveDashboardProps {
  onBack: () => void;
  onViewFinancialImpact?: () => void;
  onViewBranchRisk?: () => void;
  onViewAPIConfig?: () => void;
  companyId?: string;
}

type TimeRange = 'week' | 'month' | 'year';

export function ExecutiveDashboard({
  onBack,
  onViewFinancialImpact,
  onViewBranchRisk,
  onViewAPIConfig,
  companyId
}: ExecutiveDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Data para Gauges (Velocímetros)
  const gaugesData = [
    { 
      id: 'compliance', 
      name: 'Cumplimiento Legal', 
      value: 92, 
      max: 100,
      color: '#27AE60',
      icon: Shield,
      description: 'ISO 45001 + Ley 16.744'
    },
    { 
      id: 'assets', 
      name: 'Salud de Activos', 
      value: 78, 
      max: 100,
      color: '#F2C94C',
      icon: Zap,
      description: 'Equipos en servicio'
    },
    { 
      id: 'training', 
      name: 'Capacitación del Personal', 
      value: 85, 
      max: 100,
      color: '#0055A4',
      icon: Users,
      description: 'Personal certificado'
    }
  ];

  // Data para impacto financiero
  const financialData = [
    { category: 'Multas Detectadas', potencial: 15000000, mitigado: 14500000 },
    { category: 'Incidentes Prevenidos', potencial: 8000000, mitigado: 7800000 },
    { category: 'Equipo sin Certificar', potencial: 3500000, mitigado: 3200000 },
    { category: 'Horas Perdidas Evitadas', potencial: 5000000, mitigado: 4800000 }
  ];

  const totalPotencial = financialData.reduce((sum, item) => sum + item.potencial, 0);
  const totalMitigado = financialData.reduce((sum, item) => sum + item.mitigado, 0);
  const ahorroTotal = totalPotencial - totalMitigado;

  // Tendencia mensual
  const trendData = [
    { month: 'Ene', compliance: 88, assets: 75, training: 82 },
    { month: 'Feb', compliance: 89, assets: 76, training: 83 },
    { month: 'Mar', compliance: 90, assets: 77, training: 84 },
    { month: 'Abr', compliance: 91, assets: 77, training: 84 },
    { month: 'May', compliance: 92, assets: 78, training: 85 }
  ];

  const exportReport = () => {
    toast.success('Exportando reporte ejecutivo', {
      description: 'Generando PDF para presentación gerencial...'
    });
  };

  const shareAPI = () => {
    toast.success('Datos disponibles vía API', {
      description: 'Tu equipo de IT puede integrar estos datos en tiempo real.'
    });
  };

  const getGaugeColor = (value: number) => {
    if (value >= 85) return '#27AE60';
    if (value >= 70) return '#F2C94C';
    return '#EB5757';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-white text-xl lg:text-2xl font-bold">Executive Business Intelligence</h1>
                <p className="text-sm text-white/60">Dashboard de alto nivel para gerencia</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportReport}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hidden lg:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                onClick={shareAPI}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">API</span>
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button
              onClick={() => setTimeRange('week')}
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              className={
                timeRange === 'week'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              Semana
            </Button>
            <Button
              onClick={() => setTimeRange('month')}
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              className={
                timeRange === 'month'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              Mes
            </Button>
            <Button
              onClick={() => setTimeRange('year')}
              variant={timeRange === 'year' ? 'default' : 'outline'}
              size="sm"
              className={
                timeRange === 'year'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              Año
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Valor Agregado Banner */}
        <Card className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/30 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl flex-shrink-0">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">💰 Ahorro Total Identificado</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-3">
                  ${(totalPotencial / 1000000).toFixed(1)}M CLP
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong>Responsabilidad Civil Cubierta:</strong> Nuestro sistema ha detectado y mitigado riesgos que podrían generar multas por <span className="text-emerald-400 font-semibold">${(totalMitigado / 1000000).toFixed(1)}M CLP</span>. 
                  <br/>
                  <strong>Reducción en Seguros:</strong> Control digitalizado = hasta 30% menos en primas. 
                  <br/>
                  <strong>Auditoría ISO en Segundos:</strong> Exporta datos certificados para ISO 45001 o Mutualidades sin buscar papeles.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Gauges (Velocímetros) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gaugesData.map((gauge) => {
            const GaugeIcon = gauge.icon;
            const percentage = (gauge.value / gauge.max) * 100;
            const gaugeColor = getGaugeColor(percentage);
            
            return (
              <Card key={gauge.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-lg">
                        <GaugeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{gauge.name}</h3>
                        <p className="text-white/60 text-xs">{gauge.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gauge Visual */}
                  <div className="relative h-40 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        barSize={20}
                        data={[{ name: gauge.name, value: percentage, fill: gaugeColor }]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background={{ fill: 'rgba(255,255,255,0.1)' }}
                          dataKey="value"
                          cornerRadius={10}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-white">{gauge.value}%</div>
                      <div className="text-xs text-white/60">de {gauge.max}%</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {percentage >= 85 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Excelente</span>
                      </>
                    ) : percentage >= 70 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-yellow-400">Requiere atención</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">Crítico</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tendencia Mensual */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Tendencia de Indicadores (5 meses)</h3>
                <p className="text-white/60 text-sm">Evolución de métricas clave</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">+4.5% promedio</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="#27AE60" 
                  strokeWidth={3}
                  name="Cumplimiento Legal"
                  dot={{ fill: '#27AE60', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="assets" 
                  stroke="#F2C94C" 
                  strokeWidth={3}
                  name="Salud de Activos"
                  dot={{ fill: '#F2C94C', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="training" 
                  stroke="#0055A4" 
                  strokeWidth={3}
                  name="Capacitación"
                  dot={{ fill: '#0055A4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-500/30 backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">248</div>
              <p className="text-emerald-400 text-sm">Inspecciones Completadas</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30 backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">1,247</div>
              <p className="text-blue-400 text-sm">Trabajadores Capacitados</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">12 activas</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">15</div>
              <p className="text-purple-400 text-sm">Sucursales Gestionadas</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500/30 backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-amber-400" />
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">3</div>
              <p className="text-amber-400 text-sm">Incidentes (↓62% vs año anterior)</p>
            </div>
          </Card>
        </div>

        {/* Módulos de Acceso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onViewFinancialImpact?.()}>
            <div className="p-6">
              <DollarSign className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Impacto Financiero</h3>
              <p className="text-white/60 text-sm mb-4">
                Visualiza multas potenciales vs costo de mitigación en tiempo real
              </p>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                Ver Análisis
              </Button>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onViewBranchRisk?.()}>
            <div className="p-6">
              <Building2 className="w-10 h-10 text-amber-400 mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Mapa de Riesgo</h3>
              <p className="text-white/60 text-sm mb-4">
                Ranking de sucursales por nivel de cumplimiento y riesgo
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                Ver Ranking
              </Button>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onViewAPIConfig?.()}>
            <div className="p-6">
              <Settings className="w-10 h-10 text-cyan-400 mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Integración API</h3>
              <p className="text-white/60 text-sm mb-4">
                Conecta con SAP, PowerBI o tu Intranet corporativa
              </p>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                Configurar
              </Button>
            </div>
          </Card>
        </div>

        {/* Widget de Incidentes y Accidentes */}
        <div className="bg-white/5 border-white/10 backdrop-blur-sm rounded-xl p-6">
          <IncidentDashboardWidget
            compact={false}
            companyId={companyId}
            onViewDetails={(id) => {
              toast.info(`Abriendo detalles del incidente ${id}`);
            }}
            onViewAll={() => {
              toast.info('Abriendo sistema completo de seguimiento de incidentes');
            }}
          />
        </div>
      </div>
    </div>
  );
}