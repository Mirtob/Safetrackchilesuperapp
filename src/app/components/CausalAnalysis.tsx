import { useState } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Wrench, 
  FileText,
  Zap,
  Brain,
  Target,
  Download
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface CausalAnalysisProps {
  onBack: () => void;
}

// Datos de accidentes por causa raíz
const rootCauseData = [
  { causa: 'Falta de capacitación', casos: 12, porcentaje: 28 },
  { causa: 'EPP inadecuado', casos: 8, porcentaje: 19 },
  { causa: 'Procedimientos no seguidos', casos: 10, porcentaje: 23 },
  { causa: 'Equipos defectuosos', casos: 6, porcentaje: 14 },
  { causa: 'Condiciones inseguras', casos: 7, porcentaje: 16 }
];

// Método Ishikawa - Categorías
const ishikawaData = [
  { categoria: 'Personas', value: 35, color: '#FF8C00' },
  { categoria: 'Equipos', value: 25, color: '#0055A4' },
  { categoria: 'Métodos', value: 20, color: '#22c55e' },
  { categoria: 'Materiales', value: 12, color: '#eab308' },
  { categoria: 'Ambiente', value: 8, color: '#ef4444' }
];

// Tendencia de incidentes
const trendData = [
  { mes: 'Ene', total: 5, graves: 1, leves: 4 },
  { mes: 'Feb', total: 7, graves: 2, leves: 5 },
  { mes: 'Mar', total: 4, graves: 0, leves: 4 },
  { mes: 'Abr', total: 6, graves: 1, leves: 5 },
  { mes: 'May', total: 3, graves: 0, leves: 3 },
  { mes: 'Jun', total: 2, graves: 0, leves: 2 }
];

// Análisis por tipo de lesión
const injuryTypeData = [
  { tipo: 'Golpes', cantidad: 15 },
  { tipo: 'Cortes', cantidad: 8 },
  { tipo: 'Caídas', cantidad: 12 },
  { tipo: 'Atrapamientos', cantidad: 5 },
  { tipo: 'Sobreesfuerzo', cantidad: 7 }
];

// Radar de factores de riesgo
const riskFactorsData = [
  { factor: 'Supervisión', value: 75 },
  { factor: 'Capacitación', value: 60 },
  { factor: 'EPP', value: 85 },
  { factor: 'Mantención', value: 70 },
  { factor: 'Procedimientos', value: 65 },
  { factor: 'Cultura', value: 55 }
];

// Casos destacados para análisis detallado
const featuredCases = [
  {
    id: 1,
    titulo: 'Caída desde altura - Piso 3',
    fecha: '15 Jun 2026',
    gravedad: 'Alta',
    causaRaiz: 'Falta de anclaje de línea de vida',
    metodologia: '5 Porqués',
    acciones: 3,
    estado: 'En progreso'
  },
  {
    id: 2,
    titulo: 'Corte en mano - Área de bodega',
    fecha: '10 Jun 2026',
    gravedad: 'Media',
    causaRaiz: 'Guantes inadecuados para la tarea',
    metodologia: 'Ishikawa',
    acciones: 5,
    estado: 'Completado'
  },
  {
    id: 3,
    titulo: 'Golpe por material - Zona carga',
    fecha: '05 Jun 2026',
    gravedad: 'Baja',
    causaRaiz: 'Área de trabajo no delimitada',
    metodologia: 'Análisis de Barreras',
    acciones: 4,
    estado: 'Completado'
  }
];

const COLORS = ['#FF8C00', '#0055A4', '#22c55e', '#eab308', '#ef4444'];

export function CausalAnalysis({ onBack }: CausalAnalysisProps) {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

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
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">Análisis Causal de Accidentes</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Investigación y prevención basada en datos</p>
              </div>
            </div>
            <Button className="bg-[#FF8C00] hover:bg-orange-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar Informe
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Total Incidentes</span>
                <AlertTriangle className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="text-3xl text-zinc-900 dark:text-white mb-1">27</div>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0 text-xs">-25% vs anterior</Badge>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Análisis Completados</span>
                <Brain className="w-4 h-4 text-[#0055A4]" />
              </div>
              <div className="text-3xl text-zinc-900 dark:text-white mb-1">23</div>
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-0 text-xs">85% completitud</Badge>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Acciones Preventivas</span>
                <Target className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl text-zinc-900 dark:text-white mb-1">47</div>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0 text-xs">32 implementadas</Badge>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Eficacia Prevención</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl text-zinc-900 dark:text-white mb-1">78%</div>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0 text-xs">+12% mejora</Badge>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white">
              Vista General
            </TabsTrigger>
            <TabsTrigger value="ishikawa" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white">
              Ishikawa
            </TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white">
              Casos Destacados
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white">
              Recomendaciones
            </TabsTrigger>
          </TabsList>

          {/* Vista General */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Causas Raíz */}
              <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <div className="p-5">
                  <h3 className="text-zinc-900 dark:text-white mb-1">Causas Raíz Identificadas</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Análisis de factores contribuyentes</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rootCauseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                      <XAxis 
                        dataKey="causa" 
                        stroke="#6b7280" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={11}
                      />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-zinc-800)',
                          border: '1px solid var(--color-zinc-700)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="casos" fill="#FF8C00" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Tendencia temporal */}
              <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <div className="p-5">
                  <h3 className="text-zinc-900 dark:text-white mb-1">Tendencia de Incidentes</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Evolución últimos 6 meses</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
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
                      <Line type="monotone" dataKey="total" stroke="#FF8C00" strokeWidth={2} name="Total" />
                      <Line type="monotone" dataKey="graves" stroke="#ef4444" strokeWidth={2} name="Graves" />
                      <Line type="monotone" dataKey="leves" stroke="#22c55e" strokeWidth={2} name="Leves" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Tipo de lesiones */}
              <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <div className="p-5">
                  <h3 className="text-zinc-900 dark:text-white mb-1">Tipos de Lesiones</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Clasificación por naturaleza</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={injuryTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis dataKey="tipo" type="category" stroke="#6b7280" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-zinc-800)',
                          border: '1px solid var(--color-zinc-700)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="cantidad" fill="#0055A4" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Radar de factores */}
              <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <div className="p-5">
                  <h3 className="text-zinc-900 dark:text-white mb-1">Evaluación de Factores de Riesgo</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Nivel de control por área (0-100)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={riskFactorsData}>
                      <PolarGrid stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                      <PolarAngleAxis dataKey="factor" stroke="#6b7280" />
                      <PolarRadiusAxis stroke="#6b7280" />
                      <Radar name="Control" dataKey="value" stroke="#FF8C00" fill="#FF8C00" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Análisis Ishikawa */}
          <TabsContent value="ishikawa" className="mt-6">
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#FF8C00]/20 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-[#FF8C00]" />
                  </div>
                  <div>
                    <h3 className="text-zinc-900 dark:text-white">Diagrama de Ishikawa - Espina de Pescado</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Distribución de causas por categoría</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ishikawaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ categoria, value }) => `${categoria}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ishikawaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {ishikawaData.map((item) => (
                      <div key={item.categoria} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-zinc-900 dark:text-white font-medium">{item.categoria}</span>
                          </div>
                          <span className="text-zinc-900 dark:text-white">{item.value}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${item.value}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                          {item.categoria === 'Personas' && 'Capacitación, experiencia, fatiga'}
                          {item.categoria === 'Equipos' && 'Mantención, calibración, obsolescencia'}
                          {item.categoria === 'Métodos' && 'Procedimientos, instructivos, permisos'}
                          {item.categoria === 'Materiales' && 'Calidad, almacenamiento, especificaciones'}
                          {item.categoria === 'Ambiente' && 'Iluminación, temperatura, orden y limpieza'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Casos Destacados */}
          <TabsContent value="cases" className="mt-6">
            <div className="space-y-4">
              {featuredCases.map((caso) => (
                <Card 
                  key={caso.id} 
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-[#FF8C00] transition-all cursor-pointer"
                  onClick={() => setSelectedCase(caso.id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-zinc-900 dark:text-white">{caso.titulo}</h3>
                          <Badge className={`
                            ${caso.gravedad === 'Alta' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : ''}
                            ${caso.gravedad === 'Media' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''}
                            ${caso.gravedad === 'Baja' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ''}
                            border-0 text-xs
                          `}>
                            {caso.gravedad}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{caso.fecha}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-[#FF8C00] mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">Metodología</p>
                              <p className="text-sm text-zinc-900 dark:text-white">{caso.metodologia}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">Causa Raíz</p>
                              <p className="text-sm text-zinc-900 dark:text-white">{caso.causaRaiz}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">Acciones</p>
                              <p className="text-sm text-zinc-900 dark:text-white">{caso.acciones} medidas correctivas</p>
                            </div>
                          </div>
                        </div>

                        <Badge className={`
                          ${caso.estado === 'Completado' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}
                          border-0 text-xs
                        `}>
                          {caso.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recomendaciones */}
          <TabsContent value="recommendations" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-red-900 dark:text-red-300">Acción Crítica</h3>
                  </div>
                  <p className="text-red-800 dark:text-red-400 mb-3">
                    35% de los incidentes están relacionados con factor humano. Se requiere reforzar programa de capacitación.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full">
                    Crear Plan de Capacitación
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-blue-900 dark:text-blue-300">Mantención Preventiva</h3>
                  </div>
                  <p className="text-blue-800 dark:text-blue-400 mb-3">
                    25% relacionado con equipos. Implementar checklist de inspección pre-uso para herramientas críticas.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                    Configurar Checklists
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-green-900 dark:text-green-300">Actualización Procedimientos</h3>
                  </div>
                  <p className="text-green-800 dark:text-green-400 mb-3">
                    20% por métodos. Revisar y actualizar procedimientos de trabajo en altura cada trimestre.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                    Revisar Procedimientos
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-purple-900 dark:text-purple-300">Cultura de Seguridad</h3>
                  </div>
                  <p className="text-purple-800 dark:text-purple-400 mb-3">
                    Implementar sistema de reporte de casi-accidentes para identificación temprana de riesgos.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                    Activar Reportes Proactivos
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
