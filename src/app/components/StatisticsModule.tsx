import { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { CausalityAlert } from '@/app/components/CausalityAlert';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface StatisticsModuleProps {
  onBack: () => void;
  onViewCausalAnalysis: () => void;
  onViewInspections?: (category: string) => void;
}

// Datos de rendimiento por sucursal
const branchPerformanceData = [
  { sucursal: 'Maipú', cumplimiento: 92, incidentes: 2, capacitaciones: 24 },
  { sucursal: 'Centro', cumplimiento: 88, incidentes: 4, capacitaciones: 20 },
  { sucursal: 'Puente Alto', cumplimiento: 85, incidentes: 3, capacitaciones: 22 },
  { sucursal: 'Las Condes', cumplimiento: 95, incidentes: 1, capacitaciones: 26 },
  { sucursal: 'Providencia', cumplimiento: 90, incidentes: 2, capacitaciones: 23 }
];

// Evolución de indicadores SUSESO
const susesoTrendData = [
  { mes: 'Ene', frecuencia: 2.3, gravedad: 45, accidentabilidad: 1.8 },
  { mes: 'Feb', frecuencia: 1.8, gravedad: 38, accidentabilidad: 1.5 },
  { mes: 'Mar', frecuencia: 2.1, gravedad: 42, accidentabilidad: 1.7 },
  { mes: 'Abr', frecuencia: 1.5, gravedad: 35, accidentabilidad: 1.3 },
  { mes: 'May', frecuencia: 1.2, gravedad: 30, accidentabilidad: 1.0 },
  { mes: 'Jun', frecuencia: 1.0, gravedad: 28, accidentabilidad: 0.8 }
];

// Distribución de actividades
const activityDistributionData = [
  { actividad: 'Charlas', cantidad: 156, color: '#FF8C00' },
  { actividad: 'Inspecciones', cantidad: 89, color: '#0055A4' },
  { actividad: 'Capacitaciones', cantidad: 134, color: '#22c55e' },
  { actividad: 'ODI', cantidad: 67, color: '#eab308' },
  { actividad: 'Auditorías', cantidad: 45, color: '#a855f7' }
];

// Cumplimiento por área
const complianceByAreaData = [
  { area: 'EPP', cumplimiento: 95 },
  { area: 'Capacitación', cumplimiento: 88 },
  { area: 'Documentación', cumplimiento: 92 },
  { area: 'Infraestructura', cumplimiento: 85 },
  { area: 'Equipos', cumplimiento: 90 },
  { area: 'Procedimientos', cumplimiento: 87 }
];

// Proyección de mejora
const improvementProjectionData = [
  { mes: 'Jul', real: 92, proyectado: 93 },
  { mes: 'Ago', real: null, proyectado: 94 },
  { mes: 'Sep', real: null, proyectado: 95 },
  { mes: 'Oct', real: null, proyectado: 96 },
  { mes: 'Nov', real: null, proyectado: 97 },
  { mes: 'Dic', real: null, proyectado: 98 }
];

export function StatisticsModule({ onBack, onViewCausalAnalysis, onViewInspections }: StatisticsModuleProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">Módulo de Estadísticas</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Análisis integral de gestión preventiva</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="hidden sm:flex bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    selectedPeriod === 'month'
                      ? 'bg-[#FF8C00] text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setSelectedPeriod('quarter')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    selectedPeriod === 'quarter'
                      ? 'bg-[#FF8C00] text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Trimestre
                </button>
                <button
                  onClick={() => setSelectedPeriod('year')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    selectedPeriod === 'year'
                      ? 'bg-[#FF8C00] text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Año
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Cumplimiento Global</span>
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">92%</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                +5% vs anterior
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Tasa Frecuencia</span>
                <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">1.0</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                -16.7% mejora
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 dark:text-orange-400 text-sm">Actividades Realizadas</span>
                <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-3xl text-orange-900 dark:text-orange-300 mb-1">491</div>
              <Badge className="bg-orange-600/20 text-orange-700 dark:text-orange-400 border-0 text-xs">
                Meta: 500
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-700 dark:text-purple-400 text-sm">Trabajadores Capacitados</span>
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl text-purple-900 dark:text-purple-300 mb-1">847</div>
              <Badge className="bg-purple-600/20 text-purple-700 dark:text-purple-400 border-0 text-xs">
                95% cobertura
              </Badge>
            </div>
          </Card>
        </div>

        {/* 🔥 SISTEMA DE ALERTA DE CAUSALIDAD CONECTADA */}
        <CausalityAlert
          type="caidas"
          trend="up"
          percentage={15}
          currentValue={8}
          previousValue={7}
          relatedInspections={{
            total: 23,
            failed: 8,
            category: 'superficies_trabajo'
          }}
          onViewCausalAnalysis={onViewCausalAnalysis}
          onViewRelatedInspections={() => {
            onViewInspections?.('superficies_trabajo');
          }}
        />

        {/* Análisis Causal - CTA */}
        <Card className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-700">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-[#FF8C00]/20 p-3 rounded-lg">
                  <Brain className="w-8 h-8 text-[#FF8C00]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-zinc-900 dark:text-white text-lg mb-2">Análisis Causal de Accidentes</h3>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                    Investigación profunda con metodología Ishikawa, 5 Porqués y análisis de barreras. 
                    Identifica causas raíz y genera recomendaciones preventivas basadas en datos.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      27 incidentes analizados
                    </Badge>
                    <Badge className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      23 análisis completados
                    </Badge>
                    <Badge className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      78% eficacia preventiva
                    </Badge>
                  </div>
                  <Button 
                    onClick={onViewCausalAnalysis}
                    className="bg-[#FF8C00] hover:bg-orange-600 text-white"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Acceder al Análisis Causal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolución SUSESO */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <h3 className="text-zinc-900 dark:text-white mb-1">Indicadores SUSESO</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Evolución últimos 6 meses</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={susesoTrendData}>
                  <defs>
                    <linearGradient id="colorFrecuencia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGravedad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0055A4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0055A4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-zinc-800)',
                      border: '1px solid var(--color-zinc-700)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="frecuencia" 
                    stroke="#FF8C00" 
                    fillOpacity={1} 
                    fill="url(#colorFrecuencia)"
                    name="Tasa Frecuencia"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gravedad" 
                    stroke="#0055A4" 
                    fillOpacity={1} 
                    fill="url(#colorGravedad)"
                    name="Tasa Gravedad"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Rendimiento por sucursal */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <h3 className="text-zinc-900 dark:text-white mb-1">Ranking de Sucursales</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Cumplimiento por ubicación</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                  <XAxis type="number" stroke="#6b7280" domain={[0, 100]} />
                  <YAxis dataKey="sucursal" type="category" stroke="#6b7280" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-zinc-800)',
                      border: '1px solid var(--color-zinc-700)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="cumplimiento" fill="#22c55e" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Distribución de actividades */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <h3 className="text-zinc-900 dark:text-white mb-1">Distribución de Actividades</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Total del período</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ actividad, cantidad }) => `${actividad}: ${cantidad}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {activityDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cumplimiento por área */}
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <h3 className="text-zinc-900 dark:text-white mb-1">Cumplimiento por Área</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Evaluación detallada</p>
              <div className="space-y-4">
                {complianceByAreaData.map((item) => (
                  <div key={item.area}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.area}</span>
                      <span className="text-sm text-zinc-900 dark:text-white font-medium">{item.cumplimiento}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.cumplimiento >= 90 ? 'bg-green-500' :
                          item.cumplimiento >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.cumplimiento}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Proyección de mejora */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-zinc-900 dark:text-white mb-1">Proyección de Mejora</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Basado en tendencia actual</p>
              </div>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0">
                Meta 98% Dic 2026
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={improvementProjectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                <XAxis dataKey="mes" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[90, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-zinc-800)',
                    border: '1px solid var(--color-zinc-700)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="real" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Cumplimiento Real"
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="proyectado" 
                  stroke="#FF8C00" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Proyección"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}