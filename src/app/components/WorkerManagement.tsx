import { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Search,
  Users,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit2
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

interface WorkerManagementProps {
  onBack: () => void;
  companyId?: string;
}

interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  hasInduction: boolean;
  lastTraining?: string;
}

export function WorkerManagement({ onBack, companyId }: WorkerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());

  // Base de datos de trabajadores por empresa
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'W001',
      rut: '12.345.678-9',
      name: 'Pedro Rojas González',
      position: 'Operador de Maquinaria',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 8765 4321',
      email: 'p.rojas@losandes.cl',
      status: 'active',
      hasInduction: true,
      lastTraining: '2026-01-20'
    },
    {
      id: 'W002',
      rut: '11.222.333-4',
      name: 'Carlos Muñoz Soto',
      position: 'Maestro Albañil',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 7654 3210',
      email: 'c.munoz@losandes.cl',
      status: 'active',
      hasInduction: true,
      lastTraining: '2026-01-15'
    },
    {
      id: 'W003',
      rut: '13.444.555-6',
      name: 'Luis Fernández Pérez',
      position: 'Soldador',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 6543 2109',
      email: 'l.fernandez@losandes.cl',
      status: 'active',
      hasInduction: false,
      lastTraining: undefined
    },
    {
      id: 'W004',
      rut: '14.555.666-7',
      name: 'Jorge Silva Campos',
      position: 'Electricista',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 5432 1098',
      email: 'j.silva@losandes.cl',
      status: 'active',
      hasInduction: true,
      lastTraining: '2026-01-18'
    },
    {
      id: 'W005',
      rut: '15.666.777-8',
      name: 'Manuel Torres Ruiz',
      position: 'Ayudante General',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 4321 0987',
      email: 'm.torres@losandes.cl',
      status: 'active',
      hasInduction: true,
      lastTraining: '2026-01-22'
    },
    {
      id: 'W006',
      rut: '16.777.888-9',
      name: 'Andrés Vargas Díaz',
      position: 'Carpintero',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 3210 9876',
      email: 'a.vargas@losandes.cl',
      status: 'inactive',
      hasInduction: true,
      lastTraining: '2025-12-10'
    },
    {
      id: 'W007',
      rut: '17.888.999-0',
      name: 'Ricardo Morales Castro',
      position: 'Operario',
      company: 'Minera El Cobre Ltda.',
      phone: '+56 9 2109 8765',
      email: 'r.morales@elcobre.cl',
      status: 'active',
      hasInduction: true,
      lastTraining: '2026-01-10'
    },
    {
      id: 'W008',
      rut: '18.999.000-1',
      name: 'Fernando Guzmán Sáez',
      position: 'Perforista',
      company: 'Minera El Cobre Ltda.',
      phone: '+56 9 1098 7654',
      email: 'f.guzman@elcobre.cl',
      status: 'active',
      hasInduction: false,
      lastTraining: undefined
    }
  ]);

  const [newWorker, setNewWorker] = useState({
    rut: '',
    name: '',
    position: '',
    phone: '',
    email: '',
    company: 'Constructora Los Andes S.A.'
  });

  // Filtrar trabajadores
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.rut.includes(searchTerm) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = workers.filter(w => w.status === 'active').length;
  const inductionPendingCount = workers.filter(w => !w.hasInduction && w.status === 'active').length;

  const handleAddWorker = () => {
    if (!newWorker.rut || !newWorker.name || !newWorker.position) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    const worker: Worker = {
      id: `W${String(workers.length + 1).padStart(3, '0')}`,
      ...newWorker,
      status: 'active',
      hasInduction: false
    };

    setWorkers([...workers, worker]);
    setNewWorker({
      rut: '',
      name: '',
      position: '',
      phone: '',
      email: '',
      company: 'Constructora Los Andes S.A.'
    });
    setShowAddWorker(false);
    toast.success('Trabajador agregado exitosamente');
  };

  const toggleWorkerSelection = (workerId: string) => {
    const newSelection = new Set(selectedWorkers);
    if (newSelection.has(workerId)) {
      newSelection.delete(workerId);
    } else {
      newSelection.add(workerId);
    }
    setSelectedWorkers(newSelection);
  };

  const selectAll = () => {
    if (selectedWorkers.size === filteredWorkers.length) {
      setSelectedWorkers(new Set());
    } else {
      setSelectedWorkers(new Set(filteredWorkers.map(w => w.id)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">Gestión de Trabajadores</h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Nómina completa por empresa</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddWorker(true)}
              className="bg-[#FF8C00] hover:bg-orange-600 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Trabajador
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Total Trabajadores</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">{workers.length}</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                En nómina
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Activos</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">{activeCount}</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                Disponibles
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 dark:text-orange-400 text-sm">Sin Inducción</span>
                <AlertTriangle className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="text-3xl text-orange-900 dark:text-orange-300 mb-1">{inductionPendingCount}</div>
              <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] border-0 text-xs">
                Requiere atención
              </Badge>
            </div>
          </Card>
        </div>

        {/* Barra de búsqueda y filtros */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, RUT o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                >
                  Activos
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                  size="sm"
                >
                  Inactivos
                </Button>
              </div>
            </div>

            {selectedWorkers.size > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  {selectedWorkers.size} trabajador(es) seleccionado(s)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Selección
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedWorkers(new Set())}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Acciones masivas */}
        <div className="flex gap-2">
          <Button
            onClick={selectAll}
            variant="outline"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {selectedWorkers.size === filteredWorkers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Nómina
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar desde Excel
          </Button>
        </div>

        {/* Lista de trabajadores */}
        <div className="space-y-3">
          <h2 className="text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <span className="w-1 h-6 bg-[#FF8C00] rounded-full" />
            Nómina de Trabajadores ({filteredWorkers.length})
          </h2>

          {filteredWorkers.map((worker) => (
            <Card 
              key={worker.id}
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:shadow-lg transition-all"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Checkbox de selección */}
                  <input
                    type="checkbox"
                    checked={selectedWorkers.has(worker.id)}
                    onChange={() => toggleWorkerSelection(worker.id)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-[#FF8C00] focus:ring-[#FF8C00]"
                  />

                  {/* Información del trabajador */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{worker.name}</h3>
                          <Badge className={
                            worker.status === 'active' 
                              ? 'bg-green-500/20 text-green-600 border-0'
                              : 'bg-slate-500/20 text-slate-600 border-0'
                          }>
                            {worker.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {!worker.hasInduction && (
                            <Badge className="bg-red-500/20 text-red-600 border-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Sin inducción
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-zinc-400">
                          <span className="font-mono">{worker.rut}</span>
                          <span>•</span>
                          <span>{worker.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-zinc-300">{worker.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-zinc-300">{worker.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-zinc-300">{worker.email}</span>
                      </div>
                      {worker.lastTraining && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-slate-700 dark:text-zinc-300">
                            Última capacitación: {worker.lastTraining}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#0055A4] border-[#0055A4]/30 hover:bg-[#0055A4]/10"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      {!worker.hasInduction && (
                        <Button
                          size="sm"
                          className="bg-[#FF8C00] hover:bg-orange-600 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Registrar Inducción
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de agregar trabajador */}
      {showAddWorker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddWorker(false)}>
          <Card 
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white text-xl mb-6">Agregar Nuevo Trabajador</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      type="text"
                      placeholder="12.345.678-9"
                      value={newWorker.rut}
                      onChange={(e) => setNewWorker({ ...newWorker, rut: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez González"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      type="text"
                      placeholder="Operador de Grúa"
                      value={newWorker.position}
                      onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      type="text"
                      value={newWorker.company}
                      onChange={(e) => setNewWorker({ ...newWorker, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="trabajador@empresa.cl"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddWorker}
                  className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar Trabajador
                </Button>
                <Button
                  onClick={() => setShowAddWorker(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
