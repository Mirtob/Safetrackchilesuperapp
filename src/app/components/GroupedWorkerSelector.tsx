import { useState } from 'react';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Check,
  X,
  Settings,
  Plus,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

interface Worker {
  id: string;
  name: string;
  rut: string;
  position?: string;
  email: string;
  phone?: string;
  department?: string;
  groupId?: string;
}

interface WorkerGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  count?: number;
}

interface GroupedWorkerSelectorProps {
  workers: Worker[];
  selectedWorkerIds: string[];
  onSelectionChange: (workerIds: string[]) => void;
  onClose: () => void;
  onManageGroups: () => void;
  groups: WorkerGroup[];
}

export function GroupedWorkerSelector({
  workers,
  selectedWorkerIds,
  onSelectionChange,
  onClose,
  onManageGroups,
  groups
}: GroupedWorkerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['all']));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedWorkerIds));

  // Agrupar trabajadores por grupo
  const getWorkersByGroup = () => {
    const grouped: Record<string, Worker[]> = {};
    
    workers.forEach(worker => {
      const groupId = worker.groupId || 'sin-grupo';
      if (!grouped[groupId]) {
        grouped[groupId] = [];
      }
      grouped[groupId].push(worker);
    });
    
    return grouped;
  };

  const workersByGroup = getWorkersByGroup();

  // Filtrar trabajadores por búsqueda
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.rut.includes(searchTerm) ||
    (worker.position && worker.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleWorker = (workerId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(workerId)) {
      newSelected.delete(workerId);
    } else {
      newSelected.add(workerId);
    }
    setSelectedIds(newSelected);
  };

  const selectAllInGroup = (groupId: string) => {
    const groupWorkers = workersByGroup[groupId] || [];
    const newSelected = new Set(selectedIds);
    
    // Si todos están seleccionados, deseleccionar; si no, seleccionar todos
    const allSelected = groupWorkers.every(w => newSelected.has(w.id));
    
    if (allSelected) {
      groupWorkers.forEach(w => newSelected.delete(w.id));
      toast.info('Grupo deseleccionado', {
        description: `${groupWorkers.length} trabajadores removidos`
      });
    } else {
      groupWorkers.forEach(w => newSelected.add(w.id));
      toast.success('Grupo seleccionado', {
        description: `${groupWorkers.length} trabajadores agregados`
      });
    }
    
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allWorkerIds = workers.map(w => w.id);
    setSelectedIds(new Set(allWorkerIds));
    toast.success('Todos los trabajadores seleccionados', {
      description: `${allWorkerIds.length} trabajadores agregados`
    });
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    toast.info('Selección limpiada');
  };

  const handleConfirm = () => {
    onSelectionChange(Array.from(selectedIds));
    onClose();
  };

  const getGroupInfo = (groupId: string) => {
    return groups.find(g => g.id === groupId) || {
      id: 'sin-grupo',
      name: 'Sin Grupo Asignado',
      color: 'bg-slate-100 dark:bg-zinc-800',
      icon: '👷'
    };
  };

  const isGroupFullySelected = (groupId: string) => {
    const groupWorkers = workersByGroup[groupId] || [];
    return groupWorkers.length > 0 && groupWorkers.every(w => selectedIds.has(w.id));
  };

  const getGroupSelectionCount = (groupId: string) => {
    const groupWorkers = workersByGroup[groupId] || [];
    return groupWorkers.filter(w => selectedIds.has(w.id)).length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-t-3xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Seleccionar Trabajadores
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {selectedIds.size} de {workers.length} seleccionados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onManageGroups}
                variant="outline"
                size="sm"
                className="hidden lg:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gestionar Grupos
              </Button>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, RUT o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-800"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={selectAll}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Seleccionar Todos
            </Button>
            <Button
              onClick={clearAll}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
            <div className="flex-1" />
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {selectedIds.size} seleccionados
            </Badge>
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {searchTerm ? (
            // Vista de búsqueda (sin grupos)
            <div className="space-y-2">
              <div className="text-sm text-slate-600 dark:text-zinc-400 mb-3">
                {filteredWorkers.length} resultado(s) encontrado(s)
              </div>
              {filteredWorkers.map(worker => (
                <div
                  key={worker.id}
                  onClick={() => toggleWorker(worker.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedIds.has(worker.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                      selectedIds.has(worker.id)
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}>
                      {selectedIds.has(worker.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {worker.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        <span>{worker.rut}</span>
                        {worker.position && (
                          <>
                            <span>•</span>
                            <span>{worker.position}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista de grupos
            <>
              {Object.entries(workersByGroup).map(([groupId, groupWorkers]) => {
                const group = getGroupInfo(groupId);
                const isExpanded = expandedGroups.has(groupId);
                const isFullySelected = isGroupFullySelected(groupId);
                const selectionCount = getGroupSelectionCount(groupId);

                return (
                  <Card key={groupId} className="overflow-hidden">
                    {/* Group Header */}
                    <div
                      className={`p-4 cursor-pointer transition-colors ${group.color} hover:opacity-80`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1" onClick={() => toggleGroup(groupId)}>
                          <button className="text-slate-600 dark:text-zinc-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <span className="text-2xl">{group.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {group.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                              {selectionCount} / {groupWorkers.length} seleccionados
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${
                              selectionCount > 0 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {groupWorkers.length}
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllInGroup(groupId);
                            }}
                            size="sm"
                            variant={isFullySelected ? "default" : "outline"}
                            className={isFullySelected ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            {isFullySelected ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Todos
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Todos
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Group Workers */}
                    {isExpanded && (
                      <div className="p-4 space-y-2 bg-white dark:bg-zinc-900">
                        {groupWorkers.map(worker => (
                          <div
                            key={worker.id}
                            onClick={() => toggleWorker(worker.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedIds.has(worker.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                                selectedIds.has(worker.id)
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-slate-300 dark:border-zinc-600'
                              }`}>
                                {selectedIds.has(worker.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-slate-900 dark:text-white text-sm">
                                  {worker.name}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mt-1">
                                  <span>{worker.rut}</span>
                                  {worker.position && (
                                    <>
                                      <span>•</span>
                                      <span>{worker.position}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {filteredWorkers.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-zinc-400">
                No se encontraron trabajadores
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={selectedIds.size === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
