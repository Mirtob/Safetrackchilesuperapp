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
  Edit2,
  Clock,
  FileText,
  Calendar,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  X,
  Save,
  User,
  IdCard,
  Briefcase,
  MapPin,
  Eye
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';

interface WorkerCRUDProps {
  onBack: () => void;
}

interface Training {
  type: string;
  date: string;
  expiryDate: string;
  status: 'vigente' | 'por-vencer' | 'vencida';
  daysRemaining?: number;
  requiredBy: string;
}

interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  company: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  contractType: 'indefinido' | 'plazo-fijo' | 'honorarios';
  startDate: string;
  status: 'active' | 'inactive';
  trainings: Training[];
  alertCount: number;
}

type FormMode = 'create' | 'edit' | 'view' | null;

export function WorkerCRUD({ onBack }: WorkerCRUDProps) {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'W001',
      rut: '12.345.678-9',
      name: 'Pedro Martínez López',
      position: 'Operador de Maquinaria Pesada',
      company: 'Constructora Los Andes S.A.',
      department: 'Operaciones',
      phone: '+56 9 8765 4321',
      email: 'p.martinez@losandes.cl',
      address: 'Av. Los Conquistadores 1234, Santiago',
      emergencyContact: 'María Martínez (Esposa)',
      emergencyPhone: '+56 9 8765 1111',
      contractType: 'indefinido',
      startDate: '2023-01-15',
      status: 'active',
      alertCount: 2,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-01-15',
          expiryDate: '2026-01-15',
          status: 'vigente',
          daysRemaining: 354,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Trabajo en Altura',
          date: '2024-06-20',
          expiryDate: '2025-06-20',
          status: 'vencida',
          daysRemaining: -220,
          requiredBy: 'D.S. 594'
        }
      ]
    },
    {
      id: 'W002',
      rut: '18.765.432-1',
      name: 'Ana Silva González',
      position: 'Supervisora de Seguridad',
      company: 'Constructora Los Andes S.A.',
      department: 'Seguridad y Salud Ocupacional',
      phone: '+56 9 7654 3210',
      email: 'a.silva@losandes.cl',
      address: 'Calle San Martín 567, Providencia',
      emergencyContact: 'Carlos Silva (Hermano)',
      emergencyPhone: '+56 9 7654 2222',
      contractType: 'indefinido',
      startDate: '2022-03-10',
      status: 'active',
      alertCount: 0,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-03-10',
          expiryDate: '2026-03-10',
          status: 'vigente',
          daysRemaining: 408,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Prevención de Riesgos',
          date: '2025-04-15',
          expiryDate: '2026-04-15',
          status: 'vigente',
          daysRemaining: 444,
          requiredBy: 'Ley 16.744'
        }
      ]
    },
    {
      id: 'W003',
      rut: '15.234.567-8',
      name: 'Roberto Muñoz Castro',
      position: 'Guardia de Seguridad',
      company: 'Constructora Los Andes S.A.',
      department: 'Seguridad Física',
      phone: '+56 9 6543 2109',
      email: 'r.munoz@losandes.cl',
      address: 'Pasaje Los Aromos 89, La Florida',
      emergencyContact: 'Elena Muñoz (Madre)',
      emergencyPhone: '+56 9 6543 3333',
      contractType: 'plazo-fijo',
      startDate: '2024-06-01',
      status: 'active',
      alertCount: 1,
      trainings: [
        {
          type: 'Inducción General',
          date: '2024-06-01',
          expiryDate: '2025-06-01',
          status: 'por-vencer',
          daysRemaining: 126,
          requiredBy: 'D.S. 40 Art. 21'
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'alerts'>('all');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<Partial<Worker>>({
    rut: '',
    name: '',
    position: '',
    company: 'Constructora Los Andes S.A.',
    department: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    contractType: 'indefinido',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    trainings: [],
    alertCount: 0
  });

  // Filtrar trabajadores
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.rut.includes(searchTerm) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && worker.status === 'active') ||
      (filterStatus === 'inactive' && worker.status === 'inactive') ||
      (filterStatus === 'alerts' && worker.alertCount > 0);

    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === 'active').length,
    inactive: workers.filter(w => w.status === 'inactive').length,
    withAlerts: workers.filter(w => w.alertCount > 0).length
  };

  // Funciones CRUD
  const handleCreate = () => {
    setFormMode('create');
    setFormData({
      rut: '',
      name: '',
      position: '',
      company: 'Constructora Los Andes S.A.',
      department: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      contractType: 'indefinido',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      trainings: [],
      alertCount: 0
    });
  };

  const handleEdit = (worker: Worker) => {
    setFormMode('edit');
    setSelectedWorker(worker);
    setFormData(worker);
  };

  const handleView = (worker: Worker) => {
    setFormMode('view');
    setSelectedWorker(worker);
    setFormData(worker);
  };

  const handleDelete = (worker: Worker) => {
    if (confirm(`¿Estás seguro de eliminar a ${worker.name}?\n\nEsta acción no se puede deshacer.`)) {
      setWorkers(prev => prev.filter(w => w.id !== worker.id));
      toast.success('✅ Trabajador eliminado', {
        description: `${worker.name} ha sido eliminado del sistema`
      });
    }
  };

  const handleSave = () => {
    // Validaciones
    if (!formData.rut?.trim()) {
      toast.error('RUT requerido', { description: 'Ingresa el RUT del trabajador' });
      return;
    }
    if (!formData.name?.trim()) {
      toast.error('Nombre requerido', { description: 'Ingresa el nombre completo' });
      return;
    }
    if (!formData.position?.trim()) {
      toast.error('Cargo requerido', { description: 'Ingresa el cargo del trabajador' });
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Teléfono requerido', { description: 'Ingresa un número de contacto' });
      return;
    }

    if (formMode === 'create') {
      // Crear nuevo trabajador
      const newWorker: Worker = {
        ...formData as Worker,
        id: `W${String(workers.length + 1).padStart(3, '0')}`
      };

      setWorkers(prev => [...prev, newWorker]);
      toast.success('✅ Trabajador creado', {
        description: `${newWorker.name} ha sido agregado al sistema`
      });
    } else if (formMode === 'edit' && selectedWorker) {
      // Editar trabajador existente
      setWorkers(prev => prev.map(w => 
        w.id === selectedWorker.id ? { ...formData as Worker, id: selectedWorker.id } : w
      ));
      toast.success('✅ Trabajador actualizado', {
        description: `Los datos de ${formData.name} han sido actualizados`
      });
    }

    // Cerrar formulario
    setFormMode(null);
    setSelectedWorker(null);
  };

  const handleCancel = () => {
    setFormMode(null);
    setSelectedWorker(null);
    setFormData({
      rut: '',
      name: '',
      position: '',
      company: 'Constructora Los Andes S.A.',
      department: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      contractType: 'indefinido',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      trainings: [],
      alertCount: 0
    });
  };

  const handleImportWorkers = () => {
    toast.info('🔄 Importar trabajadores', {
      description: 'Funcionalidad disponible próximamente'
    });
  };

  const handleExportWorkers = () => {
    toast.success('📥 Descargando listado', {
      description: `Exportando ${filteredWorkers.length} trabajadores a Excel`
    });
  };

  // Renderizar lista de trabajadores
  if (formMode === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              
              <Button
                onClick={handleCreate}
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Nuevo Trabajador
              </Button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                  Gestión de Trabajadores
                </h1>
                <p className="text-white/80 text-sm">
                  Administra el personal de la empresa
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Total</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-800 dark:text-green-300">Activos</span>
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                {stats.active}
              </div>
            </Card>

            <Card className="p-4 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Inactivos</span>
                <XCircle className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.inactive}
              </div>
            </Card>

            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-800 dark:text-amber-300">Con Alertas</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                {stats.withAlerts}
              </div>
            </Card>
          </div>

          {/* Búsqueda y Filtros */}
          <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, RUT o cargo..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  Todos ({stats.total})
                </Button>
                <Button
                  onClick={() => setFilterStatus('active')}
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  className={filterStatus === 'active' ? 'bg-green-600' : ''}
                >
                  Activos ({stats.active})
                </Button>
                <Button
                  onClick={() => setFilterStatus('alerts')}
                  variant={filterStatus === 'alerts' ? 'default' : 'outline'}
                  size="sm"
                  className={filterStatus === 'alerts' ? 'bg-amber-600' : ''}
                >
                  Alertas ({stats.withAlerts})
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleImportWorkers} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Importar
                </Button>
                <Button onClick={handleExportWorkers} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de trabajadores */}
          <div className="space-y-3">
            {filteredWorkers.length === 0 ? (
              <Card className="p-12 bg-white dark:bg-zinc-900 text-center">
                <Users className="w-16 h-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-zinc-400 mb-4">
                  {searchTerm ? 'No se encontraron trabajadores' : 'No hay trabajadores registrados'}
                </p>
                <Button onClick={handleCreate}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar Primer Trabajador
                </Button>
              </Card>
            ) : (
              filteredWorkers.map((worker) => (
                <Card 
                  key={worker.id}
                  className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {worker.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-zinc-400">
                            {worker.position} • {worker.department}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {worker.alertCount > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {worker.alertCount}
                            </Badge>
                          )}
                          <Badge 
                            className={
                              worker.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-0'
                            }
                          >
                            {worker.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                          <IdCard className="w-4 h-4" />
                          <span>{worker.rut}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                          <Phone className="w-4 h-4" />
                          <span>{worker.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{worker.email}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleView(worker)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          onClick={() => handleEdit(worker)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(worker)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar formulario (crear/editar/ver)
  const isViewMode = formMode === 'view';
  const title = formMode === 'create' ? 'Nuevo Trabajador' : formMode === 'edit' ? 'Editar Trabajador' : 'Detalles del Trabajador';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                {title}
              </h1>
              <p className="text-white/80 text-sm">
                {isViewMode ? 'Información del trabajador' : 'Completa los datos del trabajador'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="laboral">Datos Laborales</TabsTrigger>
              <TabsTrigger value="emergencia">Contacto Emergencia</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <IdCard className="w-4 h-4 inline mr-1" />
                    RUT *
                  </Label>
                  <Input
                    value={formData.rut}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                    placeholder="12.345.678-9"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Juan Pérez González"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono *
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    type="tel"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="trabajador@empresa.cl"
                    type="email"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Dirección
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Av. Principal 123, Comuna, Ciudad"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="laboral" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Cargo *
                  </Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Operador, Supervisor, etc."
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Departamento
                  </Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Operaciones, Seguridad, etc."
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Tipo de Contrato
                  </Label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    disabled={isViewMode}
                  >
                    <option value="indefinido">Indefinido</option>
                    <option value="plazo-fijo">Plazo Fijo</option>
                    <option value="honorarios">Honorarios</option>
                  </select>
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Inicio
                  </Label>
                  <Input
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    type="date"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Estado
                  </Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    disabled={isViewMode}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergencia" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <User className="w-4 h-4 inline mr-1" />
                    Contacto de Emergencia
                  </Label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="María Pérez (Esposa)"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono de Emergencia
                  </Label>
                  <Input
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="+56 9 8765 4321"
                    type="tel"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-700">
            {!isViewMode ? (
              <>
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {formMode === 'create' ? 'Crear Trabajador' : 'Guardar Cambios'}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setFormMode('edit')} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
