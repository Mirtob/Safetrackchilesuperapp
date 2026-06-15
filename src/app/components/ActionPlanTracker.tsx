import { useState } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Image as ImageIcon,
  CheckCheck,
  XCircle,
  Filter,
  MapPin,
  Building2,
  HardHat,
  TrendingDown,
  TrendingUp,
  Shield,
  Users,
  AlertOctagon,
  Award,
  Target,
  DollarSign,
  Zap
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  responsible: string;
  createdAt: string;
  dueDate: string;
  source: string;
  location: string;
  sector: string;
  photoEvidence?: string;
  correctionEvidence?: string;
  costImpact?: number;
}

interface ActionPlanTrackerProps {
  onBack: () => void;
}

// Datos de accidentes por sector
const ACCIDENTS_BY_SECTOR = [
  { sector: 'Producción', accidentes: 8, gravedad: 145, diasPerdidos: 12, costEstimado: 10.2 },
  { sector: 'Bodega', accidentes: 5, gravedad: 98, diasPerdidos: 7, costEstimado: 5.9 },
  { sector: 'Mantención', accidentes: 12, gravedad: 210, diasPerdidos: 18, costEstimado: 15.3 },
  { sector: 'Oficinas', accidentes: 2, gravedad: 45, diasPerdidos: 3, costEstimado: 2.5 },
  { sector: 'Patio/Exterior', accidentes: 7, gravedad: 124, diasPerdidos: 9, costEstimado: 7.6 },
  { sector: 'Carga/Descarga', accidentes: 9, gravedad: 168, diasPerdidos: 14, costEstimado: 11.9 }
];

// Inversión recomendada por sector
const INVESTMENT_RECOMMENDATIONS = [
  { sector: 'Mantención', prioridad: 'Alta', inversionRecomendada: 8.5, roi: 180 },
  { sector: 'Carga/Descarga', prioridad: 'Alta', inversionRecomendada: 6.2, roi: 192 },
  { sector: 'Producción', prioridad: 'Media', inversionRecomendada: 4.8, roi: 150 },
  { sector: 'Patio/Exterior', prioridad: 'Media', inversionRecomendada: 3.2, roi: 137 },
  { sector: 'Bodega', prioridad: 'Baja', inversionRecomendada: 2.1, roi: 110 }
];

// Uso de EPP por segmento
const EPP_USAGE_BY_SEGMENT = [
  { segmento: 'Grúeros', usoCasco: 98, usoArnés: 96, usoGuantes: 94, usoBotas: 99, usoProtAuditiva: 92 },
  { segmento: 'Operarios Producción', usoCasco: 92, usoArnés: 85, usoGuantes: 97, usoBotas: 96, usoProtAuditiva: 88 },
  { segmento: 'Bodegueros', usoCasco: 89, usoArnés: 78, usoGuantes: 91, usoBotas: 94, usoProtAuditiva: 82 },
  { segmento: 'Mantenedores', usoCasco: 95, usoArnés: 92, usoGuantes: 98, usoBotas: 97, usoProtAuditiva: 90 },
  { segmento: 'Supervisores', usoCasco: 87, usoArnés: 70, usoGuantes: 85, usoBotas: 93, usoProtAuditiva: 79 },
  { segmento: 'Choferes', usoCasco: 94, usoArnés: 88, usoGuantes: 95, usoBotas: 98, usoProtAuditiva: 91 }
];

// Sanciones al personal
const SANCTIONS_DATA = [
  { trabajador: 'Pedro Morales', rut: '16.234.567-8', cargo: 'Operario', sanciones: 5, tipo: 'No uso EPP', ultimaSancion: '2026-01-25', gravedad: 'Media' },
  { trabajador: 'Jorge Sandoval', rut: '15.987.654-3', cargo: 'Bodeguero', sanciones: 4, tipo: 'Procedimiento inseguro', ultimaSancion: '2026-01-22', gravedad: 'Alta' },
  { trabajador: 'Miguel Ríos', rut: '17.456.789-0', cargo: 'Grúero', sanciones: 3, tipo: 'No uso EPP', ultimaSancion: '2026-01-20', gravedad: 'Media' },
  { trabajador: 'Luis Contreras', rut: '14.567.890-1', cargo: 'Mantenedor', sanciones: 3, tipo: 'Bloqueo no aplicado', ultimaSancion: '2026-01-18', gravedad: 'Alta' },
  { trabajador: 'Roberto Fuentes', rut: '16.789.012-4', cargo: 'Operario', sanciones: 2, tipo: 'No uso EPP', ultimaSancion: '2026-01-15', gravedad: 'Baja' }
];

// Tipos de sanciones más recurrentes
const SANCTION_TYPES = [
  { tipo: 'No uso de EPP', cantidad: 45, porcentaje: 38, costo: 12.7 },
  { tipo: 'Procedimiento inseguro', cantidad: 28, porcentaje: 24, costo: 15.3 },
  { tipo: 'Velocidad excesiva', cantidad: 18, porcentaje: 15, costo: 8.9 },
  { tipo: 'Bloqueo no aplicado', cantidad: 15, porcentaje: 13, costo: 11.2 },
  { tipo: 'Otros', cantidad: 12, porcentaje: 10, costo: 5.8 }
];

// Desempeño de seguridad por trabajador
const WORKER_PERFORMANCE = [
  { categoria: 'Excelente (0 infracciones)', trabajadores: 523, porcentaje: 78 },
  { categoria: 'Bueno (1-2 infracciones)', trabajadores: 98, porcentaje: 15 },
  { categoria: 'Regular (3-4 infracciones)', trabajadores: 32, porcentaje: 5 },
  { categoria: 'Crítico (5+ infracciones)', trabajadores: 15, porcentaje: 2 }
];

export function ActionPlanTracker({ onBack }: ActionPlanTrackerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('hallazgos');
  
  const [findings] = useState<Finding[]>([
    {
      id: 'F001',
      title: 'Extintor descalibrado en pasillo central',
      description: 'Manómetro del extintor PQS 6kg marca presión fuera del rango verde',
      severity: 'high',
      status: 'in-progress',
      responsible: 'Juan Pérez - Mantenimiento',
      createdAt: '2026-01-20',
      dueDate: '2026-01-30',
      source: 'Inspección de Seguridad',
      location: 'Sucursal Maipú',
      sector: 'Mantención',
      photoEvidence: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      costImpact: 0.8
    },
    {
      id: 'F002',
      title: 'Señalética de salida de emergencia obstruida',
      description: 'Cajas apiladas bloqueando vista a señal de evacuación',
      severity: 'critical',
      status: 'pending',
      responsible: 'María González - Operaciones',
      createdAt: '2026-01-22',
      dueDate: '2026-01-27',
      source: 'Inspección Mensual',
      location: 'Sucursal Maipú',
      sector: 'Bodega',
      photoEvidence: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
      costImpact: 1.2
    },
    {
      id: 'F003',
      title: 'Cables eléctricos sin canalización',
      description: 'Instalación temporal sin protección adecuada en área de producción',
      severity: 'medium',
      status: 'completed',
      responsible: 'Carlos Rojas - Eléctrico',
      createdAt: '2026-01-15',
      dueDate: '2026-01-25',
      source: 'Inspección de Terreno',
      location: 'Sucursal Norte',
      sector: 'Producción',
      photoEvidence: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      correctionEvidence: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      costImpact: 2.5
    },
    {
      id: 'F004',
      title: 'Trabajador sin casco en zona de tránsito',
      description: 'Personal subcontratado observado sin EPP obligatorio',
      severity: 'high',
      status: 'pending',
      responsible: 'Supervisor Contratista',
      createdAt: '2026-01-24',
      dueDate: '2026-01-28',
      source: 'Observación de Conducta',
      location: 'Sucursal Sur',
      sector: 'Carga/Descarga',
      photoEvidence: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      costImpact: 0.5
    },
    {
      id: 'F005',
      title: 'Piso resbaladizo por derrame no señalizado',
      description: 'Derrame de aceite hidráulico sin conos de seguridad',
      severity: 'critical',
      status: 'in-progress',
      responsible: 'Pedro Silva - Limpieza',
      createdAt: '2026-01-26',
      dueDate: '2026-01-27',
      source: 'Reporte de Trabajador',
      location: 'Sucursal Maipú',
      sector: 'Mantención',
      photoEvidence: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      costImpact: 1.8
    }
  ]);

  const getSeverityConfig = (severity: string) => {
    const config = {
      critical: { label: 'Crítico', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
      high: { label: 'Alto', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle },
      medium: { label: 'Medio', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle },
      low: { label: 'Bajo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertTriangle }
    };
    return config[severity as keyof typeof config];
  };

  const getStatusConfig = (status: string) => {
    const config = {
      pending: { label: 'Pendiente', color: 'bg-zinc-700 text-zinc-300', icon: Clock },
      'in-progress': { label: 'En Progreso', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
      completed: { label: 'Completado', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
      rejected: { label: 'Rechazado', color: 'bg-red-500/20 text-red-400', icon: XCircle }
    };
    return config[status as keyof typeof config];
  };

  const filteredFindings = filterStatus === 'all' 
    ? findings 
    : findings.filter(f => f.status === filterStatus);

  const stats = {
    total: findings.length,
    pending: findings.filter(f => f.status === 'pending').length,
    inProgress: findings.filter(f => f.status === 'in-progress').length,
    completed: findings.filter(f => f.status === 'completed').length
  };

  // Calcular totales por sector
  const totalCostBySector = findings.reduce((acc, f) => {
    acc[f.sector] = (acc[f.sector] || 0) + (f.costImpact || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 border-b border-orange-600 dark:border-orange-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🔍 Gestión de Hallazgos & Análisis Gerencial
              </h1>
              <p className="text-white/80 text-sm">
                Plan de Acción Correctiva • Inversiones Estratégicas • Desempeño del Personal
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('hallazgos')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'hallazgos'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Hallazgos
            </button>
            <button
              onClick={() => setActiveTab('sectores')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'sectores'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Análisis por Sector
            </button>
            <button
              onClick={() => setActiveTab('epp')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'epp'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HardHat className="w-4 h-4 inline mr-1" />
              Uso de EPP
            </button>
            <button
              onClick={() => setActiveTab('sanciones')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'sanciones'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <AlertOctagon className="w-4 h-4 inline mr-1" />
              Sanciones
            </button>
            <button
              onClick={() => setActiveTab('desempeño')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'desempeño'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Award className="w-4 h-4 inline mr-1" />
              Desempeño Personal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Tab: Hallazgos */}
        {activeTab === 'hallazgos' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-white dark:bg-zinc-900">
                <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">Total Hallazgos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </Card>
              <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <p className="text-xs text-red-800 dark:text-red-300 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.pending}</p>
              </Card>
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.inProgress}</p>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <p className="text-xs text-green-800 dark:text-green-300 mb-1">Completados</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
              </Card>
            </div>

            {/* Filter */}
            <Card className="p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white h-10">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                    <SelectItem value="all">Todos los hallazgos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Findings List */}
            <div className="space-y-3">
              {filteredFindings.map(finding => {
                const severityConfig = getSeverityConfig(finding.severity);
                const statusConfig = getStatusConfig(finding.status);
                const SeverityIcon = severityConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={finding.id} className="p-4 bg-white dark:bg-zinc-900">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityConfig.color}>
                            <SeverityIcon className="w-3 h-3 mr-1" />
                            {severityConfig.label}
                          </Badge>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {finding.costImpact && (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-0">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${finding.costImpact}M impacto
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-semibold">{finding.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">{finding.description}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">{finding.id}</span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                        <User className="w-4 h-4" />
                        <span className="text-xs">{finding.responsible}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{finding.sector}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          Vence: {new Date(finding.dueDate).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Photos */}
                    {finding.photoEvidence && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Evidencia fotográfica
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">❌ Antes (Problema)</p>
                            <img 
                              src={finding.photoEvidence} 
                              alt="Evidencia del problema" 
                              className="w-full h-24 object-cover rounded border border-slate-200 dark:border-zinc-700"
                            />
                          </div>
                          {finding.correctionEvidence && (
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400 mb-1">✅ Después (Corregido)</p>
                              <img 
                                src={finding.correctionEvidence} 
                                alt="Evidencia de corrección" 
                                className="w-full h-24 object-cover rounded border border-slate-200 dark:border-zinc-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-700">
                      <span className="text-xs text-slate-500 dark:text-zinc-500">
                        {finding.source} • {finding.location}
                      </span>
                      <div className="flex gap-2">
                        {finding.status !== 'completed' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Validar Corrección
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Tab: Análisis por Sector */}
        {activeTab === 'sectores' && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-900">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    💡 Análisis para Toma de Decisiones de Inversión
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    Identifica los sectores críticos que requieren inversión urgente en infraestructura, equipamiento o capacitación
                  </p>
                </div>
              </div>
            </Card>

            {/* Accidentes por Sector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Accidentes por Sector (Últimos 6 meses)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ACCIDENTS_BY_SECTOR} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="sector" type="category" width={100} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'accidentes') return [value, 'Accidentes'];
                        if (name === 'diasPerdidos') return [value, 'Días perdidos'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="accidentes" name="Accidentes" fill="#ef4444" />
                    <Bar dataKey="diasPerdidos" name="Días perdidos" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                    🚨 Sector crítico: <strong>Mantención</strong> (12 accidentes, 18 días perdidos)
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  Costo Estimado por Sector
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ACCIDENTS_BY_SECTOR}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="sector" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(1)}M CLP`, 'Costo estimado']}
                    />
                    <Bar dataKey="costEstimado" name="Costo Estimado" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    💰 Total acumulado: <strong>$53.4M CLP</strong> • Mantención representa el 29% del costo
                  </p>
                </div>
              </Card>
            </div>

            {/* Recomendaciones de Inversión */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Recomendaciones de Inversión por Sector
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Sector
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Prioridad
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Inversión Recomendada
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        ROI Proyectado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Acciones Sugeridas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVESTMENT_RECOMMENDATIONS.map((rec, index) => (
                      <tr key={index} className="border-b border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#0055A4]" />
                            <span className="font-medium text-slate-900 dark:text-white">{rec.sector}</span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className={
                            rec.prioridad === 'Alta' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0' 
                              : rec.prioridad === 'Media'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-0'
                              : 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                          }>
                            {rec.prioridad}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ${rec.inversionRecomendada.toFixed(1)}M
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {rec.roi}%
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                            {rec.sector === 'Mantención' && (
                              <>
                                <li>• Renovar herramientas manuales</li>
                                <li>• Mejorar iluminación taller</li>
                                <li>• Implementar LOTO digital</li>
                              </>
                            )}
                            {rec.sector === 'Carga/Descarga' && (
                              <>
                                <li>• Instalar barandas en rampa</li>
                                <li>• Señalética retroreflejante</li>
                                <li>• Sistema de alerta de grúa</li>
                              </>
                            )}
                            {rec.sector === 'Producción' && (
                              <>
                                <li>• Guardas de maquinaria</li>
                                <li>• Pisos antideslizantes</li>
                                <li>• Ventilación localizada</li>
                              </>
                            )}
                            {rec.sector === 'Patio/Exterior' && (
                              <>
                                <li>• Demarcación de vías</li>
                                <li>• Refugios peatonales</li>
                                <li>• Iluminación perimetral</li>
                              </>
                            )}
                            {rec.sector === 'Bodega' && (
                              <>
                                <li>• Racks certificados</li>
                                <li>• Detectores de humo</li>
                                <li>• Capacitación apilamiento</li>
                              </>
                            )}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-zinc-900/50">
                    <tr>
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        INVERSIÓN TOTAL RECOMENDADA
                      </td>
                      <td className="text-center py-4 px-4" colSpan={2}>
                        <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">
                          ${INVESTMENT_RECOMMENDATIONS.reduce((sum, r) => sum + r.inversionRecomendada, 0).toFixed(1)}M CLP
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0">
                          ROI prom: {(INVESTMENT_RECOMMENDATIONS.reduce((sum, r) => sum + r.roi, 0) / INVESTMENT_RECOMMENDATIONS.length).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-zinc-400">
                        Retorno esperado en 12 meses
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Uso de EPP */}
        {activeTab === 'epp' && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <HardHat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    🦺 Cumplimiento de EPP por Segmento
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Meta organizacional: ≥95% de cumplimiento en todos los segmentos
                  </p>
                </div>
              </div>
            </Card>

            {/* Radar Chart de EPP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {EPP_USAGE_BY_SEGMENT.slice(0, 4).map((segment, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-zinc-900">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {segment.segmento}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={[
                      { epp: 'Casco', uso: segment.usoCasco, meta: 95 },
                      { epp: 'Arnés', uso: segment.usoArnés, meta: 95 },
                      { epp: 'Guantes', uso: segment.usoGuantes, meta: 95 },
                      { epp: 'Botas', uso: segment.usoBotas, meta: 95 },
                      { epp: 'Prot. Auditiva', uso: segment.usoProtAuditiva, meta: 95 }
                    ]}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="epp" stroke="#64748b" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                      <Radar name="Uso Actual" dataKey="uso" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      <Radar name="Meta (95%)" dataKey="meta" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {segment.usoArnés < 95 && (
                      <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                        <p className="text-xs text-red-800 dark:text-red-300">
                          ⚠️ <strong>Arnés</strong> bajo meta ({segment.usoArnés}%) - Reforzar capacitación
                        </p>
                      </div>
                    )}
                    {segment.usoProtAuditiva < 95 && (
                      <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                        <p className="text-xs text-red-800 dark:text-red-300">
                          ⚠️ <strong>Protección Auditiva</strong> bajo meta ({segment.usoProtAuditiva}%)
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Tabla comparativa */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-orange-600" />
                Comparativa de Cumplimiento EPP por Segmento
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Segmento
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Casco
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Arnés
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Guantes
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Botas
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Prot. Auditiva
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EPP_USAGE_BY_SEGMENT.map((segment, index) => {
                      const promedio = Math.round((segment.usoCasco + segment.usoArnés + segment.usoGuantes + segment.usoBotas + segment.usoProtAuditiva) / 5);
                      return (
                        <tr key={index} className="border-b border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800">
                          <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                            {segment.segmento}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-semibold ${segment.usoCasco >= 95 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {segment.usoCasco}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-semibold ${segment.usoArnés >= 95 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {segment.usoArnés}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-semibold ${segment.usoGuantes >= 95 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {segment.usoGuantes}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-semibold ${segment.usoBotas >= 95 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {segment.usoBotas}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-semibold ${segment.usoProtAuditiva >= 95 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {segment.usoProtAuditiva}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <Badge className={
                              promedio >= 95 
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0' 
                                : promedio >= 90
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-0'
                                : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0'
                            }>
                              {promedio}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    🚨 <strong>Crítico:</strong> Supervisores con 70% en arnés - Capacitación urgente
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    ⚠️ <strong>Atención:</strong> Bodegueros bajo meta en arnés (78%)
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    ✅ <strong>Excelente:</strong> Grúeros y Mantenedores sobre 95%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Sanciones */}
        {activeTab === 'sanciones' && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    ⚠️ Sistema de Sanciones y Trabajadores Conflictivos
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Identificación de patrones de conducta insegura para intervención preventiva
                  </p>
                </div>
              </div>
            </Card>

            {/* Estadísticas de sanciones */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <AlertOctagon className="w-8 h-8 text-red-600" />
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0">
                    3 meses
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  118
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Sanciones totales</p>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-0">
                    5+ sanciones
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  5
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Trabajadores conflictivos</p>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <HardHat className="w-8 h-8 text-yellow-600" />
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  38%
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">No uso de EPP</p>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  $53.9M
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Costo potencial evitado</p>
              </Card>
            </div>

            {/* Tipos de sanciones más recurrentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  Tipos de Sanciones Más Recurrentes
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={SANCTION_TYPES}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tipo, porcentaje }) => `${tipo.split(' ')[0]}: ${porcentaje}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {SANCTION_TYPES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'][index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        return [`${value} sanciones (${props.payload.porcentaje}%)`, props.payload.tipo];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {SANCTION_TYPES.slice(0, 3).map((type, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#ef4444', '#f97316', '#f59e0b'][i] }} />
                        <span className="text-slate-600 dark:text-zinc-400">{type.tipo}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900 dark:text-white">{type.cantidad}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-500 ml-2">
                          (${type.costo}M costo potencial)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Acciones Correctivas Recomendadas
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="flex items-start gap-3">
                      <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Prioridad Alta: No Uso de EPP (45 casos)
                        </h4>
                        <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                          <li>• Campaña intensiva de concientización (2 semanas)</li>
                          <li>• Auditorías sorpresa diarias en áreas críticas</li>
                          <li>• Reforzar sistema de consecuencias progresivas</li>
                          <li>• Investigar causas: EPP incómodo/inadecuado</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                          Prioridad Media: Procedimientos Inseguros (28 casos)
                        </h4>
                        <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1">
                          <li>• Re-certificación en procedimientos críticos</li>
                          <li>• Implementar sistema de observación preventiva</li>
                          <li>• Mentores de seguridad por área</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Programa de Reconocimiento
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          78% del personal (523 trabajadores) sin infracciones - Implementar sistema de reconocimiento mensual
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabla de trabajadores conflictivos */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Trabajadores con Mayor Número de Sanciones
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Trabajador
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        RUT
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Cargo
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        N° Sanciones
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Tipo Principal
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Última Sanción
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Nivel
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SANCTIONS_DATA.map((sanction, index) => (
                      <tr key={index} className="border-b border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {sanction.trabajador}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4 text-sm text-slate-600 dark:text-zinc-400">
                          {sanction.rut}
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 border-0">
                            {sanction.cargo}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className={
                            sanction.sanciones >= 5 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0'
                              : sanction.sanciones >= 3
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-0'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-0'
                          }>
                            {sanction.sanciones}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4 text-sm text-slate-900 dark:text-white">
                          {sanction.tipo}
                        </td>
                        <td className="text-center py-4 px-4 text-sm text-slate-600 dark:text-zinc-400">
                          {new Date(sanction.ultimaSancion).toLocaleDateString('es-CL')}
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className={
                            sanction.gravedad === 'Alta' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0'
                              : sanction.gravedad === 'Media'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-0'
                              : 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                          }>
                            {sanction.gravedad}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Ver Plan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Protocolo de Intervención para Trabajadores Conflictivos
                    </h4>
                    <ol className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                      <li><strong>3 sanciones:</strong> Entrevista con supervisor + Plan de mejora</li>
                      <li><strong>5 sanciones:</strong> Derivación a psicólogo laboral + Re-inducción</li>
                      <li><strong>7 sanciones:</strong> Comité de evaluación + Posible reasignación</li>
                      <li><strong>10 sanciones:</strong> Término de contrato según reglamento interno</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>

            {/* Gráfico de tendencia */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                Tendencia de Sanciones (Últimos 7 meses)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { mes: 'Jul', sanciones: 24, objetivo: 15 },
                  { mes: 'Ago', sanciones: 21, objetivo: 15 },
                  { mes: 'Sep', sanciones: 19, objetivo: 15 },
                  { mes: 'Oct', sanciones: 18, objetivo: 15 },
                  { mes: 'Nov', sanciones: 16, objetivo: 15 },
                  { mes: 'Dic', sanciones: 12, objetivo: 15 },
                  { mes: 'Ene', sanciones: 8, objetivo: 15 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sanciones" name="Sanciones" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
                  <Line type="monotone" dataKey="objetivo" name="Objetivo" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <p className="text-sm text-green-900 dark:text-green-100">
                  📉 <strong>Tendencia positiva:</strong> Reducción del 67% en sanciones vs. hace 6 meses • Objetivo alcanzado
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Desempeño del Personal */}
        {activeTab === 'desempeño' && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    🏆 Desempeño en Seguridad del Personal
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Clasificación del personal según cumplimiento de normas de seguridad
                  </p>
                </div>
              </div>
            </Card>

            {/* Estadísticas de desempeño */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {WORKER_PERFORMANCE.map((perf, index) => {
                const colors = [
                  { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-900', text: 'text-green-900 dark:text-green-100', accent: 'text-green-600 dark:text-green-400' },
                  { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-900 dark:text-blue-100', accent: 'text-blue-600 dark:text-blue-400' },
                  { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-900', text: 'text-yellow-900 dark:text-yellow-100', accent: 'text-yellow-600 dark:text-yellow-400' },
                  { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-900', text: 'text-red-900 dark:text-red-100', accent: 'text-red-600 dark:text-red-400' }
                ];
                return (
                  <Card key={index} className={`p-6 ${colors[index].bg} ${colors[index].border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Award className={`w-8 h-8 ${colors[index].accent}`} />
                      <Badge className="bg-white/50 dark:bg-zinc-900/50 border-0">
                        {perf.porcentaje}%
                      </Badge>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${colors[index].text}`}>
                      {perf.trabajadores}
                    </div>
                    <p className={`text-sm ${colors[index].text}`}>{perf.categoria}</p>
                  </Card>
                );
              })}
            </div>

            {/* Distribución visual */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Distribución del Personal por Desempeño en Seguridad
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={WORKER_PERFORMANCE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="categoria" stroke="#64748b" angle={-15} textAnchor="end" height={100} />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      return [`${value} trabajadores (${props.payload.porcentaje}%)`, 'Cantidad'];
                    }}
                  />
                  <Bar dataKey="trabajadores" name="Trabajadores" fill="#3b82f6">
                    {WORKER_PERFORMANCE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <Award className="w-4 h-4 inline mr-1" />
                    <strong>78% del personal</strong> con desempeño excelente (0 infracciones)
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    <AlertOctagon className="w-4 h-4 inline mr-1" />
                    <strong>2% requiere intervención</strong> (15 trabajadores críticos)
                  </p>
                </div>
              </div>
            </Card>

            {/* Plan de Mejora */}
            <Card className="p-6 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Plan de Mejora del Desempeño
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Crítico (15 trabajadores)
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                    <li>✓ Evaluación psicológica</li>
                    <li>✓ Plan de acción individual</li>
                    <li>✓ Seguimiento semanal</li>
                    <li>✓ Mentor asignado</li>
                    <li>✓ Re-certificación obligatoria</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Regular (32 trabajadores)
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                    <li>✓ Capacitación reforzada</li>
                    <li>✓ Observación conductual</li>
                    <li>✓ Seguimiento quincenal</li>
                    <li>✓ Charlas específicas</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Excelente (523 trabajadores)
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>✓ Programa de reconocimiento</li>
                    <li>✓ Bono de seguridad trimestral</li>
                    <li>✓ Certificado de excelencia</li>
                    <li>✓ Embajadores de seguridad</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
