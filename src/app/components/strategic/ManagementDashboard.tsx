import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, Clock, Building2, Shield, DollarSign, TrendingDown as TrendingDownIcon, Percent, Calendar, Target, Award } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

const COMPLIANCE_DATA = [
  { month: 'Jul', cumplimiento: 85, incidentes: 3 },
  { month: 'Ago', cumplimiento: 88, incidentes: 2 },
  { month: 'Sep', cumplimiento: 92, incidentes: 1 },
  { month: 'Oct', cumplimiento: 90, incidentes: 2 },
  { month: 'Nov', cumplimiento: 94, incidentes: 1 },
  { month: 'Dic', cumplimiento: 96, incidentes: 0 },
  { month: 'Ene', cumplimiento: 95, incidentes: 1 }
];

const RISK_DISTRIBUTION = [
  { name: 'Bajo', value: 35, color: '#10b981' },
  { name: 'Medio', value: 45, color: '#f59e0b' },
  { name: 'Alto', value: 20, color: '#ef4444' }
];

const COMPANY_METRICS = [
  { company: 'Constructora Los Andes', workers: 245, compliance: 96, incidents: 1, risk: 'Alto', investmentPerWorker: 85000 },
  { company: 'Minera Atacama Norte', workers: 520, compliance: 94, incidents: 2, risk: 'Alto', investmentPerWorker: 120000 },
  { company: 'Transportes Cruz del Sur', workers: 380, compliance: 98, incidents: 0, risk: 'Medio', investmentPerWorker: 65000 },
  { company: 'Forestal Bio-Bío', workers: 195, compliance: 92, incidents: 1, risk: 'Alto', investmentPerWorker: 75000 }
];

// Datos de impacto económico
const ECONOMIC_IMPACT_DATA = [
  { month: 'Jul', inversion: 12.5, costosEvitados: 45.2, multas: 0, roi: 261 },
  { month: 'Ago', inversion: 12.5, costosEvitados: 38.5, multas: 0, roi: 208 },
  { month: 'Sep', inversion: 12.5, costosEvitados: 52.3, multas: 0, roi: 318 },
  { month: 'Oct', inversion: 12.5, costosEvitados: 41.8, multas: 0, roi: 234 },
  { month: 'Nov', inversion: 12.5, costosEvitados: 48.9, multas: 0, roi: 291 },
  { month: 'Dic', inversion: 12.5, costosEvitados: 55.7, multas: 0, roi: 346 },
  { month: 'Ene', inversion: 12.5, costosEvitados: 49.2, multas: 0, roi: 294 }
];

// Desglose de costos evitados
const COST_BREAKDOWN = [
  { name: 'Accidentes evitados', value: 156.4, color: '#10b981' },
  { name: 'Días perdidos reducidos', value: 87.3, color: '#3b82f6' },
  { name: 'Multas evitadas', value: 45.6, color: '#8b5cf6' },
  { name: 'Reducción seguros', value: 42.3, color: '#f59e0b' }
];

// Métricas de eficiencia
const EFFICIENCY_METRICS = [
  { month: 'Jul', tasaFrecuencia: 2.8, tasaGravedad: 180, diasPerdidos: 12 },
  { month: 'Ago', tasaFrecuencia: 2.1, tasaGravedad: 145, diasPerdidos: 9 },
  { month: 'Sep', tasaFrecuencia: 1.5, tasaGravedad: 98, diasPerdidos: 5 },
  { month: 'Oct', tasaFrecuencia: 1.8, tasaGravedad: 112, diasPerdidos: 7 },
  { month: 'Nov', tasaFrecuencia: 1.2, tasaGravedad: 85, diasPerdidos: 4 },
  { month: 'Dic', tasaFrecuencia: 0.8, tasaGravedad: 52, diasPerdidos: 2 },
  { month: 'Ene', tasaFrecuencia: 1.1, tasaGravedad: 71, diasPerdidos: 3 }
];

export function ManagementDashboard() {
  const totalWorkers = COMPANY_METRICS.reduce((sum, c) => sum + c.workers, 0);
  const avgCompliance = COMPANY_METRICS.reduce((sum, c) => sum + c.compliance, 0) / COMPANY_METRICS.length;
  const totalIncidents = COMPANY_METRICS.reduce((sum, c) => sum + c.incidents, 0);
  
  // Cálculos económicos
  const monthlyInvestment = 12.5; // millones CLP
  const monthlyCostsAvoided = 49.2; // millones CLP (promedio último mes)
  const monthlyROI = 294; // porcentaje
  const totalCostsAvoided = ECONOMIC_IMPACT_DATA.reduce((sum, d) => sum + d.costosEvitados, 0);
  const totalInvestment = ECONOMIC_IMPACT_DATA.reduce((sum, d) => sum + d.inversion, 0);
  const totalROI = ((totalCostsAvoided - totalInvestment) / totalInvestment * 100);

  // Comparativa industria
  const industryAvgAccidentRate = 3.2;
  const ourAccidentRate = 1.1;
  const reductionVsIndustry = ((industryAvgAccidentRate - ourAccidentRate) / industryAvgAccidentRate * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          💼 Dashboard Gerencial Ejecutivo
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Impacto económico, ROI y métricas estratégicas de gestión de seguridad
        </p>
      </div>

      {/* KPIs Económicos Principales */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Impacto Económico de la Gestión de Seguridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">
                  7 meses
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${totalCostsAvoided.toFixed(1)}M
              </div>
              <p className="text-green-100 text-sm">Costos evitados acumulados</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+{((monthlyCostsAvoided / 45) * 100 - 100).toFixed(1)}% vs. promedio</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">
                  ROI
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">
                {totalROI.toFixed(0)}%
              </div>
              <p className="text-blue-100 text-sm">Retorno de inversión total</p>
              <div className="mt-2 text-sm">
                Cada $1 invertido genera ${(totalCostsAvoided / totalInvestment).toFixed(2)}
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">
                  Este mes
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">
                $0.0M
              </div>
              <p className="text-purple-100 text-sm">Multas evitadas</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>100% cumplimiento normativo</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Percent className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">
                  vs. Industria
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">
                {reductionVsIndustry.toFixed(0)}%
              </div>
              <p className="text-orange-100 text-sm">Mejor que promedio industria</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingDownIcon className="w-4 h-4" />
                <span>{ourAccidentRate.toFixed(1)} vs {industryAvgAccidentRate.toFixed(1)} tasa</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* KPIs Operacionales */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Métricas Operacionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8 text-[#0055A4]" />
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-0">
                  4 empresas
                </Badge>
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {totalWorkers.toLocaleString('es-CL')}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Trabajadores activos</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {avgCompliance.toFixed(1)}%
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Cumplimiento normativo</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-0">
                  Este mes
                </Badge>
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {totalIncidents}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Incidentes reportados</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
                <TrendingDownIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                3
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Días perdidos (mes)</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráficos Económicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI y Costos Evitados */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              ROI de la Inversión en Seguridad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ECONOMIC_IMPACT_DATA}>
                <defs>
                  <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => `$${value.toFixed(1)}M CLP`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="inversion"
                  name="Inversión"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorInversion)"
                />
                <Area
                  type="monotone"
                  dataKey="costosEvitados"
                  name="Costos Evitados"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCostos)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                💡 ROI promedio: {totalROI.toFixed(0)}% • Por cada $1 invertido, se evitan ${(totalCostsAvoided / totalInvestment).toFixed(2)} en costos
              </p>
            </div>
          </div>
        </Card>

        {/* Desglose de Costos Evitados */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Desglose de Costos Evitados (7 meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(1)}M`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COST_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => `$${value.toFixed(1)}M CLP`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {COST_BREAKDOWN.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Métricas de Eficiencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasas de Frecuencia y Gravedad */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Indicadores de Accidentabilidad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={EFFICIENCY_METRICS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasaFrecuencia"
                  name="Tasa de Frecuencia"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="tasaGravedad"
                  name="Tasa de Gravedad"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                📉 Reducción del 65% en tasa de frecuencia vs. promedio industria ({industryAvgAccidentRate.toFixed(1)})
              </p>
            </div>
          </div>
        </Card>

        {/* Tendencia de Cumplimiento */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Evolución de Cumplimiento Normativo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={COMPLIANCE_DATA}>
                <defs>
                  <linearGradient id="colorCumplimiento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[80, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumplimiento"
                  name="Cumplimiento (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumplimiento)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-900 dark:text-green-100">
                🎯 Meta: ≥95% cumplimiento • Actual: {avgCompliance.toFixed(1)}% (✅ cumplida)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribución de Riesgos y Días Perdidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Distribución de Riesgos en Cartera
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Días Perdidos por Accidentes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={EFFICIENCY_METRICS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="diasPerdidos" name="Días Perdidos" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                💰 Costo promedio por día perdido: $850.000 CLP • Total evitado: $2.6M este mes
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de empresas mejorada */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0055A4]" />
            Métricas por Empresa Cliente
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Empresa
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Trabajadores
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Inversión/Trab.
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Cumplimiento
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Incidentes
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    Nivel de Riesgo
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPANY_METRICS.map((company, index) => (
                  <tr
                    key={index}
                    className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0055A4]" />
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {company.company}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-900 dark:text-white">
                          {company.workers}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-zinc-900 dark:text-white font-medium">
                          ${(company.investmentPerWorker / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge
                        className={`${
                          company.compliance >= 95
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            : company.compliance >= 90
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}
                      >
                        {company.compliance}%
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span
                        className={`font-semibold ${
                          company.incidents === 0
                            ? 'text-green-600 dark:text-green-400'
                            : company.incidents <= 2
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {company.incidents}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge
                        className={`${
                          company.risk === 'Alto'
                            ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            : company.risk === 'Medio'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                            : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        }`}
                      >
                        {company.risk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                    TOTALES
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-zinc-900 dark:text-white">
                    {totalWorkers}
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-zinc-900 dark:text-white">
                    ${(COMPANY_METRICS.reduce((sum, c) => sum + c.investmentPerWorker, 0) / COMPANY_METRICS.length / 1000).toFixed(0)}k
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-green-600 dark:text-green-400">
                    {avgCompliance.toFixed(1)}%
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-orange-600 dark:text-orange-400">
                    {totalIncidents}
                  </td>
                  <td className="text-center py-4 px-4">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-0">
                      Cartera mixta
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {/* Resumen Ejecutivo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            📊 Resumen Ejecutivo del Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-zinc-900 dark:text-white">Logros Destacados</h4>
              </div>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>✅ ROI de {totalROI.toFixed(0)}% sobre inversión</li>
                <li>✅ ${totalCostsAvoided.toFixed(1)}M en costos evitados</li>
                <li>✅ Cero multas por incumplimiento</li>
                <li>✅ {reductionVsIndustry.toFixed(0)}% mejor que industria</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-zinc-900 dark:text-white">Áreas de Mejora</h4>
              </div>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>⚠️ 3 empresas con riesgo alto</li>
                <li>⚠️ {totalIncidents} incidentes este mes</li>
                <li>⚠️ 1 empresa bajo 95% cumplimiento</li>
                <li>💡 Oportunidad en capacitación</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-zinc-900 dark:text-white">Recomendaciones</h4>
              </div>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>🎯 Reforzar empresas alto riesgo</li>
                <li>🎯 Mantener programa preventivo</li>
                <li>🎯 Auditoría trimestral programada</li>
                <li>🎯 Renovar contrato anual</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
