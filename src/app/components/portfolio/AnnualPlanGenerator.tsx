import { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Download, CheckCircle, AlertTriangle, Filter, Eye } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { format, parseISO, startOfYear, endOfYear, eachMonthOfInterval, isSameMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface Asset {
  id: string;
  sectorId: string;
  name: string;
  category: string;
  code?: string;
  nextInspectionDate?: string;
  inspectionFrequency: number;
  status: 'al-dia' | 'proximo-vencer' | 'vencido' | 'sin-inspeccion';
}

interface Sector {
  id: string;
  name: string;
  riskLevel: 'bajo' | 'medio' | 'alto' | 'critico';
}

interface AnnualPlanGeneratorProps {
  companyName: string;
  sectors: Sector[];
  assets: Asset[];
  onBack: () => void;
  onComplete: () => void;
}

interface InspectionEvent {
  assetId: string;
  assetName: string;
  assetCategory: string;
  sectorName: string;
  date: string;
  status: 'al-dia' | 'proximo-vencer' | 'vencido' | 'sin-inspeccion';
  priority: 'baja' | 'media' | 'alta' | 'critica';
}

export function AnnualPlanGenerator({ companyName, sectors, assets, onBack, onComplete }: AnnualPlanGeneratorProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Generar eventos de inspección
  const inspectionEvents = useMemo(() => {
    const events: InspectionEvent[] = [];

    assets.forEach(asset => {
      if (!asset.nextInspectionDate) return;

      const sector = sectors.find(s => s.id === asset.sectorId);
      if (!sector) return;

      // Calcular prioridad basada en nivel de riesgo y estado
      let priority: InspectionEvent['priority'] = 'media';
      
      if (asset.status === 'vencido') {
        priority = 'critica';
      } else if (asset.status === 'proximo-vencer') {
        priority = sector.riskLevel === 'critico' || sector.riskLevel === 'alto' ? 'alta' : 'media';
      } else {
        priority = sector.riskLevel === 'critico' ? 'alta' : 
                   sector.riskLevel === 'alto' ? 'media' : 'baja';
      }

      events.push({
        assetId: asset.id,
        assetName: asset.name,
        assetCategory: asset.category,
        sectorName: sector.name,
        date: asset.nextInspectionDate,
        status: asset.status,
        priority
      });

      // Generar inspecciones futuras para el resto del año
      let nextDate = parseISO(asset.nextInspectionDate);
      const maxIterations = 12; // Máximo 12 meses
      let iterations = 0;

      while (nextDate <= yearEnd && iterations < maxIterations) {
        nextDate = new Date(nextDate);
        nextDate.setMonth(nextDate.getMonth() + asset.inspectionFrequency);
        
        if (nextDate <= yearEnd) {
          const daysUntil = differenceInDays(nextDate, new Date());
          const futureStatus: Asset['status'] = daysUntil <= 30 ? 'proximo-vencer' : 'al-dia';
          
          events.push({
            assetId: `${asset.id}-${iterations}`,
            assetName: asset.name,
            assetCategory: asset.category,
            sectorName: sector.name,
            date: format(nextDate, 'yyyy-MM-dd'),
            status: futureStatus,
            priority: futureStatus === 'proximo-vencer' && sector.riskLevel === 'critico' ? 'alta' : 'media'
          });
        }
        
        iterations++;
      }
    });

    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [assets, sectors, yearEnd]);

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    let filtered = inspectionEvents;

    if (selectedMonth !== null) {
      filtered = filtered.filter(event => 
        isSameMonth(parseISO(event.date), months[selectedMonth])
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(event => event.priority === filterPriority);
    }

    return filtered;
  }, [inspectionEvents, selectedMonth, filterPriority, months]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: inspectionEvents.length,
      critica: inspectionEvents.filter(e => e.priority === 'critica').length,
      alta: inspectionEvents.filter(e => e.priority === 'alta').length,
      media: inspectionEvents.filter(e => e.priority === 'media').length,
      baja: inspectionEvents.filter(e => e.priority === 'baja').length,
      vencidos: inspectionEvents.filter(e => e.status === 'vencido').length
    };
  }, [inspectionEvents]);

  // Eventos por mes
  const eventsByMonth = useMemo(() => {
    return months.map(month => ({
      month,
      events: inspectionEvents.filter(event => isSameMonth(parseISO(event.date), month)),
      criticalCount: inspectionEvents.filter(event => 
        isSameMonth(parseISO(event.date), month) && event.priority === 'critica'
      ).length
    }));
  }, [inspectionEvents, months]);

  const getPriorityColor = (priority: InspectionEvent['priority']) => {
    switch (priority) {
      case 'critica':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'vencido':
        return 'bg-red-500 text-white';
      case 'proximo-vencer':
        return 'bg-yellow-500 text-white';
      case 'al-dia':
        return 'bg-green-500 text-white';
      default:
        return 'bg-zinc-400 text-white';
    }
  };

  const exportToPDF = () => {
    toast.success('Generando PDF de planificación anual...');
    // Aquí iría la lógica de exportación
  };

  const handleComplete = () => {
    toast.success(`Empresa "${companyName}" configurada exitosamente`);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-24">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Planificación Anual {currentYear}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {companyName} • {inspectionEvents.length} inspecciones programadas
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Configuración
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Inspecciones</p>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 p-4">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.critica}</div>
            <p className="text-xs text-red-600 dark:text-red-500">Prioridad Crítica</p>
          </Card>
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 p-4">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.alta}</div>
            <p className="text-xs text-orange-600 dark:text-orange-500">Prioridad Alta</p>
          </Card>
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 p-4">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.media}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">Prioridad Media</p>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.baja}</div>
            <p className="text-xs text-green-600 dark:text-green-500">Prioridad Baja</p>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 p-4">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.vencidos}</div>
            <p className="text-xs text-red-600 dark:text-red-500">Vencidos</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filtros:</span>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
            >
              <option value="all">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <Button
              onClick={() => {
                setSelectedMonth(null);
                setFilterPriority('all');
              }}
              variant="outline"
              size="sm"
            >
              Limpiar filtros
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Month Selector */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Meses {currentYear}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMonth === null
                      ? 'bg-[#0055A4] text-white'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-medium">Todo el año</div>
                  <div className="text-xs opacity-80">{inspectionEvents.length} inspecciones</div>
                </button>
                {eventsByMonth.map((monthData, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMonth(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedMonth === index
                        ? 'bg-[#0055A4] text-white'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {format(monthData.month, 'MMMM', { locale: es })}
                      </span>
                      {monthData.criticalCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {monthData.criticalCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-80">
                      {monthData.events.length} {monthData.events.length === 1 ? 'inspección' : 'inspecciones'}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                {selectedMonth !== null 
                  ? `${format(months[selectedMonth], 'MMMM yyyy', { locale: es })} (${filteredEvents.length} inspecciones)`
                  : `Plan Completo ${currentYear} (${filteredEvents.length} inspecciones)`}
              </h3>

              <div className="space-y-3">
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay inspecciones programadas con los filtros seleccionados</p>
                  </div>
                )}

                {filteredEvents.map((event, index) => (
                  <Card
                    key={`${event.assetId}-${index}`}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                          <h4 className="font-semibold text-zinc-900 dark:text-white">
                            {event.assetName}
                          </h4>
                          <Badge className={getPriorityColor(event.priority)}>
                            {event.priority === 'critica' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-zinc-500">Fecha programada</p>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {format(parseISO(event.date), 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Sector</p>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {event.sectorName}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Categoría</p>
                            <p className="font-medium text-zinc-900 dark:text-white capitalize">
                              {event.assetCategory}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Días restantes</p>
                            <p className={`font-medium ${
                              differenceInDays(parseISO(event.date), new Date()) < 0 
                                ? 'text-red-600 dark:text-red-400'
                                : differenceInDays(parseISO(event.date), new Date()) <= 30
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {differenceInDays(parseISO(event.date), new Date())} días
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
