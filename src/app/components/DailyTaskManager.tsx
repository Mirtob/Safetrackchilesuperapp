import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  CheckCircle2, Circle, GripVertical, Clock, MapPin, 
  Edit2, Trash2, Plus, Calendar, TrendingUp, BarChart3,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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

interface DailyTaskManagerProps {
  onTasksChange?: (tasks: DailyTask[]) => void;
  onStatsUpdate?: (stats: TaskStats) => void;
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

const ITEM_TYPE = 'TASK';

interface DraggableTaskProps {
  task: DailyTask;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEditPriority: (taskId: string, newPriority: number) => void;
}

function DraggableTask({ task, index, moveTask, onToggleComplete, onDelete, onEditPriority }: DraggableTaskProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    }
  });

  const getTaskIcon = (taskType: string): string => {
    switch (taskType) {
      case 'inspection': return '🔍';
      case 'maintenance': return '🔧';
      case 'training': return '📚';
      case 'meeting': return '👥';
      default: return '📋';
    }
  };

  const getTaskColor = (taskType: string): string => {
    switch (taskType) {
      case 'inspection': return 'bg-orange-100 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900';
      case 'maintenance': return 'bg-red-100 dark:bg-red-950/20 border-red-300 dark:border-red-900';
      case 'training': return 'bg-blue-100 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900';
      case 'meeting': return 'bg-green-100 dark:bg-green-950/20 border-green-300 dark:border-green-900';
      default: return 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700';
    }
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 rounded-lg border-2 cursor-move transition-all ${
        getTaskColor(task.taskType)
      } ${task.status === 'completed' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div className="text-slate-400 dark:text-zinc-600 mt-1">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Checkbox de completado */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-1 transition-transform hover:scale-110"
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400 dark:text-zinc-600" />
          )}
        </button>

        {/* Contenido de la tarea */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold text-slate-900 dark:text-white ${
              task.status === 'completed' ? 'line-through' : ''
            }`}>
              {getTaskIcon(task.taskType)} {task.title}
            </h3>
            <Badge className="bg-orange-600 text-white text-xs border-0 flex-shrink-0">
              P{task.priority}
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <MapPin className="w-4 h-4" />
              <span>{task.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedDuration} minutos estimados</span>
            </div>
          </div>

          {task.status === 'completed' && task.completedAt && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded text-xs text-green-800 dark:text-green-300">
              ✅ Completada: {new Date(task.completedAt).toLocaleString('es-CL')}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onEditPriority(task.id, Math.min(task.priority + 1, 5))}
            className="p-1 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded transition-colors"
            title="Aumentar prioridad"
          >
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => onEditPriority(task.id, Math.max(task.priority - 1, 1))}
            className="p-1 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded transition-colors"
            title="Disminuir prioridad"
          >
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function DailyTaskManager({ onTasksChange, onStatsUpdate }: DailyTaskManagerProps) {
  // Tareas de ejemplo (en producción vendrían de Supabase)
  const [tasks, setTasks] = useState<DailyTask[]>([
    {
      id: '1',
      title: 'Inspección Mensual Extintores - Bodega A',
      location: 'Av. Providencia 1234, Providencia',
      taskType: 'inspection',
      priority: 5,
      estimatedDuration: 30,
      status: 'pending',
      lat: -33.4250,
      lng: -70.6106
    },
    {
      id: '2',
      title: 'Mantención Preventiva Compresor',
      location: 'Calle Los Aromos 567, Pudahuel',
      taskType: 'maintenance',
      priority: 4,
      estimatedDuration: 45,
      status: 'pending',
      lat: -33.4403,
      lng: -70.7399
    },
    {
      id: '3',
      title: 'Capacitación Uso de EPP',
      location: 'Av. Libertador Bernardo O\'Higgins 890, Santiago Centro',
      taskType: 'training',
      priority: 3,
      estimatedDuration: 60,
      status: 'pending',
      lat: -33.4450,
      lng: -70.6570
    },
    {
      id: '4',
      title: 'Reunión Comité Paritario',
      location: 'Av. Apoquindo 4501, Las Condes',
      taskType: 'meeting',
      priority: 3,
      estimatedDuration: 45,
      status: 'pending',
      lat: -33.4090,
      lng: -70.5750
    },
    {
      id: '5',
      title: 'Inspección de Señalética de Emergencia',
      location: 'Av. Vicuña Mackenna 5678, La Florida',
      taskType: 'inspection',
      priority: 2,
      estimatedDuration: 25,
      status: 'pending',
      lat: -33.5200,
      lng: -70.5990
    }
  ]);

  const [showCompleted, setShowCompleted] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTimeSpent: 0,
    completionRate: 0,
    tasksByType: {
      inspection: 0,
      maintenance: 0,
      training: 0,
      meeting: 0
    }
  });

  // Calcular estadísticas
  useEffect(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const totalTimeSpent = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.estimatedDuration, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByType = {
      inspection: tasks.filter(t => t.taskType === 'inspection' && t.status === 'completed').length,
      maintenance: tasks.filter(t => t.taskType === 'maintenance' && t.status === 'completed').length,
      training: tasks.filter(t => t.taskType === 'training' && t.status === 'completed').length,
      meeting: tasks.filter(t => t.taskType === 'meeting' && t.status === 'completed').length
    };

    const newStats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalTimeSpent,
      completionRate,
      tasksByType
    };

    setStats(newStats);

    // Notificar al padre
    if (onStatsUpdate) {
      onStatsUpdate(newStats);
    }
  }, [tasks]); // Removido onStatsUpdate de las dependencias

  // Notificar cambios al padre
  useEffect(() => {
    if (onTasksChange) {
      onTasksChange(tasks);
    }
  }, [tasks]); // Removido onTasksChange de las dependencias

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const draggedTask = tasks[dragIndex];
    const newTasks = [...tasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, draggedTask);
    
    // Actualizar prioridades según nuevo orden
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      priority: newTasks.length - index
    }));

    setTasks(updatedTasks);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'completed' ? 'pending' : 'completed';
          const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

          if (newStatus === 'completed') {
            toast.success('✅ Tarea Completada', {
              description: `${task.title} marcada como completada`,
              duration: 3000
            });
          }

          return {
            ...task,
            status: newStatus,
            completedAt
          };
        }
        return task;
      })
    );
  };

  const handleDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    
    toast.info('🗑️ Tarea Eliminada', {
      description: `${task?.title} ha sido eliminada`,
      duration: 2000
    });
  };

  const handleEditPriority = (taskId: string, newPriority: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, priority: newPriority } : task
      )
    );
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">Total Tareas</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalTasks}
            </div>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-800 dark:text-green-300">Completadas</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.completedTasks}
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-800 dark:text-orange-300">Pendientes</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingTasks}
            </div>
          </Card>

          <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-800 dark:text-purple-300">% Completado</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.completionRate}%
            </div>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎯 Customiza tu Agenda Diaria
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>Arrastra</strong> las tareas para reordenarlas según tus prioridades</li>
                <li>• Usa <strong>⬆️ ⬇️</strong> para ajustar la prioridad numérica</li>
                <li>• <strong>Marca completado</strong> al finalizar cada tarea</li>
                <li>• Las estadísticas se actualizan automáticamente</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Tareas Pendientes */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Tareas Pendientes ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingTasks.map((task, index) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  index={index}
                  moveTask={moveTask}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onEditPriority={handleEditPriority}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Tareas Completadas */}
        {completedTasks.length > 0 && (
          <div>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Tareas Completadas ({completedTasks.length})
              </span>
              {showCompleted ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showCompleted && (
              <div className="space-y-3">
                <AnimatePresence>
                  {completedTasks.map((task, index) => (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      index={pendingTasks.length + index}
                      moveTask={moveTask}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDelete}
                      onEditPriority={handleEditPriority}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </DndProvider>
  );
}