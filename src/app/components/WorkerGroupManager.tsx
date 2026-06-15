import { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Save,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface WorkerGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  count?: number;
}

interface WorkerGroupManagerProps {
  groups: WorkerGroup[];
  onSave: (groups: WorkerGroup[]) => void;
  onClose: () => void;
  workerCounts: Record<string, number>; // Cantidad de trabajadores por grupo
}

const PRESET_ICONS = ['👷', '👨‍🔧', '👨‍🏭', '👨‍💼', '🏗️', '⚙️', '🔧', '🛠️', '📦', '🚛', '🏭', '⛑️'];
const PRESET_COLORS = [
  { name: 'Azul', value: 'bg-blue-100 dark:bg-blue-950/20', border: 'border-blue-500' },
  { name: 'Verde', value: 'bg-green-100 dark:bg-green-950/20', border: 'border-green-500' },
  { name: 'Naranja', value: 'bg-orange-100 dark:bg-orange-950/20', border: 'border-orange-500' },
  { name: 'Púrpura', value: 'bg-purple-100 dark:bg-purple-950/20', border: 'border-purple-500' },
  { name: 'Rojo', value: 'bg-red-100 dark:bg-red-950/20', border: 'border-red-500' },
  { name: 'Cyan', value: 'bg-cyan-100 dark:bg-cyan-950/20', border: 'border-cyan-500' },
  { name: 'Amarillo', value: 'bg-amber-100 dark:bg-amber-950/20', border: 'border-amber-500' },
  { name: 'Rosa', value: 'bg-pink-100 dark:bg-pink-950/20', border: 'border-pink-500' }
];

export function WorkerGroupManager({ 
  groups, 
  onSave, 
  onClose,
  workerCounts 
}: WorkerGroupManagerProps) {
  const [editedGroups, setEditedGroups] = useState<WorkerGroup[]>([...groups]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState<WorkerGroup>({
    id: '',
    name: '',
    color: PRESET_COLORS[0].value,
    icon: PRESET_ICONS[0]
  });

  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('El nombre del grupo es requerido');
      return;
    }

    const groupWithId = {
      ...newGroup,
      id: `group-${Date.now()}`,
      name: newGroup.name.trim()
    };

    setEditedGroups([...editedGroups, groupWithId]);
    setNewGroup({
      id: '',
      name: '',
      color: PRESET_COLORS[0].value,
      icon: PRESET_ICONS[0]
    });
    setIsCreating(false);
    toast.success('Grupo agregado', {
      description: 'Recuerda guardar los cambios'
    });
  };

  const handleEditGroup = (groupId: string, updates: Partial<WorkerGroup>) => {
    setEditedGroups(editedGroups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = editedGroups.find(g => g.id === groupId);
    const count = workerCounts[groupId] || 0;
    
    if (count > 0) {
      toast.warning('Advertencia', {
        description: `Este grupo tiene ${count} trabajador(es) asignado(s). Los trabajadores quedarán sin grupo.`
      });
    }

    setEditedGroups(editedGroups.filter(g => g.id !== groupId));
    toast.info('Grupo eliminado', {
      description: 'Recuerda guardar los cambios'
    });
  };

  const handleSave = () => {
    // Validar que todos los grupos tengan nombre
    const invalidGroups = editedGroups.filter(g => !g.name.trim());
    if (invalidGroups.length > 0) {
      toast.error('Error de validación', {
        description: 'Todos los grupos deben tener un nombre'
      });
      return;
    }

    onSave(editedGroups);
    toast.success('✅ Grupos guardados exitosamente', {
      description: `${editedGroups.length} grupos configurados`
    });
    onClose();
  };

  const getGroupCount = (groupId: string) => {
    return workerCounts[groupId] || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-t-3xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Gestionar Grupos de Trabajadores
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Crea y organiza grupos personalizados para tu empresa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Existing Groups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Grupos Existentes ({editedGroups.length})
              </h4>
              <Button
                onClick={() => setIsCreating(true)}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Grupo
              </Button>
            </div>

            {editedGroups.length === 0 && (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-zinc-400 mb-4">
                  No hay grupos configurados
                </p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Grupo
                </Button>
              </Card>
            )}

            {editedGroups.map(group => (
              <Card key={group.id} className="overflow-hidden">
                {isEditing === group.id ? (
                  // Edit Mode
                  <div className="p-4 space-y-4">
                    <div>
                      <Label>Nombre del Grupo</Label>
                      <Input
                        value={group.name}
                        onChange={(e) => handleEditGroup(group.id, { name: e.target.value })}
                        placeholder="Ej: Supervisores"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Icono</Label>
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {PRESET_ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => handleEditGroup(group.id, { icon })}
                            className={`p-3 text-2xl border-2 rounded-lg transition-all ${
                              group.icon === icon
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                                : 'border-slate-200 dark:border-zinc-700 hover:border-orange-300'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Color</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {PRESET_COLORS.map(colorOption => (
                          <button
                            key={colorOption.value}
                            onClick={() => handleEditGroup(group.id, { color: colorOption.value })}
                            className={`p-3 rounded-lg border-2 transition-all ${colorOption.value} ${
                              group.color === colorOption.value
                                ? colorOption.border
                                : 'border-transparent hover:border-slate-300 dark:hover:border-zinc-600'
                            }`}
                          >
                            <div className="text-xs font-medium text-slate-900 dark:text-white">
                              {colorOption.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(null)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={() => setIsEditing(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className={`p-4 ${group.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{group.icon}</span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {group.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                            {getGroupCount(group.id)} trabajador(es) asignado(s)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setIsEditing(group.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteGroup(group.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Create New Group */}
          {isCreating && (
            <Card className="p-4 space-y-4 border-2 border-orange-500 dark:border-orange-600">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  Crear Nuevo Grupo
                </h4>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <Label>Nombre del Grupo *</Label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Ej: Supervisores, Operarios de Bodega, Grueros..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Icono</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewGroup({ ...newGroup, icon })}
                      className={`p-3 text-2xl border-2 rounded-lg transition-all ${
                        newGroup.icon === icon
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-orange-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {PRESET_COLORS.map(colorOption => (
                    <button
                      key={colorOption.value}
                      onClick={() => setNewGroup({ ...newGroup, color: colorOption.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${colorOption.value} ${
                        newGroup.color === colorOption.value
                          ? colorOption.border
                          : 'border-transparent hover:border-slate-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-900 dark:text-white">
                        {colorOption.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddGroup}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Grupo
              </Button>
            </Card>
          )}

          {/* Info Card */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Importante:</strong> Los grupos te permiten organizar mejor a tus trabajadores y seleccionarlos más rápido en formularios. 
                Puedes asignar trabajadores a grupos desde la sección de gestión de trabajadores.
              </div>
            </div>
          </Card>
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
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
