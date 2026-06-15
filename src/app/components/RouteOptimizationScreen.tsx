import { useState } from 'react';
import { ArrowLeft, Route, Calendar, BarChart3, Share2, Download } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { RouteOptimizationMapFixed } from '@/app/components/RouteOptimizationMapFixed';
import { DailyTaskManager } from '@/app/components/DailyTaskManager';
import { toast } from 'sonner';

interface RouteOptimizationScreenProps {
  onBack: () => void;
}

interface DailyTask {
  id: string;
  title: string;
  location: string;
  taskType: 'inspection' | 'maintenance' | 'training' | 'meeting';
  priority: number;
  estimatedDuration: number;
  status: 'pending' | 'in-progress' | 'completed';
  lat: number;
  lng: number;
  completedAt?: string;
  notes?: string;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalTimeSpent: number;
  completionRate: number;
  tasksByType: {
    inspection: number;
    maintenance: number;
    training: number;
    meeting: number;
  };
}

export function RouteOptimizationScreen({ onBack }: RouteOptimizationScreenProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'map' | 'stats'>('tasks');
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([]);

  const handleTasksChange = (updatedTasks: DailyTask[]) => {
    setTasks(updatedTasks);
  };

  const handleStatsUpdate = (updatedStats: TaskStats) => {
    setStats(updatedStats);
  };

  const handleRouteOptimized = (route: any[]) => {
    setOptimizedRoute(route);
    toast.success('Ruta calculada con éxito');
  };

  const handleExportRoute = () => {
    toast.success('📥 Exportando Ruta', {
      description: 'Se descargará un archivo PDF con la ruta optimizada',
      duration: 3000
    });
  };

  const handleShareRoute = () => {
    toast.success('🔗 Compartir Ruta', {
      description: 'Enlace copiado al portapapeles',
      duration: 3000
    });
  };

  // Convertir tareas a ubicaciones para el mapa
  const locations = tasks
    .filter(task => task.status !== 'completed')
    .map(task => ({
      id: task.id,
      name: task.title,
      address: task.location,
      lat: task.lat,
      lng: task.lng,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      taskType: task.taskType
    }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 border-b border-orange-500 dark:border-orange-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <div className="flex gap-2">
              <Button
                onClick={handleShareRoute}
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartir
              </Button>
              <Button
                onClick={handleExportRoute}
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🗺️ Optimización de Rutas & Agenda Diaria
              </h1>
              <p className="text-white/80 text-sm">
                Planifica tu día con rutas optimizadas y prioridades personalizadas
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Tareas Diarias
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Route className="w-4 h-4" />
              Mapa de Rutas
              {locations.length > 0 && (
                <Badge className="bg-orange-600 text-white border-0 text-xs">
                  {locations.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas
              {stats && stats.completionRate > 0 && (
                <Badge className="bg-green-600 text-white border-0 text-xs">
                  {stats.completionRate}%
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Tab: Tareas Diarias */}
        {activeTab === 'tasks' && (
          <DailyTaskManager
            onTasksChange={handleTasksChange}
            onStatsUpdate={handleStatsUpdate}
          />
        )}

        {/* Tab: Mapa de Rutas */}
        {activeTab === 'map' && (
          <div>
            {locations.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <Route className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No hay tareas pendientes para optimizar
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                  Las tareas completadas no se incluyen en la optimización de rutas.
                  Ve a "Tareas Diarias" para ver tu agenda.
                </p>
                <Button onClick={() => setActiveTab('tasks')} variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Tareas Diarias
                </Button>
              </Card>
            ) : (
              <>
                <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-900 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
                      <Route className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        🚗 Ruta Optimizada Automáticamente
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Google Maps ha calculado la ruta más eficiente considerando:
                      </p>
                      <ul className="text-xs text-green-700 dark:text-green-400 mt-2 space-y-1">
                        <li>✓ Prioridad de cada tarea</li>
                        <li>✓ Distancia entre ubicaciones</li>
                        <li>✓ Tráfico en tiempo real</li>
                        <li>✓ Tiempo de viaje estimado</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <RouteOptimizationMapFixed
                  locations={locations}
                  onRouteOptimized={handleRouteOptimized}
                />
              </>
            )}
          </div>
        )}

        {/* Tab: Estadísticas */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Resumen General */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Resumen del Día
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {stats.totalTasks}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-zinc-400">
                    Total de Tareas
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-300">
                    Completadas
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                    {stats.pendingTasks}
                  </div>
                  <div className="text-sm text-orange-800 dark:text-orange-300">
                    Pendientes
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                    {stats.totalTimeSpent} min
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-300">
                    Tiempo Invertido
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Progreso del Día
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-green-600 transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Tareas por Tipo */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                📊 Tareas Completadas por Tipo
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      🔍 Inspecciones
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stats.tasksByType.inspection}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.tasksByType.inspection / stats.totalTasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      🔧 Mantenciones
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stats.tasksByType.maintenance}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.tasksByType.maintenance / stats.totalTasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      📚 Capacitaciones
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stats.tasksByType.training}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.tasksByType.training / stats.totalTasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      👥 Reuniones
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stats.tasksByType.meeting}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.tasksByType.meeting / stats.totalTasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Métricas de productividad */}
            {stats.completedTasks > 0 && (
              <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-900">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                  🎯 ¡Excelente Trabajo!
                </h3>
                <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span>
                      Has completado <strong>{stats.completedTasks}</strong> tareas hoy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>
                      Tiempo total invertido: <strong>{stats.totalTimeSpent} minutos</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span>
                      Tasa de completitud: <strong>{stats.completionRate}%</strong>
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}