import { useState } from 'react';
import { 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  TrendingUp,
  FileText,
  Play,
  CheckSquare,
  XCircle,
  Zap,
  Target,
  BarChart3,
  Send
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';

interface MonthlyWorkPlanProps {
  onBack: () => void;
  company?: string;
}

interface Task {
  id: string;
  type: 'simulacro' | 'charla' | 'inspeccion' | 'revision' | 'capacitacion';
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  responsable: string;
  progress: number;
  requiredBy: string; // Normativa
}

export function MonthlyWorkPlan({ onBack, company = 'Constructora Los Andes S.A.' }: MonthlyWorkPlanProps) {
  const [currentMonth] = useState(new Date());
  const monthName = currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  // Plan de trabajo generado automáticamente según programa anual
  const [tasks] = useState<Task[]>([
    {
      id: 'T001',
      type: 'simulacro',
      title: 'Simulacro de Evacuación por Sismo',
      description: 'Simulacro planificado según programa anual. Incluye evacuación completa de todas las instalaciones.',
      dueDate: '2026-01-30',
      status: 'pending',
      priority: 'high',
      responsable: 'Juan Pérez',
      progress: 0,
      requiredBy: 'D.S. 594 Art. 42 - Plan de Emergencia'
    },
    {
      id: 'T002',
      type: 'charla',
      title: 'Charla de Ergonomía 1/4',
      description: 'Primera charla mensual de ergonomía: Posturas correctas en trabajo de oficina',
      dueDate: '2026-01-28',
      status: 'completed',
      priority: 'medium',
      responsable: 'Juan Pérez',
      progress: 100,
      requiredBy: 'Ley 20.001 - Peso Máximo de Carga'
    },
    {
      id: 'T003',
      type: 'charla',
      title: 'Charla de Ergonomía 2/4',
      description: 'Segunda charla mensual: Manipulación manual de cargas',
      dueDate: '2026-01-29',
      status: 'completed',
      priority: 'medium',
      responsable: 'Juan Pérez',
      progress: 100,
      requiredBy: 'Ley 20.001'
    },
    {
      id: 'T004',
      type: 'charla',
      title: 'Charla de Ergonomía 3/4',
      description: 'Tercera charla mensual: Pausas activas y prevención de TME',
      dueDate: '2026-01-30',
      status: 'in-progress',
      priority: 'medium',
      responsable: 'Juan Pérez',
      progress: 60,
      requiredBy: 'Ley 20.001'
    },
    {
      id: 'T005',
      type: 'charla',
      title: 'Charla de Ergonomía 4/4',
      description: 'Cuarta charla mensual: Evaluación de puestos de trabajo',
      dueDate: '2026-02-01',
      status: 'overdue',
      priority: 'medium',
      responsable: 'Juan Pérez',
      progress: 0,
      requiredBy: 'Ley 20.001'
    },
    {
      id: 'T006',
      type: 'revision',
      title: 'Revisión de Extintores (20 unidades)',
      description: 'Revisión mensual de extintores portátiles en todas las instalaciones',
      dueDate: '2026-01-27',
      status: 'completed',
      priority: 'high',
      responsable: 'Juan Pérez',
      progress: 100,
      requiredBy: 'D.S. 594 Art. 44'
    },
    {
      id: 'T007',
      type: 'inspeccion',
      title: 'Inspección de Andamios',
      description: 'Inspección mensual de andamios y plataformas de trabajo en altura',
      dueDate: '2026-01-26',
      status: 'completed',
      priority: 'high',
      responsable: 'Juan Pérez',
      progress: 100,
      requiredBy: 'D.S. 594 Art. 42'
    },
    {
      id: 'T008',
      type: 'capacitacion',
      title: 'Capacitación en Espacios Confinados',
      description: 'Capacitación programada para trabajadores que operan en espacios confinados',
      dueDate: '2026-01-31',
      status: 'pending',
      priority: 'high',
      responsable: 'Juan Pérez',
      progress: 0,
      requiredBy: 'D.S. 594 Art. 48'
    },
    {
      id: 'T009',
      type: 'inspeccion',
      title: 'Inspección de Herramientas Eléctricas',
      description: 'Revisión y registro de estado de herramientas eléctricas',
      dueDate: '2026-01-28',
      status: 'in-progress',
      priority: 'medium',
      responsable: 'Juan Pérez',
      progress: 45,
      requiredBy: 'D.S. 594 Art. 45'
    },
    {
      id: 'T010',
      type: 'charla',
      title: 'Charla 5 Minutos: Orden y Limpieza',
      description: 'Charla diaria sobre importancia del orden y limpieza en áreas de trabajo',
      dueDate: '2026-01-27',
      status: 'completed',
      priority: 'low',
      responsable: 'Juan Pérez',
      progress: 100,
      requiredBy: 'D.S. 594 Art. 10'
    }
  ]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  const totalProgress = Math.round((completedTasks / tasks.length) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completada</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">En Progreso</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencida</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pendiente</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'simulacro':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'charla':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'inspeccion':
        return <CheckSquare className="w-5 h-5 text-purple-600" />;
      case 'revision':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'capacitacion':
        return <TrendingUp className="w-5 h-5 text-cyan-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleGenerateReport = () => {
    toast.loading('Generando informe de cumplimiento...', { id: 'report' });
    setTimeout(() => {
      toast.success('✅ Informe generado exitosamente', {
        id: 'report',
        description: 'El informe de cumplimiento del programa está listo para descargar'
      });
    }, 2000);
  };

  const handleSendToManagement = () => {
    toast.loading('Enviando informe a Gerencia...', { id: 'send' });
    setTimeout(() => {
      toast.success('✅ Informe enviado', {
        id: 'send',
        description: 'El informe ha sido enviado por email al equipo gerencial'
      });
    }, 1500);
  };

  const handleStartTask = (taskId: string) => {
    toast.success('Iniciando actividad', {
      description: 'Redirigiendo al formulario correspondiente...'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Plan de Trabajo Mensual
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400 capitalize">
                  {monthName} • {company}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Generar Informe
              </Button>
              <Button
                onClick={handleSendToManagement}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar a Gerencia
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Cumplimiento</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalProgress}%</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Completadas</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{completedTasks}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">En Progreso</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{inProgressTasks}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-medium text-yellow-900 dark:text-yellow-300">Pendientes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{pendingTasks}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Vencidas</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{overdueTasks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* AI Suggestion Banner */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-purple-950/20 border-purple-200 dark:border-purple-900">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  🤖 Plan Automático Generado por IA
                </h3>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                Según tu <strong>Programa de Trabajo Anual</strong> registrado en el sistema y los riesgos identificados en la empresa, 
                este mes te corresponde realizar: <strong>1 simulacro</strong>, <strong>4 charlas de ergonomía</strong> y 
                revisar <strong>20 extintores</strong>. La IA ha organizado automáticamente tus actividades.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-600 text-white">
                  Basado en D.S. 594
                </Badge>
                <Badge className="bg-pink-600 text-white">
                  Ley 20.001 - Ergonomía
                </Badge>
                <Badge className="bg-blue-600 text-white">
                  Plan de Emergencia
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    task.status === 'overdue'
                      ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10'
                      : task.status === 'completed'
                      ? 'border-green-300 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10'
                      : task.status === 'in-progress'
                      ? 'border-blue-300 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getTypeIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {task.title}
                            </h4>
                            {getStatusBadge(task.status)}
                            {task.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Alta Prioridad
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Vence: {new Date(task.dueDate).toLocaleDateString('es-CL')}
                            </span>
                            <span>•</span>
                            <span>📋 {task.requiredBy}</span>
                          </div>
                          {task.progress > 0 && task.progress < 100 && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1 text-xs text-slate-600 dark:text-zinc-400">
                                <span>Progreso</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <Button
                            onClick={() => handleStartTask(task.id)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Iniciar Actividad
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button
                            onClick={() => handleStartTask(task.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Continuar
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-600"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ver Registro
                          </Button>
                        )}
                        {task.status === 'overdue' && (
                          <Button
                            onClick={() => handleStartTask(task.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Realizar Urgente
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Help Notice */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                🎯 Tu Hoja de Ruta Automática
              </div>
              <div className="text-purple-800 dark:text-purple-300">
                El sistema generó automáticamente tu plan mensual basándose en tu Programa de Trabajo Anual y las normativas vigentes. 
                Al finalizar el mes, presiona "Generar Informe" para crear el Informe de Cumplimiento de Programa que entregarás a Gerencia.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
