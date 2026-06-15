import { useState } from 'react';
import { 
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Stethoscope,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface IncidentDashboardWidgetProps {
  onViewDetails?: (incidentId: string) => void;
  onViewAll?: () => void;
  compact?: boolean;
}

interface IncidentSummary {
  id: string;
  code: string;
  type: 'accident' | 'incident';
  title: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sector: string;
  status: 'open' | 'investigating' | 'corrective-actions' | 'monitoring' | 'closed';
  daysOpen: number;
  affectedWorkers: number;
  medicalAttention: boolean;
  leaveDays?: number;
  estimatedCost?: number;
  actionsTotal: number;
  actionsCompleted: number;
}

// Mock data - En producción vendría de Supabase
const MOCK_INCIDENTS: IncidentSummary[] = [
  {
    id: 'INC-001',
    code: 'ACC-2025-001',
    type: 'accident',
    title: 'Trabajador golpeado por material mal apilado',
    date: '2025-01-15T10:30:00',
    severity: 'high',
    sector: 'Bodega A',
    status: 'investigating',
    daysOpen: 13,
    affectedWorkers: 1,
    medicalAttention: true,
    leaveDays: 7,
    estimatedCost: 2500000,
    actionsTotal: 5,
    actionsCompleted: 2
  },
  {
    id: 'INC-002',
    code: 'INC-2025-002',
    type: 'incident',
    title: 'Casi accidente con montacargas',
    date: '2025-01-20T14:15:00',
    severity: 'medium',
    sector: 'Área de Producción',
    status: 'corrective-actions',
    daysOpen: 8,
    affectedWorkers: 0,
    medicalAttention: false,
    actionsTotal: 3,
    actionsCompleted: 2
  },
  {
    id: 'INC-003',
    code: 'INC-2025-003',
    type: 'incident',
    title: 'Derrame menor de aceite',
    date: '2025-01-25T09:00:00',
    severity: 'low',
    sector: 'Taller de Mantención',
    status: 'monitoring',
    daysOpen: 3,
    affectedWorkers: 0,
    medicalAttention: false,
    actionsTotal: 2,
    actionsCompleted: 2
  },
  {
    id: 'INC-004',
    code: 'ACC-2025-002',
    type: 'accident',
    title: 'Corte superficial con herramienta',
    date: '2025-01-22T11:20:00',
    severity: 'low',
    sector: 'Taller',
    status: 'closed',
    daysOpen: 0,
    affectedWorkers: 1,
    medicalAttention: true,
    leaveDays: 0,
    estimatedCost: 150000,
    actionsTotal: 3,
    actionsCompleted: 3
  },
  {
    id: 'INC-005',
    code: 'INC-2025-004',
    type: 'incident',
    title: 'Falla eléctrica detectada',
    date: '2025-01-18T16:00:00',
    severity: 'medium',
    sector: 'Oficinas',
    status: 'closed',
    daysOpen: 0,
    affectedWorkers: 0,
    medicalAttention: false,
    actionsTotal: 4,
    actionsCompleted: 4
  },
  {
    id: 'INC-006',
    code: 'ACC-2025-003',
    type: 'accident',
    title: 'Caída desde escalera portátil',
    date: '2025-01-10T08:45:00',
    severity: 'critical',
    sector: 'Bodega B',
    status: 'corrective-actions',
    daysOpen: 18,
    affectedWorkers: 1,
    medicalAttention: true,
    leaveDays: 15,
    estimatedCost: 5200000,
    actionsTotal: 8,
    actionsCompleted: 5
  }
];

const SEVERITY_CONFIG = {
  critical: { label: 'Crítica', color: 'bg-black text-white', icon: '🚨' },
  high: { label: 'Alta', color: 'bg-red-600 text-white', icon: '🔴' },
  medium: { label: 'Media', color: 'bg-orange-600 text-white', icon: '🟠' },
  low: { label: 'Baja', color: 'bg-yellow-600 text-white', icon: '🟡' }
};

const STATUS_CONFIG = {
  open: { label: 'Abierto', color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400', icon: '🔴' },
  investigating: { label: 'Investigando', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400', icon: '🔍' },
  'corrective-actions': { label: 'En Corrección', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400', icon: '🔧' },
  monitoring: { label: 'Monitoreando', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400', icon: '👁️' },
  closed: { label: 'Cerrado', color: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400', icon: '✅' }
};

export function IncidentDashboardWidget({ 
  onViewDetails, 
  onViewAll,
  compact = false 
}: IncidentDashboardWidgetProps) {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calcular métricas
  const totalIncidents = MOCK_INCIDENTS.length;
  const accidents = MOCK_INCIDENTS.filter(i => i.type === 'accident').length;
  const openIncidents = MOCK_INCIDENTS.filter(i => i.status !== 'closed').length;
  const closedIncidents = MOCK_INCIDENTS.filter(i => i.status === 'closed').length;
  const criticalIncidents = MOCK_INCIDENTS.filter(i => i.severity === 'critical').length;
  
  const totalDaysLost = MOCK_INCIDENTS.reduce((sum, inc) => sum + (inc.leaveDays || 0), 0);
  const totalCost = MOCK_INCIDENTS.reduce((sum, inc) => sum + (inc.estimatedCost || 0), 0);
  const avgResponseTime = MOCK_INCIDENTS.filter(i => i.status === 'closed').length > 0
    ? Math.round(MOCK_INCIDENTS.filter(i => i.status === 'closed').reduce((sum, i) => sum + i.daysOpen, 0) / closedIncidents)
    : 0;

  const withMedicalAttention = MOCK_INCIDENTS.filter(i => i.medicalAttention).length;
  const affectedWorkers = MOCK_INCIDENTS.reduce((sum, inc) => sum + inc.affectedWorkers, 0);

  // Calcular tendencias (comparado con mes anterior - mock)
  const previousMonthIncidents = 4; // Mock
  const trend = totalIncidents > previousMonthIncidents ? 'up' : totalIncidents < previousMonthIncidents ? 'down' : 'stable';
  const trendPercentage = previousMonthIncidents > 0 
    ? Math.abs(Math.round(((totalIncidents - previousMonthIncidents) / previousMonthIncidents) * 100))
    : 0;

  // Incidentes por sector
  const sectorCounts: { [key: string]: number } = {};
  MOCK_INCIDENTS.forEach(inc => {
    sectorCounts[inc.sector] = (sectorCounts[inc.sector] || 0) + 1;
  });
  const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];

  // Incidentes recientes filtrados
  const filteredIncidents = MOCK_INCIDENTS
    .filter(inc => filterStatus === 'all' || inc.status === filterStatus)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, compact ? 3 : 5);

  if (compact) {
    // Vista compacta para dashboard principal
    return (
      <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Incidentes/Accidentes
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Último mes
                </p>
              </div>
            </div>
            
            {trend !== 'stable' && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                trend === 'down' ? 'bg-green-100 dark:bg-green-950/20' : 'bg-red-100 dark:bg-red-950/20'
              }`}>
                {trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-xs font-semibold ${
                  trend === 'down' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {trendPercentage}%
                </span>
              </div>
            )}
          </div>

          {/* KPIs compactos */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalIncidents}
              </div>
              <div className="text-xs text-slate-600 dark:text-zinc-400">Total</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {openIncidents}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Abiertos</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {criticalIncidents}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Críticos</div>
            </div>
          </div>

          {/* Últimos incidentes */}
          <div className="space-y-2 mb-4">
            {filteredIncidents.slice(0, 3).map(incident => (
              <div 
                key={incident.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => onViewDetails?.(incident.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${SEVERITY_CONFIG[incident.severity].color} text-xs px-1.5 py-0.5`}>
                      {SEVERITY_CONFIG[incident.severity].icon}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">
                      {incident.code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white truncate">
                    {incident.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    {incident.sector} • {new Date(incident.date).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <Badge className={STATUS_CONFIG[incident.status].color}>
                  {STATUS_CONFIG[incident.status].icon}
                </Badge>
              </div>
            ))}
          </div>

          {/* Botón ver todos */}
          <Button
            onClick={onViewAll}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Ver Todos los Incidentes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  // Vista completa para dashboard ejecutivo
  return (
    <div className="space-y-6">
      {/* Header con título y controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            Gestión de Incidentes y Accidentes
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Seguimiento completo desde el reporte inicial hasta el cierre
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>

          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800 border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalIncidents}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  Total Reportados
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-zinc-400">
              {accidents} accidentes • {totalIncidents - accidents} incidentes
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-300">
                  {openIncidents}
                </div>
                <div className="text-sm text-red-700 dark:text-red-400">
                  En Gestión
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            {criticalIncidents > 0 && (
              <span className="font-semibold">
                🚨 {criticalIncidents} crítico{criticalIncidents > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-300">
                  {closedIncidents}
                </div>
                <div className="text-sm text-green-700 dark:text-green-400">
                  Cerrados
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <Clock className="w-3 h-3" />
            <span>Promedio: {avgResponseTime} días</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-300">
                  {withMedicalAttention}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-400">
                  Con Atención Médica
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <Calendar className="w-3 h-3" />
            <span>{totalDaysLost} días perdidos</span>
          </div>
        </Card>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Impacto Económico
            </h3>
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-2">
            ${(totalCost / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-slate-600 dark:text-zinc-400">
            Costo estimado total del período
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
            Incluye: licencias médicas, atención, días perdidos
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Trabajadores Afectados
            </h3>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">
            {affectedWorkers}
          </div>
          <div className="text-sm text-slate-600 dark:text-zinc-400">
            Personas impactadas directamente
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
            {withMedicalAttention} requirieron atención médica
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Sector Crítico
            </h3>
          </div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-300 mb-2">
            {topSector?.[0] || 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-zinc-400">
            Mayor cantidad de incidentes
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
            {topSector?.[1] || 0} incidentes reportados
          </div>
        </Card>
      </div>

      {/* Lista de incidentes recientes con filtros */}
      <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Incidentes Recientes
            </h3>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="all">Todos</option>
                <option value="open">Abiertos</option>
                <option value="investigating">En Investigación</option>
                <option value="corrective-actions">En Corrección</option>
                <option value="monitoring">Monitoreando</option>
                <option value="closed">Cerrados</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-zinc-800">
          {filteredIncidents.map(incident => {
            const progress = (incident.actionsCompleted / incident.actionsTotal) * 100;
            
            return (
              <div 
                key={incident.id}
                className="p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => onViewDetails?.(incident.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${SEVERITY_CONFIG[incident.severity].color} px-2 py-1`}>
                        {SEVERITY_CONFIG[incident.severity].icon} {SEVERITY_CONFIG[incident.severity].label}
                      </Badge>
                      
                      <Badge variant="outline" className="font-mono text-xs">
                        {incident.code}
                      </Badge>

                      <Badge className={incident.type === 'accident' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}>
                        {incident.type === 'accident' ? '🚑 Accidente' : '⚠️ Incidente'}
                      </Badge>

                      {incident.medicalAttention && (
                        <Badge className="bg-blue-600 text-white">
                          🏥 Atención Médica
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {incident.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {incident.sector}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(incident.date).toLocaleDateString('es-CL', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {incident.daysOpen > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {incident.daysOpen} días abierto
                        </span>
                      )}
                      {incident.leaveDays && incident.leaveDays > 0 && (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Stethoscope className="w-4 h-4" />
                          {incident.leaveDays} días de licencia
                        </span>
                      )}
                      {incident.estimatedCost && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <DollarSign className="w-4 h-4" />
                          ${(incident.estimatedCost / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <Badge className={STATUS_CONFIG[incident.status].color}>
                      {STATUS_CONFIG[incident.status].icon} {STATUS_CONFIG[incident.status].label}
                    </Badge>
                    <div className="mt-2 text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        {incident.actionsCompleted}/{incident.actionsTotal} acciones
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Acciones rápidas */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs">
                    {incident.actionsTotal - incident.actionsCompleted > 0 && (
                      <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400">
                        {incident.actionsTotal - incident.actionsCompleted} pendiente(s)
                      </Badge>
                    )}
                    {incident.status === 'closed' && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                        ✅ Cerrado
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(incident.id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            No hay incidentes que coincidan con los filtros seleccionados
          </div>
        )}
      </Card>

      {/* Botón para ver todos */}
      {onViewAll && (
        <div className="flex justify-center">
          <Button
            onClick={onViewAll}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            Ver Sistema Completo de Seguimiento
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
